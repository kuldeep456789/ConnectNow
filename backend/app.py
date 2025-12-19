import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from extensions import socketio
from routes import api_bp
from db import init_db

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default_secret_key')

CORS(app)
socketio.init_app(app)

app.register_blueprint(api_bp, url_prefix='/api')

@socketio.on('join-room')
def handle_join_room(data):
    from flask_socketio import join_room
    room = data.get('room')
    if room:
        join_room(room)
        print(f"User joined room: {room}")

@socketio.on('signal')
def handle_signal(data):
    from flask_socketio import emit
    room = data.get('room')
    if room:
        emit('signal', data, to=room, include_self=False)

@socketio.on('gesture-action')
def handle_gesture_action(data):
    from flask_socketio import emit
    room = data.get('room')
    if room:
        emit('gesture-action', data, to=room, include_self=False)

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/')
def index():
    return "ConnectNow Backend with Signaling is running!"

if __name__ == '__main__':
    if os.environ.get('FLASK_ENV') == 'development':
        init_db()
    
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"ConnectNow Backend is starting on port {port}...")
    socketio.run(app, host='0.0.0.0', port=port, debug=debug_mode)