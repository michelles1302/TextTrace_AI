import sys
import os
from pathlib import Path

# Force stdout UTF-8 encoding on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.ml.text_processor import extract_text_from_file, normalize_whitespace, segment_into_sentences
from backend.ml.similarity_engine import SimilarityEngine
from backend.database.connection import init_db
from backend.database.crud import save_analysis, get_all_history, get_analysis_by_id
from backend.services.report_generator import generate_pdf_report

def run_tests():
    print("=== TEST 1: Database Initialization ===")
    init_db()
    print("[SUCCESS] SQLite database initialized successfully.")

    print("\n=== TEST 2: Reading Demo Files ===")
    demo_dir = Path(__file__).parent.parent / "demo_data"
    para_a_path = demo_dir / "paraphrase_a.txt"
    para_b_path = demo_dir / "paraphrase_b.txt"
    
    with open(para_a_path, "rb") as f:
        text_a = extract_text_from_file(f.read(), "paraphrase_a.txt")
    with open(para_b_path, "rb") as f:
        text_b = extract_text_from_file(f.read(), "paraphrase_b.txt")

    print(f"Doc A extracted {len(text_a)} chars.")
    print(f"Doc B extracted {len(text_b)} chars.")
    assert len(text_a) > 0 and len(text_b) > 0

    print("\n=== TEST 3: NLP Similarity Pipeline (all-MiniLM-L6-v2) ===")
    engine = SimilarityEngine()
    results = engine.analyze("paraphrase_a.txt", text_a, "paraphrase_b.txt", text_b)

    metrics = results["metrics"]
    print("Calculated Metrics:")
    print(f"  - Overall Similarity: {metrics['overall_similarity']}%")
    print(f"  - Exact Match %: {metrics['exact_match_pct']}%")
    print(f"  - Paraphrase %: {metrics['paraphrase_pct']}%")
    print(f"  - High Similarity %: {metrics['high_similarity_pct']}%")
    print(f"  - Original %: {metrics['original_pct']}%")
    print(f"  - Flagged Suspicious Pairs: {len(results['suspicious_matches'])}")
    print(f"\nAI Summary:\n{results['analysis_summary']}")

    assert metrics["paraphrase_pct"] > 0 or metrics["overall_similarity"] > 50, "Paraphrase test failed to detect similarity"

    print("\n=== TEST 4: SQLite Database CRUD Operations ===")
    analysis_id = save_analysis("paraphrase_a.txt", "paraphrase_b.txt", results)
    print(f"Saved analysis with ID: {analysis_id}")
    
    history = get_all_history()
    print(f"History records found: {len(history)}")
    assert len(history) > 0

    retrieved = get_analysis_by_id(analysis_id)
    assert retrieved is not None
    print("[SUCCESS] Successfully retrieved analysis from database.")

    print("\n=== TEST 5: PDF Report Generation ===")
    pdf_bytes = generate_pdf_report(results)
    print(f"Generated PDF Report ({len(pdf_bytes)} bytes).")
    assert len(pdf_bytes) > 1000

    print("\nALL BACKEND & NLP PIPELINE TESTS PASSED CLEANLY!")

if __name__ == "__main__":
    run_tests()
