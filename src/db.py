import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'clientmon.db')

def get_connection():
    return sqlite3.connect(DB_PATH)

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS whitelisted_ips (
            ip TEXT PRIMARY KEY,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def get_whitelisted_ips() -> set:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT ip FROM whitelisted_ips")
    rows = cursor.fetchall()
    conn.close()
    return {row[0] for row in rows}

def add_whitelisted_ip(ip: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT OR IGNORE INTO whitelisted_ips (ip) VALUES (?)", (ip,))
    conn.commit()
    conn.close()
