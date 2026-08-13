from typing import List, Dict, Any, Optional
from .knowledge_base import KnowledgeBase
from .embeddings import VectorIndexer

class RAGRetriever:
    """
    RAG Retriever combining Vector Similarity search with Structured Menu Filters.
    Ensures zero hallucination by returning verified Knowledge Base records.
    """
    def __init__(self, knowledge_base: Optional[KnowledgeBase] = None):
        self.kb = knowledge_base or KnowledgeBase()
        self.indexer = VectorIndexer()
        self.indexer.fit_documents(self.kb.documents)

    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        category_filter: Optional[str] = None,
        max_price: Optional[float] = None,
        dietary_filter: Optional[str] = None,
        caffeine_filter: Optional[str] = None,
        temperature_filter: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Retrieve relevant products, store documents, and pairing rules matching query & filters.
        """
        # 1. Semantic Vector Search
        search_results = self.indexer.search(query, top_k=top_k * 2)

        # 2. Filter menu items according to explicit metadata criteria
        filtered_products = []
        retrieved_docs = []

        for doc, score in search_results:
            if doc["type"] == "product":
                product = doc["data"]
                
                # Check price constraint
                if max_price is not None and product.get("price", 0) > max_price:
                    continue

                # Check category constraint
                if category_filter and category_filter.lower() != "all":
                    if category_filter.lower() not in product.get("category", "").lower():
                        continue

                # Check dietary constraint
                if dietary_filter and dietary_filter.lower() != "none":
                    dietary_list = [d.lower() for d in product.get("dietary_info", [])]
                    if dietary_filter.lower() not in dietary_list:
                        continue

                # Check caffeine constraint
                if caffeine_filter and caffeine_filter.lower() != "any":
                    if product.get("caffeine_level", "").lower() != caffeine_filter.lower():
                        continue

                # Check temperature constraint
                if temperature_filter and temperature_filter.lower() != "any":
                    if product.get("temperature", "").lower() != temperature_filter.lower():
                        continue

                filtered_products.append(product)
                retrieved_docs.append({
                    "id": doc["id"],
                    "title": doc["title"],
                    "score": round(score, 4),
                    "type": "product",
                    "content": doc["content"]
                })

            else:
                # Store info or FAQ doc
                retrieved_docs.append({
                    "id": doc["id"],
                    "title": doc["title"],
                    "score": round(score, 4),
                    "type": doc["type"],
                    "content": doc["content"]
                })

        # Trim to requested top_k
        filtered_products = filtered_products[:top_k]

        return {
            "query": query,
            "products": filtered_products,
            "documents": retrieved_docs[:top_k],
            "total_retrieved": len(retrieved_docs)
        }

    def search_menu(
        self,
        query: str = "",
        category: Optional[str] = None,
        max_price: Optional[float] = None,
        dietary: Optional[str] = None,
        caffeine: Optional[str] = None,
        temperature: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Filter menu products by structured parameters."""
        all_prods = self.kb.get_all_products()
        results = []

        query_lower = query.lower() if query else ""

        for p in all_prods:
            if max_price is not None and p.get("price", 0) > max_price:
                continue
            if category and category.lower() != "all" and category.lower() not in p.get("category", "").lower():
                continue
            if dietary and dietary.lower() != "none":
                dietary_list = [d.lower() for d in p.get("dietary_info", [])]
                if dietary.lower() not in dietary_list:
                    continue
            if caffeine and caffeine.lower() != "any" and p.get("caffeine_level", "").lower() != caffeine.lower():
                continue
            if temperature and temperature.lower() != "any" and p.get("temperature", "").lower() != temperature.lower():
                continue
            
            # Text matching if query provided
            if query_lower:
                text = f"{p.get('name')} {p.get('category')} {p.get('description')} {' '.join(p.get('flavor_profile', []))}".lower()
                if query_lower not in text:
                    continue

            results.append(p)

        return results

    def get_pairings(self, product_id: str) -> List[Dict[str, Any]]:
        """Retrieve paired products for a given product ID."""
        prod = self.kb.get_product_by_id(product_id)
        if not prod:
            return []

        pairing_ids = prod.get("pairings", [])
        pairings = []
        for p_id in pairing_ids:
            p = self.kb.get_product_by_id(p_id)
            if p:
                pairings.append(p)
        return pairings
