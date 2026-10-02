"""
embeddings.py
Embedding generation engine with automatic fallback between
SentenceTransformers (dense neural embeddings) and scikit-learn TF-IDF (lexical-vector embeddings).
"""

import numpy as np
from typing import List

_MODEL = None
_FALLBACK_VECTORIZER = None

def get_sentence_transformer():
    global _MODEL
    if _MODEL is not None:
        return _MODEL
    try:
        from sentence_transformers import SentenceTransformer
        _MODEL = SentenceTransformer('all-MiniLM-L6-v2')
        return _MODEL
    except Exception as e:
        # SentenceTransformers not available or offline; will use TF-IDF fallback
        return None

def compute_embeddings(texts: List[str]) -> np.ndarray:
    """
    Computes vector embeddings for a list of text strings.
    Returns normalized float32 numpy array.
    """
    if not texts:
        return np.empty((0, 384), dtype=np.float32)

    model = get_sentence_transformer()
    if model is not None:
        embeddings = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
        return embeddings

    # Fallback to TF-IDF vectorizer
    global _FALLBACK_VECTORIZER
    from sklearn.feature_extraction.text import TfidfVectorizer
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
    tfidf_matrix = vectorizer.fit_transform(texts)
    dense = tfidf_matrix.toarray().astype(np.float32)
    # L2 normalize
    norms = np.linalg.norm(dense, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return dense / norms
