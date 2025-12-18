from flask import Blueprint, request, jsonify
from extensions import socketio
import jwt
from datetime import datetime
import os
import hashlib
from db import get_db_connection
from psycopg2.extras import Json
from functools import wraps
from werkzeug.utils import secure_filename

api_bp = Blueprint('api', __name__)

SECRET_KEY = os.environ.get('SECRET_KEY', 'default_secret_key')


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user_id = data['user_id']
        except Exception as e:
            return jsonify({'message': 'Token is invalid!'}), 401
        
        return f(current_user_id, *args, **kwargs)
    return decorated


@api_bp.route('/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    display_name = data.get('displayName')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    uid = hashlib.md5(email.encode()).hexdigest()

    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (uid, email, password_hash, display_name) VALUES (%s, %s, %s, %s) RETURNING id",
            (uid, email, password_hash, display_name)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'message': 'User created successfully', 'uid': uid}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    password_hash = hashlib.sha256(password.encode()).hexdigest()

    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500

    cur = conn.cursor()
    cur.execute("SELECT id, uid, email, display_name, photo_url FROM users WHERE email = %s AND password_hash = %s", (email, password_hash))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if user:





        

        user_id = user[0]
        user_uid = user[1]
        
        token = jwt.encode({
            'user_id': user_id,
            'uid': user_uid,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, SECRET_KEY, algorithm="HS256")
        
        return jsonify({
            'token': token,
            'user': {
                'uid': user[1],
                'email': user[2],
                'displayName': user[3],
                'photoURL': user[4]
            }
        })
    
    return jsonify({'message': 'Invalid credentials'}), 401



@api_bp.route('/users/me', methods=['GET'])
@token_required
def get_current_user(current_user_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    cur = conn.cursor()
    cur.execute("SELECT uid, email, display_name, photo_url FROM users WHERE id = %s", (current_user_id,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if user:
        return jsonify({
            'uid': user[0],
            'email': user[1],
            'displayName': user[2],
            'photoURL': user[3]
        })
    return jsonify({'message': 'User not found'}), 404

@api_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user_id):
    data = request.get_json()
    display_name = data.get('displayName')
    photo_url = data.get('photoURL')
    
    if not display_name and not photo_url:
        return jsonify({'message': 'No fields to update'}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor()
        

        update_fields = []
        params = []
        
        if display_name:
            update_fields.append("display_name = %s")
            params.append(display_name)
        
        if photo_url:
            update_fields.append("photo_url = %s")
            params.append(photo_url)
        
        params.append(current_user_id)
        
        query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s RETURNING uid, email, display_name, photo_url"
        cur.execute(query, params)
        updated_user = cur.fetchone()
        
        conn.commit()
        cur.close()
        conn.close()
        
        if updated_user:
            return jsonify({
                'message': 'Profile updated successfully',
                'user': {
                    'uid': updated_user[0],
                    'email': updated_user[1],
                    'displayName': updated_user[2],
                    'photoURL': updated_user[3]
                }
            })
        
        return jsonify({'message': 'User not found'}), 404
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@api_bp.route('/users/search', methods=['GET'])
@token_required
def search_users(current_user_id):
    query = request.args.get('q', '')
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    cur = conn.cursor()
    
    if not query:
        cur.execute("SELECT uid, email, display_name, photo_url FROM users ORDER BY created_at DESC LIMIT 50")
    else:

        cur.execute("SELECT uid, email, display_name, photo_url FROM users WHERE email ILIKE %s OR display_name ILIKE %s", (f'%{query}%', f'%{query}%'))
    
    users = cur.fetchall()
    cur.close()
    conn.close()

    result = []
    for u in users:
        result.append({
            'uid': u[0],
            'email': u[1],
            'displayName': u[2],
            'photoURL': u[3]
        })
    return jsonify(result)

@api_bp.route('/users/batch', methods=['POST'])
@token_required
def get_users_batch(current_user_id):
    data = request.get_json()
    uids = data.get('uids', [])
    
    if not uids:
        return jsonify([])

    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    cur = conn.cursor()

    cur.execute("SELECT uid, email, display_name, photo_url FROM users WHERE uid = ANY(%s)", (uids,))
    users = cur.fetchall()
    cur.close()
    conn.close()

    result = []
    for u in users:
        result.append({
            'uid': u[0],
            'email': u[1],
            'displayName': u[2],
            'photoURL': u[3]
        })
    return jsonify(result)



@api_bp.route('/conversations', methods=['POST'])
@token_required
def create_conversation(current_user_id):
    data = request.get_json()
    recipient_uid = data.get('recipientUid')

    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    cur = conn.cursor()


    cur.execute("SELECT id FROM users WHERE uid = %s", (recipient_uid,))
    recipient = cur.fetchone()
    
    if not recipient:
        return jsonify({'message': 'Recipient not found'}), 404
    
    recipient_id = recipient[0]



    cur.execute("INSERT INTO conversations (last_message) VALUES ('') RETURNING id")
    conversation_id = cur.fetchone()[0]

    cur.execute("INSERT INTO conversation_participants (conversation_id, user_id) VALUES (%s, %s)", (conversation_id, current_user_id))
    cur.execute("INSERT INTO conversation_participants (conversation_id, user_id) VALUES (%s, %s)", (conversation_id, recipient_id))
    
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'conversationId': conversation_id}), 201

@api_bp.route('/conversations', methods=['GET'])
@token_required
def get_conversations(current_user_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    cur = conn.cursor()
    

    cur.execute("""
        SELECT c.id, c.last_message, c.updated_at 
        FROM conversations c
        JOIN conversation_participants cp ON c.id = cp.conversation_id
        WHERE cp.user_id = %s
        ORDER BY c.updated_at DESC
    """, (current_user_id,))
    
    conversations = cur.fetchall()
    result = []
    
    for conv in conversations:
        conv_id = conv[0]

        cur.execute("""
            SELECT u.uid, u.email, u.display_name, u.photo_url
            FROM users u
            JOIN conversation_participants cp ON u.id = cp.user_id
            WHERE cp.conversation_id = %s AND u.id != %s
        """, (conv_id, current_user_id))
        
        other_user = cur.fetchone()
        
        user_info = {}
        if other_user:
            user_info = {
                'uid': other_user[0],
                'email': other_user[1],
                'displayName': other_user[2],
                'photoURL': other_user[3]
            }

        result.append({
            'conversationId': conv_id,
            'lastMessage': conv[1],
            'userInfo': user_info 
        })

    cur.close()
    conn.close()
    return jsonify(result)

@api_bp.route('/conversations/<int:conversation_id>', methods=['GET'])
@token_required
def get_conversation_details(current_user_id, conversation_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    cur = conn.cursor()
    

    cur.execute("SELECT 1 FROM conversation_participants WHERE conversation_id = %s AND user_id = %s", (conversation_id, current_user_id))
    if not cur.fetchone():
        return jsonify({'message': 'Unauthorized'}), 403

    cur.execute("SELECT id, last_message, updated_at FROM conversations WHERE id = %s", (conversation_id,))
    conv = cur.fetchone()
    
    if not conv:
        return jsonify({'message': 'Conversation not found'}), 404


    cur.execute("""
        SELECT u.uid, u.email, u.display_name, u.photo_url
        FROM users u
        JOIN conversation_participants cp ON u.id = cp.user_id
        WHERE cp.conversation_id = %s
    """, (conversation_id,))
    
    participants = cur.fetchall()
    users_info = []
    


    participant_uids = []
    
    for p in participants:
        participant_uids.append(p[0])
        users_info.append({
            'uid': p[0],
            'email': p[1],
            'displayName': p[2],
            'photoURL': p[3]
        })

    cur.close()
    conn.close()

    return jsonify({
        'conversationId': conv[0],
        'lastMessage': conv[1],
        'users': participant_uids,
        'participants': users_info
    })

@api_bp.route('/conversations/<int:conversation_id>', methods=['DELETE'])
@token_required
def delete_conversation(current_user_id, conversation_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    cur = conn.cursor()
    

    cur.execute("SELECT 1 FROM conversation_participants WHERE conversation_id = %s AND user_id = %s", (conversation_id, current_user_id))
    if not cur.fetchone():
        return jsonify({'message': 'Unauthorized'}), 403





    
    try:
        cur.execute("DELETE FROM messages WHERE conversation_id = %s", (conversation_id,))
        cur.execute("DELETE FROM conversation_participants WHERE conversation_id = %s", (conversation_id,))
        cur.execute("DELETE FROM conversations WHERE id = %s", (conversation_id,))
        
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({'message': f'Failed to delete: {str(e)}'}), 500
    finally:
        cur.close()
        conn.close()

    return jsonify({'message': 'Conversation deleted successfully'}), 200



@api_bp.route('/messages/<int:conversation_id>', methods=['GET'])
@token_required
def get_messages(current_user_id, conversation_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    cur = conn.cursor()
    

    cur.execute("SELECT 1 FROM conversation_participants WHERE conversation_id = %s AND user_id = %s", (conversation_id, current_user_id))
    if not cur.fetchone():
        return jsonify({'message': 'Unauthorized'}), 403

    cur.execute("""
        SELECT m.id, m.sender_id, m.content, m.type, m.created_at, u.uid, m.reply_to, m.reactions, m.is_deleted, m.file_meta
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = %s
        ORDER BY m.created_at ASC
    """, (conversation_id,))
    
    messages = cur.fetchall()
    result = []
    for msg in messages:

        




        
        result.append({
            'id': msg[0],
            'senderId': msg[5],
            'content': msg[2],
            'type': msg[8] and 'removed' or msg[3],
            'createdAt': msg[4].isoformat(),
            'replyTo': msg[6],
            'reactions': msg[7],
            'file': msg[9],
            'isDeleted': msg[8]
        })

    cur.close()
    conn.close()
    return jsonify(result)

@api_bp.route('/messages', methods=['POST'])
@token_required
def send_message(current_user_id):
    data = request.get_json()
    conversation_id = data.get('conversationId')
    content = data.get('content')
    msg_type = data.get('type', 'text')

    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    cur = conn.cursor()

    reply_to = data.get('replyTo')
    file_meta = data.get('file', None)


    cur.execute(
        "INSERT INTO messages (conversation_id, sender_id, content, type, reply_to, file_meta) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
        (conversation_id, current_user_id, content, msg_type, reply_to, Json(file_meta) if file_meta else None)
    )
    

    cur.execute("UPDATE conversations SET last_message = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s", (content, conversation_id))

    conn.commit()
    cur.close()
    conn.close()


    socketio.emit('new-message', {'conversationId': conversation_id}, to=str(conversation_id))

    return jsonify({'status': 'sent'}), 201


@api_bp.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    if file:
        filename = secure_filename(file.filename)

        import uuid
        ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        new_filename = f"{uuid.uuid4()}.{ext}"
        save_path = os.path.join(os.getcwd(), 'uploads', new_filename)
        file.save(save_path)
        


        return jsonify({'url': f"/uploads/{new_filename}"})

    return jsonify({'message': 'Upload failed'}), 500

@api_bp.route('/messages/<int:message_id>', methods=['DELETE'])
@token_required
def delete_message(current_user_id, message_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    cur = conn.cursor()
    

    cur.execute("SELECT sender_id FROM messages WHERE id = %s", (message_id,))
    msg = cur.fetchone()
    if not msg:
        return jsonify({'message': 'Message not found'}), 404
        
    if msg[0] != current_user_id:

        return jsonify({'message': 'Unauthorized'}), 403


    cur.execute("UPDATE messages SET is_deleted = TRUE WHERE id = %s", (message_id,))
    conn.commit()
    cur.close()
    conn.close()
    
    return jsonify({'status': 'deleted'}), 200

@api_bp.route('/messages/<int:message_id>/reactions', methods=['POST'])
@token_required
def toggle_reaction(current_user_id, message_id):
    data = request.get_json()
    reaction = data.get('reaction')
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    cur = conn.cursor()
    

    cur.execute("SELECT uid FROM users WHERE id = %s", (current_user_id,))
    user_uid = cur.fetchone()[0]


    cur.execute("SELECT reactions FROM messages WHERE id = %s", (message_id,))
    res = cur.fetchone()
    if not res:
        return jsonify({'message': 'Message not found'}), 404
    
    current_reactions = res[0] or {}
    







    
    if current_reactions.get(user_uid) == reaction:
        del current_reactions[user_uid]
    else:
        current_reactions[user_uid] = reaction
        
    cur.execute("UPDATE messages SET reactions = %s WHERE id = %s", (Json(current_reactions), message_id))
    conn.commit()
    cur.close()
    conn.close()
    
    return jsonify({'status': 'updated', 'reactions': current_reactions}), 200