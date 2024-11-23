from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import os
import threading
from dotenv import load_dotenv
from supabase import create_client, Client
from main import sampling_loop  # Your sampling loop

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


app = Flask(__name__)
CORS(app)  # Enable CORS for requests from the Chrome extension


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
        # Insert the data into Supabase
        insert_response = supabase.table("event_listeners").insert({
            "event": event,
            "url": url,
            "interval": interval,
            "notification_type": notification_type,
            "status": "pending",
        }).execute()

        if insert_response.data:
            listener_id = insert_response.data[0]["id"]
            print(f"Inserted Listener ID: {listener_id}")

            # Respond to the frontend immediately
            response = {"message": "Listener added successfully", "listener_id": listener_id}

            # Start a new thread to handle the async task
            threading.Thread(target=run_async_task, args=(listener_id, event)).start()

            return jsonify(response), 200
        else:
            return jsonify({"error": "Failed to insert data into Supabase"}), 500
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


def run_async_task(listener_id, prompt):
    """
    Run the async task in a new event loop inside a thread.
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(process_listener_task(listener_id, prompt))
    finally:
        loop.close()


async def process_listener_task(listener_id, prompt):
    """
    Process the task asynchronously after inserting into the database.
    """
    try:
        # Call the sampling loop and capture the final response
        final_result = await sampling_loop(prompt)

        # Update the listener status to "completed" with the final result
        update_listener_status(listener_id, "completed", final_result)
    except Exception as e:
        print(f"Error processing listener {listener_id}: {e}")
        # Update status to failed in case of an error
        update_listener_status(listener_id, "failed", str(e))


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

        # Check if the update was successful
        if update_response.data:
            print(f"Successfully updated listener {listener_id} with status '{status}' and result:\n{result}")
        elif update_response.error:
            print(f"Failed to update listener {listener_id}: {update_response.error}")
        else:
            print(f"Unknown issue updating listener {listener_id}")
    except Exception as e:
        print(f"Error updating listener {listener_id}: {e}")



if __name__ == '__main__':
    port = 5001
    print(f"Server is running on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port)
