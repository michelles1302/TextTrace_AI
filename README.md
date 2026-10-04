# TEXTTRACE AI

> **"Trace similarity. Detect paraphrasing. Protect originality."**

TEXTTRACE AI is a production-grade, AI-powered Plagiarism and Paraphrase Analyzer. Unlike simple keyword/string matchers or fake mockup dashboards, TEXTTRACE AI executes a **real NLP sentence embedding pipeline** using PyTorch and `all-MiniLM-L6-v2` to compute actual semantic and lexical similarity scores.

---

## 🌟 Key Features

- **Real Sentence-Level Semantic Analysis**: Encodes sentences into 384-dimensional dense vectors and evaluates cosine matrix similarity to flag paraphrasing even when vocabulary differs completely.
- **Lexical Overlap Detection**: Uses TF-IDF character $n$-gram comparisons and string sequence ratios to isolate exact text copy-pasting.
- **Interactive Similarity Heatmap**: High-density matrix displaying sentence-by-sentence similarity scores with cell-click deep inspection.
- **Suspicious Match Explorer**: Filterable review panel isolating Exact Matches, Paraphrases, and High Similarity passages with automated explainability tags.
- **Synchronized Passage Inspector**: Dual document viewer with color-coded highlighting (Red = Exact, Orange = High Sim, Yellow = Paraphrase, Blue = Related). Clicking a sentence in Document A automatically highlights and scrolls to its match target in Document B.
- **Exportable PDF Reports**: Generates professional PDF analysis reports with executive metrics, AI summaries, flagged sentence pairs, and methodology disclosures.
- **Local SQLite Analysis History**: Reopen past analyses instantly with persistent local storage.
- **No Cloud / No API Keys Required**: 100% local CPU-friendly processing powered by PyTorch & SentenceTransformers.

---

## 🔬 Core NLP Pipeline Architecture

```
Document A & Document B
         ↓
Text Extraction (PDF / DOCX / TXT)
         ↓
Whitespace Normalization & Sentence Segmentation
         ↓
Dense Embeddings Generation (all-MiniLM-L6-v2)
         ↓
Matrix Calculation
├── Semantic Cosine Similarity Matrix (NxM)
└── Lexical TF-IDF n-gram Matrix (NxM)
         ↓
Match Classification Engine
├── EXACT MATCH         (Semantic >= 0.95 & Lexical >= 0.85 OR Exact Text)
├── HIGH SIMILARITY     (Semantic >= 0.82)
├── POSSIBLE PARAPHRASE (Semantic >= 0.65 & Lexical < 0.72)
├── RELATED             (Semantic >= 0.48)
└── ORIGINAL            (Semantic < 0.48)
         ↓
Document Metric Aggregation & AI Summary Generation
         ↓
SQLite Storage & Report Export
```

### Calculation Methodology

1. **Sentence Embeddings**: Each sentence $S_i$ is mapped to an L2-normalized vector $v_i \in \mathbb{R}^{384}$.
2. **Cosine Similarity**: $S_{ij} = v_{A,i} \cdot v_{B,j}^T$.
3. **Overall Similarity Metric**: Computed using the average of top-matching sentence similarities across Document A, providing a realistic measure of overall document coverage without skewing from un-matched original sections.
4. **Percentage Distribution**: Sentences are categorized into mutually exclusive similarity indicators, showing exact proportions for Exact Match, Paraphrased, High Similarity, Related, and Original content.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, Uvicorn
- **Machine Learning / NLP**: `sentence-transformers`, `torch` (PyTorch CPU/CUDA), `scikit-learn`, `numpy`
- **Document Processing**: `PyMuPDF` (fitz) for PDF, `python-docx` for DOCX, TXT support
- **Database**: SQLite3
- **PDF Report Generation**: `reportlab`

---

## 🚀 Windows Quick Start & Running Locally

### Option 1: One-Click Launch (`run.bat`)

Double-click `run.bat` in the project root directory. It will automatically:
1. Create Python virtual environment (`.venv`)
2. Install Python backend requirements
3. Install React frontend dependencies
4. Start FastAPI server at `http://localhost:8000`
5. Start Vite frontend server at `http://localhost:5173`
6. Open your default web browser to `http://localhost:5173`

---

### Option 2: Manual Windows Setup Commands

#### 1. Clone & Extract Project
Open Command Prompt (`cmd`) or PowerShell in `TextTrace_AI`:

```cmd
cd d:\Projects\DL\TextTrace_AI
```

#### 2. Backend Setup & Startup

```cmd
:: Create virtual environment
python -m venv .venv

:: Activate virtual environment
.venv\Scripts\activate

:: Install backend dependencies
pip install -r backend\requirements.txt

:: Start FastAPI Backend
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend API will be live at `http://localhost:8000` (API docs at `http://localhost:8000/docs`).

#### 3. Frontend Setup & Startup

Open a **second terminal window** in `TextTrace_AI`:

```cmd
cd frontend
npm install
npm run dev
```

The web application will open at `http://localhost:5173`.

---

## 📁 Project Structure

```
TextTrace_AI/
│
├── backend/
│   ├── main.py                  # FastAPI entry point & CORS configuration
│   ├── requirements.txt         # Python dependencies
│   ├── test_backend.py          # Automated backend & NLP test suite
│   ├── api/
│   │   ├── routes.py            # API routes (/analyze, /history, /report, etc.)
│   │   └── schemas.py           # Pydantic request/response models
│   ├── ml/
│   │   ├── embedding_model.py   # SentenceTransformer all-MiniLM-L6-v2 singleton
│   │   ├── similarity_engine.py # Sentence matching & cosine matrix engine
│   │   ├── text_processor.py    # PDF/DOCX/TXT extractor & sentence splitter
│   │   └── thresholds.py       # Classification thresholds & explainability logic
│   ├── database/
│   │   ├── connection.py        # SQLite database connection & schema setup
│   │   └── crud.py              # Save & fetch analysis history
│   └── services/
│       └── report_generator.py  # ReportLab PDF report builder
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main application router & state manager
│   │   ├── main.tsx             # React DOM root entry
│   │   ├── index.css            # Tailwind CSS v4 & custom styles
│   │   ├── types.ts             # TypeScript interface definitions
│   │   ├── api.ts               # API client methods
│   │   └── components/
│   │       ├── Navbar.tsx       # Brand header, server status, history button
│   │       ├── DocumentUploader.tsx # Drag & drop panels & demo data presets
│   │       ├── AnalysisProgress.tsx # Real-time analysis progress stepper
│   │       ├── ResultsDashboard.tsx # Metrics ring gauges & executive summary
│   │       ├── SimilarityHeatmap.tsx# Sentence similarity matrix grid
│   │       ├── SuspiciousMatchExplorer.tsx # Filterable flagged passage cards
│   │       ├── DocumentViewer.tsx   # Interactive passage inspector with auto-focus
│   │       ├── VisualSummary.tsx    # Histogram & classification breakdown charts
│   │       ├── HistoryModal.tsx     # Saved analysis history modal
│   │       └── SentenceDetailModal.tsx # Matrix cell detail inspector
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
│
├── demo_data/                   # Sample test files (Exact, Paraphrase, Original)
│   ├── exact_match_a.txt
│   ├── exact_match_b.txt
│   ├── paraphrase_a.txt
│   ├── paraphrase_b.txt
│   └── original.txt
│
├── README.md
└── run.bat
```

---

## ⚡ API Endpoints Summary

- `GET  /api/health` : Server health status & PyTorch model load state.
- `POST /api/analyze` : Form upload (PDF/DOCX/TXT files or direct text) running complete NLP pipeline.
- `GET  /api/history` : Retrieves saved analyses list from local SQLite database.
- `GET  /api/analysis/{id}` : Retrieves full analysis results payload by ID.
- `GET  /api/report/{id}` : Downloads generated PDF report for an analysis ID.

---

## 📄 License

Developed for academic and professional plagiarism & paraphrase analysis.
