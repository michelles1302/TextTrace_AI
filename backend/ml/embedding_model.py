import logging
from typing import List
import numpy as np

logger = logging.getLogger("texttrace.embedding")

class EmbeddingModel:
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingModel, cls).__new__(cls)
        return cls._instance

    def load_model(self, model_name: str = "all-MiniLM-L6-v2"):
        if self._model is None:
            logger.info(f"Loading sentence-transformer model: {model_name}...")
            from sentence_transformers import SentenceTransformer
            import torch
            
            device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Using device for embeddings: {device}")
            self._model = SentenceTransformer(model_name, device=device)
            logger.info("SentenceTransformer model loaded successfully.")

    def get_embeddings(self, sentences: List[str], batch_size: int = 32) -> np.ndarray:
        if self._model is None:
            self.load_model()
            
        if not sentences:
            return np.empty((0, 384), dtype=np.float32)

        embeddings = self._model.encode(
            sentences,
            batch_size=batch_size,
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=True
        )
        return embeddings.astype(np.float32)

    @staticmethod
    def compute_cosine_similarity(embeddings_a: np.ndarray, embeddings_b: np.ndarray) -> np.ndarray:
        """
        Compute M x N cosine similarity matrix between embeddings_a and embeddings_b.
        Assuming normalized embeddings, cosine_sim = dot(embeddings_a, embeddings_b.T).
        """
        if embeddings_a.size == 0 or embeddings_b.size == 0:
            return np.zeros((embeddings_a.shape[0], embeddings_b.shape[0]), dtype=np.float32)
            
        sim_matrix = np.dot(embeddings_a, embeddings_b.T)
        # Clip to ensure valid float range [0.0, 1.0]
        return np.clip(sim_matrix, 0.0, 1.0)

# Global singleton accessor
def get_embedding_model() -> EmbeddingModel:
    model = EmbeddingModel()
    model.load_model()
    return model
