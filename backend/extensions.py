from flask_socketio import SocketIO

import os
allowed_origins = os.environ.get('ALLOWED_ORIGINS', '*').split(',')
socketio = SocketIO(cors_allowed_origins=allowed_origins)