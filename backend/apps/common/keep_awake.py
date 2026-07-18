import threading
import time
import requests
import logging

logger = logging.getLogger(__name__)

def ping_server():
    """
    Temporary script to ping the server every 10 minutes to prevent Render from
    sleeping during the 48-hour demo window.
    """
    # Using the tournaments endpoint as it's public and lightweight enough
    URL = "https://baokibao.onrender.com/api/tournaments/tournaments/"
    while True:
        try:
            time.sleep(600)  # Wait 10 minutes (600 seconds)
            response = requests.get(URL, timeout=10)
            logger.info(f"Keep-awake ping to {URL} - Status Code: {response.status_code}")
        except Exception as e:
            logger.error(f"Keep-awake ping failed: {str(e)}")

def start_keep_awake():
    """Starts the background thread as a daemon."""
    thread = threading.Thread(target=ping_server, daemon=True)
    thread.start()
    logger.info("Keep-awake background thread started for 48-hour demo.")
