import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    try:
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'), client_encoding='UTF8')
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def migrate_db():
    conn = get_db_connection()
    if not conn:
        print("Failed to connect to DB.")
        return

    try:
        cur = conn.cursor()
        
        cur.execute("ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to INTEGER;")
        
        cur.execute("ALTER TABLE messages ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::jsonb;")
        
        cur.execute("ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;")
        
        cur.execute("ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_meta JSONB DEFAULT NULL;")

        conn.commit()
        cur.close()
        conn.close()
        print("Database migration completed successfully.")
    except Exception as e:
        print(f"Error calculating migration: {e}")

if __name__ == "__main__":
    migrate_db()