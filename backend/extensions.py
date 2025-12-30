from flask_socketio import SocketIO

import os
default_origins = [
    'https://connect-now-lyart.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
]
allowed_origins = os.environ.get('ALLOWED_ORIGINS', '').split(',') if os.environ.get('ALLOWED_ORIGINS') else default_origins
socketio = SocketIO(cors_allowed_origins=allowed_origins)