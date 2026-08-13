import pytest
from app.rag.retriever import RAGRetriever

def test_rag_retrieval_products():
    retriever = RAGRetriever()
    res = retriever.retrieve("cold brew mocha chocolate", top_k=5)
    
    assert "products" in res
    assert len(res["products"]) > 0
    top_name = res["products"][0]["name"].lower()
    assert "cold" in top_name or "mocha" in top_name or "iced" in top_name

def test_rag_retrieval_price_filter():
    retriever = RAGRetriever()
    prods = retriever.search_menu(max_price=200)
    for p in prods:
        assert p["price"] <= 200

def test_rag_retrieval_dietary_filter():
    retriever = RAGRetriever()
    prods = retriever.search_menu(dietary="Vegan")
    for p in prods:
        d_lower = [d.lower() for d in p["dietary_info"]]
        assert "vegan" in d_lower
