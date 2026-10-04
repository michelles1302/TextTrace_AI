import io
import re
from typing import List, Dict, Any, Tuple

class TextProcessingError(Exception):
    pass

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """
    Extract raw text from PDF, DOCX, or TXT file bytes.
    Raises TextProcessingError if text cannot be extracted or if PDF is scanned.
    """
    filename_lower = filename.lower()
    
    if filename_lower.endswith(".pdf"):
        return _extract_from_pdf(file_bytes, filename)
    elif filename_lower.endswith(".docx"):
        return _extract_from_docx(file_bytes, filename)
    elif filename_lower.endswith(".txt"):
        return _extract_from_txt(file_bytes)
    else:
        raise TextProcessingError(f"Unsupported file format for '{filename}'. Only PDF, DOCX, and TXT are supported.")

def _extract_from_pdf(file_bytes: bytes, filename: str) -> str:
    try:
        import fitz  # PyMuPDF
    except ImportError:
        raise TextProcessingError("PyMuPDF (fitz) library is not installed.")
        
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text_parts = []
        page_count = len(doc)
        
        for page in doc:
            page_text = page.get_text("text")
            if page_text:
                text_parts.append(page_text.strip())
                
        full_text = "\n\n".join(text_parts).strip()
        
        # Check if PDF contains no extractable text
        if page_count > 0 and len(full_text) < 10:
            raise TextProcessingError(
                f"OCR required: The PDF '{filename}' appears to contain scanned images or no extractable text."
            )
            
        return full_text
    except TextProcessingError:
        raise
    except Exception as e:
        raise TextProcessingError(f"Failed to read PDF file '{filename}': {str(e)}")

def _extract_from_docx(file_bytes: bytes, filename: str) -> str:
    try:
        import docx
    except ImportError:
        raise TextProcessingError("python-docx library is not installed.")
        
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        full_text = "\n\n".join(paragraphs).strip()
        if not full_text:
            raise TextProcessingError(f"The document '{filename}' is empty or contains no text.")
        return full_text
    except TextProcessingError:
        raise
    except Exception as e:
        raise TextProcessingError(f"Failed to read DOCX file '{filename}': {str(e)}")

def _extract_from_txt(file_bytes: bytes) -> str:
    for encoding in ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']:
        try:
            text = file_bytes.decode(encoding).strip()
            if text:
                return text
        except UnicodeDecodeError:
            continue
    raise TextProcessingError("Could not decode text file with standard encodings.")

def normalize_whitespace(text: str) -> str:
    """
    Normalize consecutive spaces/tabs while preserving newline structures.
    """
    lines = text.splitlines()
    normalized_lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in lines]
    cleaned_lines = []
    blank_count = 0
    for line in normalized_lines:
        if not line:
            blank_count += 1
            if blank_count <= 2:
                cleaned_lines.append("")
        else:
            blank_count = 0
            cleaned_lines.append(line)
    return "\n".join(cleaned_lines).strip()

def segment_into_sentences(text: str) -> List[Dict[str, Any]]:
    """
    Segments document text into indexed sentences, preserving sentence boundaries and indices.
    Returns list of sentence dicts: {'index': int, 'paragraph_index': int, 'text': str, 'char_length': int}
    """
    normalized = normalize_whitespace(text)
    if not normalized:
        return []
    
    # Split paragraphs first to respect paragraph boundaries
    paragraphs = [p for p in normalized.split("\n\n") if p.strip()]
    
    sentence_list = []
    sentence_idx = 0

    # Fixed-width look-behind or split pattern
    # Match sentence terminators (. ! ?) followed by whitespace and capital letter / quote
    sentence_split_pattern = re.compile(r'(?<=[.!?])\s+(?=[A-Z0-9"“\'])')
    
    for p_idx, paragraph in enumerate(paragraphs):
        raw_sentences = sentence_split_pattern.split(paragraph)
        
        for raw in raw_sentences:
            cleaned = raw.strip()
            # Handle lines split by single newlines inside paragraph
            sub_sentences = [s.strip() for s in re.split(r'\n+', cleaned) if s.strip()]
            for s in sub_sentences:
                if len(s) > 1:  # ignore standalone punctuation or artifact characters
                    sentence_list.append({
                        "index": sentence_idx,
                        "paragraph_index": p_idx,
                        "text": s,
                        "char_length": len(s)
                    })
                    sentence_idx += 1

    return sentence_list
