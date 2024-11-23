from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import os
import threading
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from supabase import create_client, Client
from main import sampling_loop  # Your sampling loop

# Import resend
import resend

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Set Resend API key
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
resend.api_key = RESEND_API_KEY  # Correctly set the API key

app = Flask(__name__)
CORS(app)  # Enable CORS for requests from the Chrome extension

def calculate_next_trigger_time(interval):
    """
    Calculate the next trigger time based on the interval provided.
    """
    now = datetime.now(timezone.utc)
    if interval == "30-minutes":
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

def send_email_notification(to_email, subject, html_content):
    """
    Send an email notification using Resend.
    """
    try:
        response = resend.Emails.send({
            "from": "onboarding@resend.dev",  # Replace with your verified sender
            "to": "karandikarshreyash@gmail.com",  # Ensure the recipient is in a list
            "subject": subject,
            "html": html_content,
        })
        print(f"Email sent successfully: {response}")
        return response
    except Exception as e:
        print(f"Error sending email: {e}")
        return None

@app.route('/trigger', methods=['POST'])
def trigger():
    data = request.json
    print("Received payload:", data)

    # Extract data from the payload
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

            # Respond to the frontend immediately
            response = {"message": "Listener added successfully", "listener_id": listener_id}

            # Start a new thread to handle the async task
            threading.Thread(target=run_async_task, args=(listener_id, event, url)).start()

            return jsonify(response), 200
        else:
            return jsonify({"error": "Failed to insert data into Supabase"}), 500
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

def run_async_task(listener_id, event, url):
    """
    Run the async task in a new event loop inside a thread.
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(process_listener_task(listener_id, event, url))
    finally:
        loop.close()

async def process_listener_task(listener_id, event, url):
    """
    Process the task asynchronously after inserting into the database.
    """
    try:
        now = datetime.now(timezone.utc)

        # Update trigger status to "in_progress" and set last_triggered_at
        supabase.table("event_listeners").update({
            "trigger_status": "in_progress",
            "last_triggered_at": now.isoformat()
        }).eq("id", listener_id).execute()

        # Adjusted prompt to guide the assistant
        prompt = (
            f"Visit this website {url} and your task is to {event}. "
            "Carefully explore all visible sections, links, banners, and interactive elements on the page. "
            "Ensure you gather as much relevant information as possible related to the task. "
            "Do not navigate to external websites or perform searches outside this page. "
            "Once you have completed your task, start your response with 'Answer Type: positive' if the event occurred, "
            "'Answer Type: negative' if it did not occur, or 'Answer Type: neutral' if unsure. "
            "Then provide your detailed findings."
        )

        # Call the sampling loop and capture the final response
        final_result = await sampling_loop(prompt)

        # Check if the output indicates a positive response
        if "Answer Type: positive" in final_result:
            # Send email notification to a hardcoded email address for now
            to_email = "karandikarshreyash@gmail.com"
            subject = "Your Website Monitor Alert - Positive Result"
            html_content = f"""
            <p>Hello,</p>
            <p>The event you are monitoring has occurred:</p>
            <p><strong>Event:</strong> {event}</p>
            <p><strong>Result:</strong> {final_result}</p>
            <p>Visit the website for more details: <a href="{url}">{url}</a></p>
            <p>Best regards,<br>Your App Team</p>
            """

            # Send the email
            send_email_notification(to_email, subject, html_content)
            print("Email sent for positive result.")
        else:
            print("No email sent as the result is not positive.")

        # Update the listener status to "completed" with the final result
        update_listener_status(listener_id, "completed", final_result)

    except Exception as e:
        print(f"Error processing listener {listener_id}: {e}")


def update_listener_status(listener_id, status, result=None):
    """
    Update the status and result of a listener in the Supabase table.
    """
    try:
        update_data = {
            "status": status,
        }
        if result:
            update_data["result"] = result

        # Execute the update query
        update_response = supabase.table("event_listeners").update(update_data).eq("id", listener_id).execute()

        if update_response.data:
            print(f"Successfully updated listener {listener_id} with status '{status}' and result:\n{result}")
    except Exception as e:
        print(f"Error updating listener {listener_id}: {e}")

if __name__ == '__main__':
    port = 5001
    print(f"Server is running on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port)
