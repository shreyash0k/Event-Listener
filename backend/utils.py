import logging
from datetime import datetime, timedelta, timezone
import resend

logger = logging.getLogger(__name__)

def calculate_next_trigger_time(interval):
    """
    Calculate the next trigger time based on the interval provided.

    Args:
        interval (str): The interval string (e.g., '30-minutes', '1-hour').

    Returns:
        datetime: The next trigger time as a datetime object.

    Raises:
        ValueError: If an unknown interval is provided.
    """
    now = datetime.now(timezone.utc)
    intervals = {
        "30-minutes": timedelta(minutes=30),
        "1-hour": timedelta(hours=1),
        "12-hours": timedelta(hours=12),
        "1-day": timedelta(days=1),
        "1-week": timedelta(weeks=1),
    }
    if interval in intervals:
        return now + intervals[interval]
    else:
        raise ValueError(f"Unknown interval: {interval}")

def send_email_notification(to_email, subject, html_content):
    """
    Send an email notification using Resend.

    Args:
        to_email (str): The recipient's email address.
        subject (str): The subject of the email.
        html_content (str): The HTML content of the email.

    Returns:
        dict or None: The response from the email service, or None if an error occurred.
    """
    try:
        response = resend.Emails.send({
            "from": "onboarding@resend.dev",  # Replace with your verified sender
            "to": [to_email],  # Ensure the recipient is in a list
            "subject": subject,
            "html": html_content,
        })
        logger.info(f"Email sent successfully: {response}")
        return response
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return None
