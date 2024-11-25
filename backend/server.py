# Standard library imports
import threading
import asyncio
from datetime import datetime, timedelta, timezone
import logging  # Import the logging module

# Third-party imports
from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from supabase import create_client, Client
import resend  # Add this import

# Local application imports
from main import sampling_loop  # Your sampling loop
from config import Config

# helper functions
from utils import calculate_next_trigger_time
from utils import send_email_notification

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

def create_app():
    """
    Factory function to create and configure the Flask app.

    Returns:
        Flask app instance.
    """
    # Initialize Flask app
    app = Flask(__name__)
    CORS(app)  # Enable CORS for requests from the Chrome extension

    # Initialize Supabase client
    supabase_client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

    # Set Resend API key
    resend.api_key = Config.RESEND_API_KEY

    # Register routes
    register_routes(app, supabase_client)

    return app

def register_routes(app, supabase):
    """
    Register route handlers with the Flask app.

    Args:
        app (Flask): The Flask app instance.
        supabase (Client): The Supabase client instance.
    """

    @app.route('/manage-listeners', methods=['GET'])
    def manage_listeners():
        """
        Fetch all listeners from the 'event_listeners' table and return them as JSON.

        Returns:
            Response: JSON response containing listeners or an error message.
        """
        try:
            response = supabase.table("event_listeners").select("*").execute()
            if response.data:
                return jsonify({"listeners": response.data}), 200
            else:
                return jsonify({"message": "No listeners found."}), 200
        except Exception as e:
            logger.error(f"Error fetching listeners: {e}")
            return jsonify({"error": str(e)}), 500

    @app.route('/trigger', methods=['POST'])
    def trigger():
        """
        Handle trigger requests from the frontend.

        Expects JSON data with 'event', 'url', 'interval', and 'notificationType'.

        Returns:
            Response: JSON response indicating success or failure.
        """
        data = request.json
        logger.info(f"Received payload: {data}")

        # Extract data from the payload
        event = data.get("event")
        url = data.get("url")
        interval = data.get("interval")
        notification_type = data.get("notificationType")

        if not event or not url:
            abort(400, description="Event description and URL are required")

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
                logger.info(f"Inserted Listener ID: {listener_id}")

                # Respond to the frontend immediately
                response = {"message": "Listener added successfully", "listener_id": listener_id}

                # Start a new thread to handle the async task
                threading.Thread(
                    target=run_async_task,
                    args=(listener_id, event, url, supabase)
                ).start()

                return jsonify(response), 200
            else:
                logger.error("Failed to insert data into Supabase")
                return jsonify({"error": "Failed to insert data into Supabase"}), 500
        except Exception as e:
            logger.error(f"Error in trigger endpoint: {e}")
            return jsonify({"error": str(e)}), 500



def run_async_task(listener_id, event, url, supabase):
    """
    Run the async task in a new event loop inside a thread.

    Args:
        listener_id (int): The ID of the listener.
        event (str): The event description.
        url (str): The URL to monitor.
        supabase (Client): The Supabase client instance.
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(process_listener_task(listener_id, event, url, supabase))
    finally:
        loop.close()

async def process_listener_task(listener_id, event, url, supabase):
    """
    Process the listener task asynchronously.

    Args:
        listener_id (int): The ID of the listener.
        event (str): The event description.
        url (str): The URL to monitor.
        supabase (Client): The Supabase client instance.
    """
    try:
        now = datetime.now(timezone.utc)

        # Update trigger status to "in_progress" and set last_triggered_at
        supabase.table("event_listeners").update({
            "trigger_status": "in_progress",
            "last_triggered_at": now.isoformat()
        }).eq("id", listener_id).execute()

        # Construct the prompt for the sampling loop
        prompt = (
            f"Visit this {url} and your task is to {event}. "
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
            logger.info(f"Email sent for positive result for listener {listener_id}.")
        else:
            logger.info(f"No email sent for listener {listener_id} as the result is not positive.")

        # Update the listener status to "completed" with the final result
        update_listener_status(listener_id, "completed", final_result, supabase)

    except Exception as e:
        logger.error(f"Error processing listener {listener_id}: {e}")
        # Update the listener status to "failed"
        update_listener_status(listener_id, "failed", str(e), supabase)

def update_listener_status(listener_id, status, result, supabase):
    """
    Update the status and result of a listener in the Supabase table.

    Args:
        listener_id (int): The ID of the listener.
        status (str): The new status ('completed', 'failed', etc.).
        result (str): The result or error message.
        supabase (Client): The Supabase client instance.
    """
    try:
        update_data = {
            "status": status,
            "result": result
        }

        # Execute the update query
        update_response = supabase.table("event_listeners").update(update_data).eq("id", listener_id).execute()

        if update_response.data:
            logger.info(f"Successfully updated listener {listener_id} with status '{status}'.")
    except Exception as e:
        logger.error(f"Error updating listener {listener_id}: {e}")

if __name__ == '__main__':
    app = create_app()
    port = 5001
    logger.info(f"Server is running on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port)
