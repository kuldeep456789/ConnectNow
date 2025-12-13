import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from routes import api_bp
from db import init_db

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS - Allow all origins for now (dev mode)
CORS(app)

# Register Blueprints
app.register_blueprint(api_bp, url_prefix='/api')

# Static file serving for uploads (if using local storage)
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/')
def index():
    return "Chatify Backend is running!"

if __name__ == '__main__':
    # Initialize DB table on startup (simple approach for MVP - ensuring tables exist locally)
    # In production, we might run this via a separate command or keep it here if we want auto-init on start (careful with concurrency)
    # For Render, better to use the build command or a pre-start script, but this doesn't hurt if idempotent.
    if os.environ.get('FLASK_ENV') == 'development':
        init_db()
    
    port = int(os.environ.get('PORT', 5000))
    # Never run with debug=True in production!
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
