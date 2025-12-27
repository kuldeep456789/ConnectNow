@api_bp.route('/conversations', methods=['GET'])
@token_required
def get_conversations(current_user_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    cur = conn.cursor()
    
    # Get current user's UID for filter
    cur.execute("SELECT uid FROM users WHERE id = %s", (current_user_id,))
    current_uid = cur.fetchone()[0]

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
            WHERE cp.conversation_id = %s
        """, (conv_id,))
        
        participants = cur.fetchall()
        participant_uids = [p[0] for p in participants]
        
        # Find the other user (if 1-on-1) or just use the first non-me user for groups
        other_user_data = next((p for p in participants if p[0] != current_uid), participants[0] if participants else None)
        
        user_info = {}
        if other_user_data:
            user_info = {
                'uid': other_user_data[0],
                'email': other_user_data[1],
                'displayName': other_user_data[2],
                'photoURL': other_user_data[3]
            }

        result.append({
            'conversationId': conv_id,
            'lastMessage': conv[1],
            'updatedAt': conv[2].isoformat() if conv[2] else None,
            'users': participant_uids,
            'userInfo': user_info 
        })

    cur.close()
    conn.close()
    return jsonify(result)
