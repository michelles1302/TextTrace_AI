from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class TextAnalysisRequest(BaseModel):
    doc_a_name: Optional[str] = Field("Document A", description="Name of Document A")
    doc_a_text: str = Field(..., min_length=1, description="Raw text of Document A")
    doc_b_name: Optional[str] = Field("Document B", description="Name of Document B")
    doc_b_text: str = Field(..., min_length=1, description="Raw text of Document B")

class HealthCheckResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str

class HistoryItem(BaseModel):
    id: str
    doc_a_name: str
    doc_b_name: str
    created_at: str
    overall_similarity: float
    exact_match_pct: float
    paraphrase_pct: float
    original_pct: float
