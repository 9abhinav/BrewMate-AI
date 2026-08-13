import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class VectorIndexer:
    """
    TF-IDF Vector Indexer for fast, lightweight, and deterministic document embedding matching.
    """
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words='english',
            sublinear_tf=True
        )
        self.doc_vectors = None
        self.documents: List[Dict[str, Any]] = []

    def fit_documents(self, documents: List[Dict[str, Any]]):
        """Fit vectorizer on document content texts."""
        self.documents = documents
        texts = [doc["content"] for doc in documents]
        if texts:
            self.doc_vectors = self.vectorizer.fit_transform(texts)

    def search(self, query: str, top_k: int = 5) -> List[Tuple[Dict[str, Any], float]]:
        """Compute cosine similarity of query against document index."""
        if self.doc_vectors is None or not self.documents:
            return []

        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.doc_vectors).flatten()

        top_indices = np.argsort(similarities)[::-1][:top_k]
        results = []
        for idx in top_indices:
            score = float(similarities[idx])
            # Include documents with reasonable score or top fallback
            results.append((self.documents[idx], score))
            
        return results
