import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from backend.database.connection import get_db_connection

def save_analysis(doc_a_name: str, doc_b_name: str, results: Dict[str, Any]) -> str:
    analysis_id = str(uuid.uuid4())
    created_at = datetime.now().isoformat()
    metrics = results.get("metrics", {})
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO analysis_history (
            id, doc_a_name, doc_b_name, created_at,
            overall_similarity, exact_match_pct, paraphrase_pct, original_pct,
            results_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            analysis_id,
            doc_a_name,
            doc_b_name,
            created_at,
            metrics.get("overall_similarity", 0.0),
            metrics.get("exact_match_pct", 0.0),
            metrics.get("paraphrase_pct", 0.0),
            metrics.get("original_pct", 0.0),
            json.dumps(results)
        )
    )
    conn.commit()
    conn.close()
    return analysis_id

def get_all_history() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id, doc_a_name, doc_b_name, created_at,
               overall_similarity, exact_match_pct, paraphrase_pct, original_pct
        FROM analysis_history
        ORDER BY created_at DESC
        """
    )
    rows = cursor.fetchall()
    conn.close()
    
    history = []
    for row in rows:
        history.append({
            "id": row["id"],
            "doc_a_name": row["doc_a_name"],
            "doc_b_name": row["doc_b_name"],
            "created_at": row["created_at"],
            "overall_similarity": row["overall_similarity"],
            "exact_match_pct": row["exact_match_pct"],
            "paraphrase_pct": row["paraphrase_pct"],
            "original_pct": row["original_pct"]
        })
    return history

def get_analysis_by_id(analysis_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT results_json FROM analysis_history WHERE id = ?", (analysis_id,)
    )
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return json.loads(row["results_json"])
    return None
