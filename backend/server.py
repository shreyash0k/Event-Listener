from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import os
import threading
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from supabase import create_client, Client
from apscheduler.schedulers.background import BackgroundScheduler  # Added for scheduling
from main import sampling_loop  # Your sampling loop

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__)
CORS(app)  # Enable CORS for requests from the Chrome extension

# Initialize the scheduler
scheduler = BackgroundScheduler()
scheduler.start()

def calculate_next_trigger_time(interval):
    now = datetime.now(timezone.utc)
    if interval == "3-minutes":
        return now + timedelta(minutes=3)
    elif interval == "5-minutes":
        return now + timedelta(minutes=5)
    elif interval == "10-minutes":
        return now + timedelta(minutes=10)
    elif interval == "20-minutes":
        return now + timedelta(minutes=20)
    elif interval == "30-minutes":
        return now + timedelta(minutes=30)
    elif interval == "1-hour":
        return now + timedelta(hours=1)
    elif interval == "12-hours":
        return now + timedelta(hours=12)
    elif interval == "1-day":
        return now + timedelta(days=1)
    elif interval == "1-week":
        return now + timedelta(weeks=1)
    else:
        raise ValueError(f"Unknown interval: {interval}")


@app.route('/trigger', methods=['POST'])
def trigger():
    """
    Endpoint for adding new listeners.
    """
    data = request.json
    print("Received payload:", data)

    event = data.get("event")
    url = data.get("url")
    interval = data.get("interval")
    notification_type = data.get("notificationType")

    if not event or not url:
        return jsonify({"error": "Event description and URL are required"}), 400

    try:
        now = datetime.now(timezone.utc)
        next_trigger_time = calculate_next_trigger_time(interval)

        # Insert the data into Supabase
        insert_response = supabase.table("event_listeners").insert({
            "event": event,
            "url": url,
            "interval": interval,
            "notification_type": notification_type,
            "status": "pending",
            "last_triggered_at": now.isoformat(),
            "next_trigger_at": next_trigger_time.isoformat(),
            "retry_count": 0,
            "max_retries": 3,
            "trigger_status": "pending",
        }).execute()

        if insert_response.data:
            listener_id = insert_response.data[0]["id"]
            print(f"Inserted Listener ID: {listener_id}")
            return jsonify({"message": "Listener added successfully", "listener_id": listener_id}), 200
        else:
            return jsonify({"error": "Failed to insert data into Supabase"}), 500
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

def fetch_ready_events():
    """
    Fetch events that are ready for processing based on `next_trigger_at`.
    """
    now = datetime.now(timezone.utc).isoformat()  # Ensure this is in ISO 8601 format
    response = supabase.table("event_listeners") \
        .select("*") \
        .filter("next_trigger_at", "lte", now) \
        .filter("status", "eq", "pending") \
        .execute()
    return response.data if response.data else []


async def process_listener_task(listener):
    """
    Process the task asynchronously, evaluate the agent response, and update the table accordingly.
    """
    listener_id = listener["id"]
    event = listener["event"]
    url = listener["url"]

    try:
        print(f"Processing listener {listener_id}...")

        # Update trigger status to "in_progress"
        supabase.table("event_listeners").update({
            "trigger_status": "in_progress",
            "last_triggered_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", listener_id).execute()

        # Build the prompt
        prompt = (
            f"Visit this website {url} and your task is to {event}. "
            "Carefully explore all visible sections, links, banners, and interactive elements on the page. "
            "Provide your response in a clear paragraph with either the word 'positive' or 'negative'."
        )

        # Call the sampling loop and capture the response
        final_result = await sampling_loop(prompt)

        # Normalize the AI response
        response_text = final_result.strip().lower()

        # Check for "positive" or "negative" in the response
        if "positive" in response_text:
            # Task achieved, mark as completed
            print(f"Listener {listener_id} achieved: {response_text}")
            supabase.table("event_listeners").update({
                "status": "completed",
                "result": {"response": response_text},
                "next_trigger_at": None  # No further triggers for completed tasks
            }).eq("id", listener_id).execute()
        elif "negative" in response_text:
            # Task not achieved, reset to pending with updated next_trigger_at
            print(f"Listener {listener_id} not achieved: {response_text}")
            next_trigger_at = calculate_next_trigger_time(listener["interval"]).isoformat()
            supabase.table("event_listeners").update({
                "status": "pending",
                "result": {"response": response_text},
                "next_trigger_at": next_trigger_at
            }).eq("id", listener_id).execute()
        else:
            # Unexpected response format
            raise ValueError(f"Unexpected response format: {response_text}")

    except Exception as e:
        print(f"Error processing listener {listener_id}: {e}")
        retry_count = listener["retry_count"] + 1

        if retry_count >= listener["max_retries"]:
            supabase.table("event_listeners").update({
                "status": "failed",
                "error_log": str(e)
            }).eq("id", listener_id).execute()
        else:
            supabase.table("event_listeners").update({
                "retry_count": retry_count,
                "trigger_status": "retrying",
                "next_trigger_at": calculate_next_trigger_time("30-minutes").isoformat()
            }).eq("id", listener_id).execute()

def scheduled_task():
    """
    Periodically check the database for ready listeners and process them.
    """
    events = fetch_ready_events()
    if not events:
        print("No ready events to process.")
        return

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    tasks = [process_listener_task(event) for event in events]
    loop.run_until_complete(asyncio.gather(*tasks))
    loop.close()

# Schedule the task to run every minute
scheduler.add_job(scheduled_task, 'interval', minutes=1)

if __name__ == '__main__':
    port = 5001
    try:
        print(f"Server is running on http://127.0.0.1:{port}")
        app.run(host='0.0.0.0', port=port)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
