import re
import math
from typing import List, Dict, Any, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from difflib import SequenceMatcher

from backend.ml.embedding_model import get_embedding_model
from backend.ml.thresholds import classify_match, get_match_explanation, MatchCategory
from backend.ml.text_processor import segment_into_sentences, normalize_whitespace

def compute_lexical_matrix(sentences_a: List[str], sentences_b: List[str]) -> np.ndarray:
    """
    Computes lexical similarity matrix between sentences_a and sentences_b using TF-IDF + SequenceMatcher.
    """
    n_a = len(sentences_a)
    n_b = len(sentences_b)
    if n_a == 0 or n_b == 0:
        return np.zeros((n_a, n_b), dtype=np.float32)
        
    lexical_matrix = np.zeros((n_a, n_b), dtype=np.float32)
    
    # Combined corpus for TF-IDF
    corpus = sentences_a + sentences_b
    try:
        vectorizer = TfidfVectorizer(analyzer='char_wb', ngram_range=(3, 5), lowercase=True)
        tfidf = vectorizer.fit_transform(corpus)
        tfidf_a = tfidf[:n_a]
        tfidf_b = tfidf[n_a:]
        tfidf_sim = (tfidf_a * tfidf_b.T).toarray()
    except Exception:
        tfidf_sim = np.zeros((n_a, n_b), dtype=np.float32)

    # Calculate hybrid score with difflib SequenceMatcher for small sentences
    for i in range(n_a):
        sa = sentences_a[i].lower()
        for j in range(n_b):
            sb = sentences_b[j].lower()
            if sa == sb:
                lexical_matrix[i, j] = 1.0
            else:
                seq_ratio = SequenceMatcher(None, sa, sb).ratio()
                tf_score = float(tfidf_sim[i, j])
                lexical_matrix[i, j] = max(seq_ratio, tf_score)
                
    return np.clip(lexical_matrix, 0.0, 1.0)

def is_exact_string_match(str_a: str, str_b: str) -> bool:
    norm_a = re.sub(r'[^\w\s]', '', str_a.lower()).strip()
    norm_b = re.sub(r'[^\w\s]', '', str_b.lower()).strip()
    return norm_a == norm_b and len(norm_a) > 0

class SimilarityEngine:
    def __init__(self):
        self.embedding_model = get_embedding_model()

    def analyze(
        self,
        doc_a_name: str,
        doc_a_text: str,
        doc_b_name: str,
        doc_b_text: str
    ) -> Dict[str, Any]:
        """
        Executes full sentence-level semantic & lexical plagiarism analysis.
        """
        # Step 1: Segment text into sentences
        sents_a_meta = segment_into_sentences(doc_a_text)
        sents_b_meta = segment_into_sentences(doc_b_text)
        
        texts_a = [s["text"] for s in sents_a_meta]
        texts_b = [s["text"] for s in sents_b_meta]

        if not texts_a or not texts_b:
            return self._build_empty_result(doc_a_name, doc_b_name, sents_a_meta, sents_b_meta)

        # Step 2: Generate Sentence Embeddings
        embeddings_a = self.embedding_model.get_embeddings(texts_a)
        embeddings_b = self.embedding_model.get_embeddings(texts_b)

        # Step 3: Compute Semantic & Lexical Matrices (N x M)
        semantic_matrix = self.embedding_model.compute_cosine_similarity(embeddings_a, embeddings_b)
        lexical_matrix = compute_lexical_matrix(texts_a, texts_b)

        # Step 4: Sentence-level matching & classification for Document A
        matches_a = []
        category_counts = {
            MatchCategory.EXACT_MATCH: 0,
            MatchCategory.HIGH_SIMILARITY: 0,
            MatchCategory.POSSIBLE_PARAPHRASE: 0,
            MatchCategory.RELATED: 0,
            MatchCategory.ORIGINAL: 0
        }

        suspicious_matches = []

        for i, meta_a in enumerate(sents_a_meta):
            text_a = meta_a["text"]
            
            # Find best candidate sentence in Doc B
            best_b_idx = int(np.argmax(semantic_matrix[i, :]))
            best_sem_score = float(semantic_matrix[i, best_b_idx])
            best_lex_score = float(lexical_matrix[i, best_b_idx])
            text_b = sents_b_meta[best_b_idx]["text"]
            
            exact_match = is_exact_string_match(text_a, text_b)
            category = classify_match(best_sem_score, best_lex_score, exact_match)
            explanation = get_match_explanation(category, best_sem_score, best_lex_score)

            category_counts[category] += 1

            match_info = {
                "source_index": i,
                "target_index": best_b_idx,
                "source_text": text_a,
                "target_text": text_b,
                "semantic_similarity": round(best_sem_score, 4),
                "lexical_similarity": round(best_lex_score, 4),
                "classification": category.value,
                "explanation": explanation
            }
            matches_a.append(match_info)

            # Collect suspicious matches (Exact, Paraphrase, High Similarity)
            if category in [MatchCategory.EXACT_MATCH, MatchCategory.HIGH_SIMILARITY, MatchCategory.POSSIBLE_PARAPHRASE]:
                suspicious_matches.append(match_info)

        # Step 5: Document level metric calculations
        total_sents = len(sents_a_meta)
        
        exact_pct = round((category_counts[MatchCategory.EXACT_MATCH] / total_sents) * 100, 1) if total_sents > 0 else 0.0
        high_sim_pct = round((category_counts[MatchCategory.HIGH_SIMILARITY] / total_sents) * 100, 1) if total_sents > 0 else 0.0
        paraphrase_pct = round((category_counts[MatchCategory.POSSIBLE_PARAPHRASE] / total_sents) * 100, 1) if total_sents > 0 else 0.0
        related_pct = round((category_counts[MatchCategory.RELATED] / total_sents) * 100, 1) if total_sents > 0 else 0.0
        original_pct = round((category_counts[MatchCategory.ORIGINAL] / total_sents) * 100, 1) if total_sents > 0 else 0.0

        # Calculate overall similarity using average of top-K sentence similarities
        top_k_scores = [m["semantic_similarity"] for m in matches_a]
        top_k_scores.sort(reverse=True)
        
        # Consider top matching proportion
        k = max(1, math.ceil(len(top_k_scores) * 0.75))
        overall_similarity = round(float(np.mean(top_k_scores[:k])) * 100, 1) if top_k_scores else 0.0

        # Step 6: Generate dynamic textual summary
        analysis_summary = self._generate_analysis_summary(
            doc_a_name=doc_a_name,
            doc_b_name=doc_b_name,
            overall_similarity=overall_similarity,
            exact_pct=exact_pct,
            paraphrase_pct=paraphrase_pct,
            high_sim_pct=high_sim_pct,
            suspicious_count=len(suspicious_matches)
        )

        # Sort suspicious matches by semantic similarity descending
        suspicious_matches.sort(key=lambda x: x["semantic_similarity"], reverse=True)

        # Build response structure
        return {
            "document_a_name": doc_a_name,
            "document_b_name": doc_b_name,
            "metrics": {
                "overall_similarity": overall_similarity,
                "exact_match_pct": exact_pct,
                "high_similarity_pct": high_sim_pct,
                "paraphrase_pct": paraphrase_pct,
                "related_pct": related_pct,
                "original_pct": original_pct,
                "total_sentences_a": len(sents_a_meta),
                "total_sentences_b": len(sents_b_meta),
            },
            "sentences_a": sents_a_meta,
            "sentences_b": sents_b_meta,
            "matches_a": matches_a,
            "suspicious_matches": suspicious_matches,
            "similarity_matrix": [[round(float(val), 4) for val in row] for row in semantic_matrix],
            "analysis_summary": analysis_summary
        }

    def _generate_analysis_summary(
        self,
        doc_a_name: str,
        doc_b_name: str,
        overall_similarity: float,
        exact_pct: float,
        paraphrase_pct: float,
        high_sim_pct: float,
        suspicious_count: int
    ) -> str:
        summary = f"Comparative analysis between '{doc_a_name}' and '{doc_b_name}' reveals an overall semantic similarity of {overall_similarity}%.\n"
        
        if suspicious_count == 0:
            summary += f"No significant textual duplication or paraphrasing detected. '{doc_a_name}' appears substantially original relative to '{doc_b_name}'."
        else:
            summary += f"Identified {suspicious_count} suspicious passage(s). "
            details = []
            if exact_pct > 0:
                details.append(f"{exact_pct}% of analyzed content exhibits exact textual overlap")
            if paraphrase_pct > 0:
                details.append(f"{paraphrase_pct}% indicates potential paraphrasing with distinct vocabulary")
            if high_sim_pct > 0:
                details.append(f"{high_sim_pct}% shows strong conceptual similarity")
                
            summary += ", while ".join(details) + "."
            
        return summary

    def _build_empty_result(self, doc_a_name, doc_b_name, sents_a, sents_b):
        return {
            "document_a_name": doc_a_name,
            "document_b_name": doc_b_name,
            "metrics": {
                "overall_similarity": 0.0,
                "exact_match_pct": 0.0,
                "high_similarity_pct": 0.0,
                "paraphrase_pct": 0.0,
                "related_pct": 0.0,
                "original_pct": 100.0,
                "total_sentences_a": len(sents_a),
                "total_sentences_b": len(sents_b),
            },
            "sentences_a": sents_a,
            "sentences_b": sents_b,
            "matches_a": [],
            "suspicious_matches": [],
            "similarity_matrix": [],
            "analysis_summary": "Insufficient text content provided to conduct similarity analysis."
        }
