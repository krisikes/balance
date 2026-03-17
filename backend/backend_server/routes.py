from flask import Blueprint, request, jsonify, current_app
from urllib.parse import urlparse
import os
from functools import wraps
import time
from .logger import logger
from .config import config

# Create a Blueprint instance
main = Blueprint('main', __name__)

# Simple in-memory rate limiting
rate_limit_store = {}

def rate_limit(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        ip = request.remote_addr
        current_time = time.time()
        
        if ip in rate_limit_store:
            if current_time - rate_limit_store[ip]['timestamp'] < 60:  # 1 minute window
                if rate_limit_store[ip]['count'] >= config['default'].API_RATE_LIMIT:
                    logger.warning(f'Rate limit exceeded for IP: {ip}')
                    return jsonify({'error': 'Rate limit exceeded'}), 429
                rate_limit_store[ip]['count'] += 1
            else:
                rate_limit_store[ip] = {'count': 1, 'timestamp': current_time}
        else:
            rate_limit_store[ip] = {'count': 1, 'timestamp': current_time}
        
        return f(*args, **kwargs)
    return decorated_function

PORNOGRAPHIC_KEYWORDS = [
    "sex", "porn", "adult", "xxx", "nude", "explicit", # Basic English keywords
    "эротика", "порно", "pervmom", "xnxx", "xvideos", # Russian keywords
    "порнохаб", "порнхаб", "порнхаб", "порнхаб", # More Russian keywords
   
]
# Convert to a set for faster lookups
PORNOGRAPHIC_KEYWORDS_SET = set(keyword.lower() for keyword in PORNOGRAPHIC_KEYWORDS)

def validate_content_request(data):
    if not data:
        return False, "No data provided"
    if not isinstance(data, dict):
        return False, "Invalid data format"
    if 'url' not in data or not data['url']:
        return False, "URL is required"
    if 'text' not in data or not data['text']:
        return False, "Text content is required"
    return True, None

@main.route('/check_content', methods=['POST'])
@rate_limit
def check_content():
    """
    Receives URL and text from the browser extension and checks for
    pornographic content based on URL blacklist and keyword matching.
    """
    try:
        data = request.get_json()
        
        # Validate request data
        is_valid, error_message = validate_content_request(data)
        if not is_valid:
            logger.warning(f'Invalid request: {error_message}')
            return jsonify({'error': error_message}), 400

        url = data['url']
        text = data['text']
        
        logger.info(f'Processing content check for URL: {url}')

        # Check if data was received and contains either url or text
        if not url and not text:
             return jsonify({"error": "No URL or text provided"}), 400

        print(f"Received URL: {url}")
        print(f"Received text (first 100 chars): {text[:100]}...") # Log first 100 chars of text

        # --- Perform URL Blacklist Check ---
        is_url_pornographic = False
        # Access the blacklist loaded in __init__.py via current_app
        blacklist = current_app.blacklist

        if url:
            # Check if the full URL is in the blacklist
            if url in blacklist:
                is_url_pornographic = True
                print("URL matched directly in blacklist.")
            else:
                # Check if the domain is in the blacklist
                try:
                    domain = urlparse(url).netloc
                    if domain and (domain in blacklist):
                        is_url_pornographic = True
                        print(f"Domain '{domain}' matched in blacklist.")
                except Exception as e:
                    print(f"Error parsing URL for domain check: {e}")

        # --- Perform Keyword Check ---
        is_keyword_pornographic = False
        if text:
            # Convert text to lowercase for case-insensitive matching
            lower_text = text.lower()
            # Check if any keyword from the set is present in the text
            if any(keyword in lower_text for keyword in PORNOGRAPHIC_KEYWORDS_SET):
                is_keyword_pornographic = True
                print("Keyword match found in text.")

        # --- Determine Final Classification ---
        # If either the URL is blacklisted or a keyword is found, classify as pornographic
        final_classification = "pornographic" if is_url_pornographic or is_keyword_pornographic else "safe"

        print(f"Final Classification: {final_classification}\n---") # Add newline for clarity in logs

        response = {
            'classification': final_classification,
            'confidence': 0.95,
            'timestamp': time.time()
        }
        
        logger.info(f'Content check completed for URL: {url}')
        return jsonify(response)
        
    except Exception as e:
        logger.error(f'Error processing content check: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@main.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

# You can define other routes here if needed for future features
# For example, an endpoint for the options page to update settings
# @bp.route('/update_settings', methods=['POST'])
# def update_settings():
#    # ... logic to receive and save settings
#    pass