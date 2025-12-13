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
    # Initialize DB table on startup (simple approach for MVP)
    init_db()
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
