import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.database.connection import init_db
from backend.ml.embedding_model import get_embedding_model
from backend.api.routes import router as api_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("texttrace.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing TextTrace AI Backend...")
    # Initialize SQLite Database
    init_db()
    logger.info("Database initialized.")
    # Pre-load embedding model once
    logger.info("Pre-loading sentence-transformer model (all-MiniLM-L6-v2)...")
    get_embedding_model()
    logger.info("TextTrace AI Backend is ready.")
    yield
    logger.info("Shutting down TextTrace AI Backend.")

app = FastAPI(
    title="TEXTTRACE AI API",
    description="AI-Powered Plagiarism & Paraphrase Analyzer Backend",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Vite dev server & production frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
