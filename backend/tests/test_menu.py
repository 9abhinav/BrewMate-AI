import pytest
from app.rag.knowledge_base import KnowledgeBase

def test_knowledge_base_loading():
    kb = KnowledgeBase()
    products = kb.get_all_products()
    assert len(products) >= 25, f"Expected at least 25 products, got {len(products)}"
    
    # Check essential attributes on every product
    for p in products:
        assert "id" in p
        assert "name" in p
        assert "price" in p
        assert "category" in p
        assert "caffeine_level" in p
        assert "temperature" in p
        assert "dietary_info" in p

def test_get_product_by_id():
    kb = KnowledgeBase()
    prod = kb.get_product_by_id("prod-016") # Iced Mocha
    assert prod is not None
    assert prod["name"] == "Iced Mocha"
    assert prod["price"] == 280

def test_store_info_loading():
    kb = KnowledgeBase()
    store = kb.get_store_info()
    assert store is not None
    assert "location" in store
    assert "hours text" not in store # structured
    assert len(store.get("faq", [])) >= 3
