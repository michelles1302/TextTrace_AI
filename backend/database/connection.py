import sqlite3
import os
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "texttrace_history.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analysis_history (
            id TEXT PRIMARY KEY,
            doc_a_name TEXT NOT NULL,
            doc_b_name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            overall_similarity REAL NOT NULL,
            exact_match_pct REAL NOT NULL,
            paraphrase_pct REAL NOT NULL,
            original_pct REAL NOT NULL,
            results_json TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()
