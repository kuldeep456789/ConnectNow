import random
import string
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, leave_room, emit

# Logging setup
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("connectnow-server")

# Flask + SocketIO setup
app = Flask(__name__)
app.config["SECRET_KEY"] = "dev-secret"
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")
rooms = {}  # Structure: {room_id: set(sids)}

# Generate unique meeting IDs
def generate_meeting_id(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


# ============================
# REST Endpoint
# ============================
@app.route("/create-meeting", methods=["POST"])
def create_meeting():
    meeting_id = generate_meeting_id()
    rooms[meeting_id] = set()
    log.info(f"✅ New meeting created: {meeting_id}")
    return jsonify({"meetingId": meeting_id})


# ============================
# SOCKET EVENTS
# ============================
@socketio.on("connect")
def handle_connect():
    log.info(f"⚡ Client connected: {request.sid}")


@socketio.on("disconnect")
def handle_disconnect():
    sid = request.sid
    for room, sids in list(rooms.items()):
        if sid in sids:
            sids.remove(sid)
            leave_room(room)
            emit("user-left", {"userId": sid}, room=room)
            log.info(f"👋 {sid} left room {room}")
            if not sids:
                rooms.pop(room)
                log.info(f"🗑️ Deleted empty room: {room}")
    log.info(f"❌ Client disconnected: {sid}")


# ============================
# JOIN ROOM
# ============================
@socketio.on("join-room")
def handle_join_room(room_id, user_id):
    sid = request.sid
    if not room_id:
        emit("error", {"message": "Missing room ID"})
        return

    rooms.setdefault(room_id, set()).add(sid)
    join_room(room_id)

    # Notify existing members
    emit("user-joined", user_id, room=room_id, include_self=False)
    log.info(f"✅ {sid} joined room {room_id} as {user_id}")


# ============================
# LEAVE ROOM
# ============================
@socketio.on("leave-room")
def handle_leave_room(room_id, user_id):
    sid = request.sid
    if room_id in rooms and sid in rooms[room_id]:
        rooms[room_id].remove(sid)
        leave_room(room_id)
        emit("user-left", user_id, room=room_id)
        log.info(f"👋 {sid} left room {room_id}")

        if not rooms[room_id]:
            rooms.pop(room_id)
            log.info(f"🗑️ Deleted empty room {room_id}")


# ============================
# WebRTC SIGNALING EVENTS
# ============================

# --- Regular video/audio ---
@socketio.on("offer")
def handle_offer(data):
    target = data.get("target")
    sdp = data.get("sdp")
    sender = data.get("sender")
    if target and sdp:
        emit("offer", {"sdp": sdp, "sender": sender}, room=target)
        log.info(f"📤 Offer sent from {sender} → {target}")


@socketio.on("answer")
def handle_answer(data):
    target = data.get("target")
    sdp = data.get("sdp")
    sender = data.get("sender")
    if target and sdp:
        emit("answer", {"sdp": sdp, "sender": sender}, room=target)
        log.info(f"📩 Answer sent from {sender} → {target}")


@socketio.on("candidate")
def handle_candidate(data):
    target = data.get("target")
    candidate = data.get("candidate")
    sender = data.get("sender")
    if target and candidate:
        emit("candidate", {"candidate": candidate, "sender": sender}, room=target)
        log.info(f"🧊 ICE candidate sent from {sender} → {target}")


# --- Screen sharing ---
@socketio.on("offer-screen")
def handle_offer_screen(data):
    target = data.get("target")
    sdp = data.get("sdp")
    sender = data.get("sender")
    if target and sdp:
        emit("offer-screen", {"sdp": sdp, "sender": sender}, room=target)
        log.info(f"🖥️ Screen Offer sent from {sender} → {target}")


@socketio.on("answer-screen")
def handle_answer_screen(data):
    target = data.get("target")
    sdp = data.get("sdp")
    sender = data.get("sender")
    if target and sdp:
        emit("answer-screen", {"sdp": sdp, "sender": sender}, room=target)
        log.info(f"✅ Screen Answer sent from {sender} → {target}")


@socketio.on("candidate-screen")
def handle_candidate_screen(data):
    target = data.get("target")
    candidate = data.get("candidate")
    sender = data.get("sender")
    if target and candidate:
        emit("candidate-screen", {"candidate": candidate, "sender": sender}, room=target)
        log.info(f"🧊 Screen ICE candidate sent from {sender} → {target}")


# ============================
# RUN SERVER
# ============================
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
