from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import (
    ChatRequest, ChatResponse, OrderCalculationRequest, OrderCalculationResponse,
    CustomerProfile
)
from app.agent.agent import CoffeeShopRecommendationAgent
from app.rag.retriever import RAGRetriever

router = APIRouter(prefix="/api")

# Instantiate retriever and agent singletons
retriever = RAGRetriever()
agent = CoffeeShopRecommendationAgent(retriever=retriever)

# Memory log for developer observability drawer
latest_traces: List[dict] = []

@router.get("/health")
def health_check():
    return {"status": "ok", "service": "BrewMate AI Backend", "version": "1.0.0"}

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    """
    Main Conversational Endpoint for Customer Recommendation Agent.
    """
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="User message cannot be empty.")

    try:
        response = agent.process_query(request.message, request.profile)
        
        # Save trace for observability endpoint
        global latest_traces
        latest_traces.insert(0, {
            "query": request.message,
            "latency_ms": response.latency_ms,
            "trace": [t.dict() for t in response.observability_trace],
            "recommendation": response.recommendation.dict() if response.recommendation else None
        })
        # Keep last 20 traces
        latest_traces = latest_traces[:20]

        return response
    except Exception as e:
        print(f"[API Chat Error] {e}")
        raise HTTPException(status_code=500, detail="Failed to process recommendation request.")

@router.get("/menu")
def get_menu(
    query: Optional[str] = Query(None, description="Search term"),
    category: Optional[str] = Query(None, description="Product category"),
    max_price: Optional[float] = Query(None, description="Max price in ₹"),
    dietary: Optional[str] = Query(None, description="Dietary tag (Vegan, Vegetarian, Gluten-Free)"),
    caffeine: Optional[str] = Query(None, description="Caffeine level (none, low, medium, high)"),
    temperature: Optional[str] = Query(None, description="Temperature (hot, iced, warm)")
):
    """
    Return menu products matching optional search query & filter criteria.
    """
    products = retriever.search_menu(
        query=query or "",
        category=category,
        max_price=max_price,
        dietary=dietary,
        caffeine=caffeine,
        temperature=temperature
    )
    return {"products": products, "total": len(products)}

@router.get("/menu/{product_id}")
def get_product(product_id: str):
    """
    Return detailed product information and pairing suggestions.
    """
    prod = retriever.kb.get_product_by_id(product_id)
    if not prod:
        raise HTTPException(status_code=404, detail=f"Product with ID '{product_id}' not found.")
    
    pairings = retriever.get_pairings(product_id)
    return {"product": prod, "pairings": pairings}

@router.get("/store")
def get_store_info():
    """
    Return store hours, location, delivery policy, and FAQs.
    """
    return retriever.kb.get_store_info()

@router.post("/order/calculate", response_model=OrderCalculationResponse)
def calculate_order(request: OrderCalculationRequest):
    """
    Calculate subtotal, tax (5% GST), delivery fee, and grand total for an order.
    """
    items_data = [item.dict() for item in request.items]
    res = agent.tools.calculate_order(items_data)
    return res

@router.get("/observability")
def get_observability_traces():
    """
    Developer / Admin view for real-time agent execution step tracing.
    """
    return {"recent_traces": latest_traces}
