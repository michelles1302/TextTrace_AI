from enum import Enum

class MatchCategory(str, Enum):
    EXACT_MATCH = "EXACT MATCH"
    HIGH_SIMILARITY = "HIGH SIMILARITY"
    POSSIBLE_PARAPHRASE = "POSSIBLE PARAPHRASE"
    RELATED = "RELATED"
    ORIGINAL = "ORIGINAL"

# Thresholds for similarity classification
EXACT_SEMANTIC_THRESHOLD = 0.95
EXACT_LEXICAL_THRESHOLD = 0.85

HIGH_SIMILARITY_SEMANTIC_THRESHOLD = 0.82

PARAPHRASE_SEMANTIC_THRESHOLD = 0.65
PARAPHRASE_LEXICAL_MAX = 0.72

RELATED_SEMANTIC_THRESHOLD = 0.48

def classify_match(semantic_score: float, lexical_score: float, is_exact_text: bool) -> MatchCategory:
    """
    Classify sentence match based on semantic and lexical similarity scores.
    """
    if is_exact_text or (semantic_score >= EXACT_SEMANTIC_THRESHOLD and lexical_score >= EXACT_LEXICAL_THRESHOLD):
        return MatchCategory.EXACT_MATCH
    
    if semantic_score >= HIGH_SIMILARITY_SEMANTIC_THRESHOLD and lexical_score >= 0.70:
        return MatchCategory.HIGH_SIMILARITY
        
    if semantic_score >= PARAPHRASE_SEMANTIC_THRESHOLD and lexical_score < PARAPHRASE_LEXICAL_MAX:
        return MatchCategory.POSSIBLE_PARAPHRASE
        
    if semantic_score >= HIGH_SIMILARITY_SEMANTIC_THRESHOLD:
        return MatchCategory.HIGH_SIMILARITY

    if semantic_score >= RELATED_SEMANTIC_THRESHOLD:
        return MatchCategory.RELATED

    return MatchCategory.ORIGINAL

def get_match_explanation(category: MatchCategory, semantic_score: float, lexical_score: float) -> str:
    sem_pct = int(round(semantic_score * 100))
    lex_pct = int(round(lexical_score * 100))
    
    if category == MatchCategory.EXACT_MATCH:
        return f"Identical or near-identical wording identified ({sem_pct}% semantic, {lex_pct}% lexical match)."
    elif category == MatchCategory.HIGH_SIMILARITY:
        return f"Strong conceptual and phrasing overlap between passages ({sem_pct}% semantic, {lex_pct}% lexical)."
    elif category == MatchCategory.POSSIBLE_PARAPHRASE:
        return f"High semantic similarity ({sem_pct}%) with distinct wording ({lex_pct}% lexical), indicating potential paraphrasing."
    elif category == MatchCategory.RELATED:
        return f"Mild conceptual or contextual connection ({sem_pct}% semantic alignment)."
    else:
        return f"Distinct content with no significant similarity detected ({sem_pct}% semantic)."
