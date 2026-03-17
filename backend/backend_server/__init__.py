from flask import Flask, jsonify
from flask_cors import CORS
from .config import config
from .logger import logger
import os
import csv

# This is the application factory function
def create_app(config_name='default'):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize CORS
    CORS(app)
    
    # Register error handlers
    @app.errorhandler(400)
    def bad_request(error):
        logger.error(f'Bad request: {error}')
        return jsonify({'error': 'Bad request'}), 400

    @app.errorhandler(404)
    def not_found(error):
        logger.error(f'Not found: {error}')
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f'Server error: {error}')
        return jsonify({'error': 'Internal server error'}), 500

    # --- Load the blacklist from the CSV file ---
    # Initialize blacklist as a set for efficient lookups
    app.blacklist = set()
    # Construct the absolute path to the CSV file relative to this __init__.py file
    package_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(package_dir, 'data', 'porn_urls_subsets.csv') # Assuming data/porn_urls.csv

    try:
        with open(csv_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.reader(csvfile)
            # Assuming your CSV has a header row, skip it
            next(reader, None)
            # Assuming the URLs are in the first column (index 0)
            for row in reader:
                if row and len(row) > 0: # Ensure the row is not empty and has at least one column
                    url = row[0].strip()
                    if url: # Ensure the extracted url is not empty after stripping
                        app.blacklist.add(url)
        print(f"Loaded {len(app.blacklist)} URLs into the blacklist from {csv_path}.")
    except FileNotFoundError:
        print(f"Error: Blacklist CSV file not found at {csv_path}.")
    except Exception as e:
        print(f"Error reading blacklist CSV file: {e}")

    # ensure the instance folder exists (standard Flask practice for config)
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # --- Register Blueprints (for organizing routes) ---
    from .routes import main as main_blueprint
    app.register_blueprint(main_blueprint)

    # Create necessary directories
    os.makedirs('instance', exist_ok=True)
    os.makedirs('logs', exist_ok=True)

    logger.info('Application initialized successfully')
    return app
