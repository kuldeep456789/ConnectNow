import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    try:
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'), client_encoding='UTF8')
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def init_db():
    conn = get_db_connection()
    if not conn:
        print("Failed to connect to DB during initialization.")
        return

    try:
        cur = conn.cursor()
        
        # Create Users Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                uid VARCHAR(255) UNIQUE NOT NULL, -- To keep compatibility or just use UUID
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                display_name VARCHAR(255),
                photo_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Create Conversations Table
        # For simplicity, we'll store participant IDs in a text array or JSONB, 
        # but for a relational DB, a join table is better. 
        # Sticking to a simpler JSONB approach for "participants" to mimic the NoSQL structure slightly for ease,
        # OR better: a normalized design.
        # Let's go normalized: conversations table + conversation_participants table.
        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id SERIAL PRIMARY KEY,
                last_message TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS conversation_participants (
                conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                PRIMARY KEY (conversation_id, user_id)
            );
        """)

        # Create Messages Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
                sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                content TEXT,
                type VARCHAR(50) DEFAULT 'text', -- text, image, etc.
                reply_to INTEGER DEFAULT NULL,
                reactions JSONB DEFAULT '{}'::jsonb,
                file_meta JSONB DEFAULT NULL,
                is_deleted BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        conn.commit()
        cur.close()
        conn.close()
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing database: {e}")
