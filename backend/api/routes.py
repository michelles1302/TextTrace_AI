import os
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Response
from fastapi.responses import StreamingResponse

from backend.api.schemas import HealthCheckResponse, TextAnalysisRequest, HistoryItem
from backend.ml.text_processor import extract_text_from_file, TextProcessingError
from backend.ml.similarity_engine import SimilarityEngine
from backend.ml.embedding_model import get_embedding_model
from backend.database.crud import save_analysis, get_all_history, get_analysis_by_id
from backend.services.report_generator import generate_pdf_report

router = APIRouter(prefix="/api")
engine = SimilarityEngine()

@router.get("/health", response_model=HealthCheckResponse)
def health_check():
    model_instance = get_embedding_model()
    return HealthCheckResponse(
        status="healthy",
        model_loaded=model_instance._model is not None,
        version="1.0.0"
    )

@router.post("/analyze")
async def analyze_documents(
    doc_a_file: Optional[UploadFile] = File(None),
    doc_b_file: Optional[UploadFile] = File(None),
    doc_a_text: Optional[str] = Form(None),
    doc_b_text: Optional[str] = Form(None),
    doc_a_name: Optional[str] = Form(None),
    doc_b_name: Optional[str] = Form(None),
):
    """
    Accepts either file uploads (PDF, DOCX, TXT) or raw text input for Document A and Document B.
    Runs the complete NLP similarity pipeline.
    """
    # Process Document A
    text_a = ""
    name_a = doc_a_name or "Document A"
    
    if doc_a_file and doc_a_file.filename:
        name_a = doc_a_file.filename
        content_a = await doc_a_file.read()
        try:
            text_a = extract_text_from_file(content_a, name_a)
        except TextProcessingError as e:
            raise HTTPException(status_code=400, detail=str(e))
    elif doc_a_text:
        text_a = doc_a_text.strip()
        
    # Process Document B
    text_b = ""
    name_b = doc_b_name or "Document B"
    
    if doc_b_file and doc_b_file.filename:
        name_b = doc_b_file.filename
        content_b = await doc_b_file.read()
        try:
            text_b = extract_text_from_file(content_b, name_b)
        except TextProcessingError as e:
            raise HTTPException(status_code=400, detail=str(e))
    elif doc_b_text:
        text_b = doc_b_text.strip()

    if not text_a or not text_b:
        raise HTTPException(
            status_code=400,
            detail="Both Document A and Document B must contain non-empty text."
        )

    try:
        results = engine.analyze(name_a, text_a, name_b, text_b)
        analysis_id = save_analysis(name_a, name_b, results)
        results["id"] = analysis_id
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis pipeline error: {str(e)}")

@router.post("/analyze-json")
def analyze_documents_json(payload: TextAnalysisRequest):
    """
    JSON endpoint for raw text submission.
    """
    name_a = payload.doc_a_name or "Document A"
    name_b = payload.doc_b_name or "Document B"
    
    if not payload.doc_a_text.strip() or not payload.doc_b_text.strip():
        raise HTTPException(status_code=400, detail="Both documents must contain non-empty text.")
        
    try:
        results = engine.analyze(name_a, payload.doc_a_text, name_b, payload.doc_b_text)
        analysis_id = save_analysis(name_a, name_b, results)
        results["id"] = analysis_id
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@router.get("/history")
def list_history():
    return get_all_history()

@router.get("/analysis/{analysis_id}")
def get_analysis(analysis_id: str):
    analysis_data = get_analysis_by_id(analysis_id)
    if not analysis_data:
        raise HTTPException(status_code=404, detail=f"Analysis with ID '{analysis_id}' not found.")
    analysis_data["id"] = analysis_id
    return analysis_data

@router.get("/report/{analysis_id}")
def download_pdf_report(analysis_id: str):
    analysis_data = get_analysis_by_id(analysis_id)
    if not analysis_data:
        raise HTTPException(status_code=404, detail="Analysis record not found.")
        
    pdf_bytes = generate_pdf_report(analysis_data)
    filename = f"TextTrace_Analysis_{analysis_id[:8]}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
