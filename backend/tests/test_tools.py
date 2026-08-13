import pytest
from app.rag.retriever import RAGRetriever
from app.agent.tools import AgentTools

@pytest.fixture
def tools():
    retriever = RAGRetriever()
    return AgentTools(retriever)

def test_tool_search_menu(tools):
    results = tools.search_menu(query="Latte", max_price=300)
    assert len(results) > 0
    assert any("latte" in p["name"].lower() for p in results)

def test_tool_get_product_details(tools):
    details = tools.get_product_details("prod-001")
    assert details is not None
    assert details["name"] == "Classic Espresso"

def test_tool_search_store_information(tools):
    docs = tools.search_store_information("What are your opening hours?")
    assert len(docs) > 0

def test_tool_check_availability(tools):
    avail = tools.check_availability("prod-012") # Signature Cold Brew
    assert avail["exists"] is True
    assert avail["available"] is True

def test_tool_calculate_order(tools):
    calc = tools.calculate_order([
        {"product_id": "prod-001", "quantity": 2, "size": "Regular"},
        {"product_id": "prod-025", "quantity": 1, "size": "Standard"}
    ])
    assert calc["subtotal"] > 0
    assert calc["tax"] == round(calc["subtotal"] * 0.05, 2)
    assert calc["total"] > calc["subtotal"]

def test_tool_get_pairings(tools):
    pairings = tools.get_pairings("prod-001") # Espresso
    assert len(pairings) > 0
