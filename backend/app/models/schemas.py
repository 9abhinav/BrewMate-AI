from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class CustomerProfile(BaseModel):
    name: Optional[str] = "Guest"
    favorite_flavors: List[str] = Field(default_factory=list)
    preferred_temperature: Optional[str] = "any" # hot, iced, warm, any
    caffeine_preference: Optional[str] = "any"   # none, low, medium, high, any
    dietary_restrictions: List[str] = Field(default_factory=list) # Vegan, Vegetarian, Gluten-Free, Dairy-Free, Nut-Free
    budget_max: Optional[float] = None
    favorite_products: List[str] = Field(default_factory=list)
    previous_recommendations: List[str] = Field(default_factory=list)

class ProductSchema(BaseModel):
    id: str
    name: str
    category: str
    description: str
    price: float
    ingredients: List[str]
    flavor_profile: List[str]
    caffeine_level: str
    temperature: str
    size_options: List[str]
    dietary_info: List[str]
    calories: int
    availability: bool
    pairings: Optional[List[str]] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default-session"
    profile: Optional[CustomerProfile] = Field(default_factory=CustomerProfile)

class RecommendationOutput(BaseModel):
    recommendation: str
    reason: str
    price: float
    product_id: Optional[str] = None
    alternatives: List[str] = Field(default_factory=list)
    pairings: List[str] = Field(default_factory=list)
    category: Optional[str] = None
    temperature: Optional[str] = None
    caffeine_level: Optional[str] = None

class ObservabilityStep(BaseModel):
    step_name: str
    detail: str
    data: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    message: str
    recommendation: Optional[RecommendationOutput] = None
    suggested_actions: List[str] = Field(default_factory=list)
    observability_trace: List[ObservabilityStep] = Field(default_factory=list)
    latency_ms: float = 0.0

class OrderItemInput(BaseModel):
    product_id: str
    size: Optional[str] = "Regular"
    quantity: int = 1

class OrderCalculationRequest(BaseModel):
    items: List[OrderItemInput]

class OrderCalculationResponse(BaseModel):
    subtotal: float
    tax: float
    delivery_fee: float
    total: float
    items: List[Dict[str, Any]]
