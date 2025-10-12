# server.py
import random, string, logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, leave_room, emit

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("signaling-server")

app = Flask(__name__)
app.config["SECRET_KEY"] = "dev-secret"
CORS(app, resources={r"/*": {"origins": "*"}})

# eventlet not yet supported in Python 3.13 — use threading
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

rooms = {}

def generate_meeting_id(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@app.route("/create-meeting")
def create_meeting():
    mid = generate_meeting_id()
    rooms[mid] = set()
    return jsonify({"meetingId": mid})

@socketio.on("connect")
def handle_connect():
    log.info(f"Client connected: {request.sid}")

@socketio.on("disconnect")
def handle_disconnect():
    sid = request.sid
    for room, sids in list(rooms.items()):
        if sid in sids:
            sids.remove(sid)
            emit("peer-left", {"sid": sid}, room=room)
            if not sids:
                rooms.pop(room)
    log.info(f"Client disconnected: {sid}")

@socketio.on("join")
def handle_join(data):
    room = data.get("room")
    sid = request.sid
    if not room:
        emit("error", {"message": "No room id"})
        return
    join_room(room)
    rooms.setdefault(room, set()).add(sid)
    others = [s for s in rooms[room] if s != sid]
    emit("joined", {"room": room, "yourSid": sid, "others": others})
    emit("peer-joined", {"sid": sid}, room=room, include_self=False)

@socketio.on("signal")
def handle_signal(data):
    room = data.get("room")
    payload = data.get("payload")
    typ = data.get("type")
    to_sid = data.get("to")
    sid = request.sid
    if to_sid:
        emit("signal", {"from": sid, "type": typ, "payload": payload}, room=to_sid)
    else:
        emit("signal", {"from": sid, "type": typ, "payload": payload}, room=room, include_self=False)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
