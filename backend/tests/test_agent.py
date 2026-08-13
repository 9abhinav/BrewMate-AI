import pytest
from app.agent.agent import CoffeeShopRecommendationAgent
from app.models.schemas import CustomerProfile, ChatResponse

@pytest.fixture
def agent():
    return CoffeeShopRecommendationAgent()

def test_agent_intent_extraction(agent):
    profile = CustomerProfile(budget_max=300)
    intent = agent._extract_intent("I want a cold sweet chocolate drink under 250", profile)
    assert intent["temperature"] == "iced"
    assert intent["max_price"] == 250.0

def test_agent_query_processing_recommendation(agent):
    profile = CustomerProfile(
        name="Abhinav",
        budget_max=300,
        preferred_temperature="iced",
        favorite_flavors=["chocolate"]
    )
    res: ChatResponse = agent.process_query("What coffee do you recommend for me?", profile)
    
    assert res.message is not None
    assert len(res.message) > 20
    assert res.recommendation is not None
    assert res.recommendation.temperature == "iced"
    assert res.recommendation.price <= 300
    assert len(res.observability_trace) >= 4
    assert res.latency_ms >= 0

def test_agent_query_no_caffeine(agent):
    profile = CustomerProfile()
    res = agent.process_query("I want a drink without caffeine", profile)
    assert res.recommendation is not None
    assert res.recommendation.caffeine_level == "none"

def test_agent_query_store_info(agent):
    profile = CustomerProfile()
    res = agent.process_query("What are your store hours and location?", profile)
    assert "Hours" in res.message or "Location" in res.message or "store information" in res.message
