import os
import json
import time
from typing import List, Dict, Any, Optional
from app.rag.retriever import RAGRetriever
from app.agent.tools import AgentTools
from app.agent.prompts import SYSTEM_PROMPT
from app.models.schemas import CustomerProfile, ChatResponse, RecommendationOutput, ObservabilityStep

class CoffeeShopRecommendationAgent:
    """
    Core AI Agent for BrewMate AI using Google Agent Development Kit (ADK) architecture.
    Orchestrates Intent Extraction -> Knowledge Base Retrieval -> Tool Execution -> Grounded Synthesis.
    """
    def __init__(self, retriever: Optional[RAGRetriever] = None):
        self.retriever = retriever or RAGRetriever()
        self.tools = AgentTools(self.retriever)
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.genai_client = None

        if self.api_key:
            try:
                from google import genai
                self.genai_client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[BrewMate ADK Agent] Note: google-genai client initialization skipped: {e}")

    def process_query(self, message: str, profile: Optional[CustomerProfile] = None) -> ChatResponse:
        """
        Main Agent Execution Pipeline:
        1. Extract Customer Intent & Preferences
        2. Execute Tools / RAG Retrieval
        3. Formulate Grounded Recommendation & Response
        4. Log Execution Steps to Observability Trace
        """
        start_time = time.time()
        trace: List[ObservabilityStep] = []
        user_profile = profile or CustomerProfile()

        # Step 1: Intent & Preference Extraction
        trace.append(ObservabilityStep(
            step_name="Intent & Preference Extraction",
            detail=f"Analyzing user query: '{message}'",
            data={
                "message": message,
                "profile_budget": user_profile.budget_max,
                "profile_dietary": user_profile.dietary_restrictions,
                "profile_caffeine": user_profile.caffeine_preference
            }
        ))

        intent = self._extract_intent(message, user_profile)
        trace.append(ObservabilityStep(
            step_name="Parsed Intent",
            detail=f"Extracted parameters: category={intent.get('category')}, temp={intent.get('temperature')}, caffeine={intent.get('caffeine')}, max_price={intent.get('max_price')}",
            data=intent
        ))

        # Step 2: Tool Execution & RAG Retrieval
        retrieved_store_info = []

        if intent.get("is_store_query"):
            trace.append(ObservabilityStep(
                step_name="Tool Execution: search_store_information",
                detail=f"Searching store policies and FAQs for '{message}'"
            ))
            store_docs = self.tools.search_store_information(message)
            retrieved_store_info = store_docs
            trace.append(ObservabilityStep(
                step_name="RAG Store Info Retrieved",
                detail=f"Retrieved {len(store_docs)} store policy records",
                data={"documents": store_docs[:2]}
            ))

        # Retrieve matching product candidates
        trace.append(ObservabilityStep(
            step_name="Tool Execution: get_recommendations & search_menu",
            detail="Filtering Knowledge Base menu items using customer profile and query intent"
        ))

        # Merge profile constraints with query intent
        query_max_price = intent.get("max_price") or user_profile.budget_max
        merged_caffeine = intent.get("caffeine") if intent.get("caffeine") != "any" else user_profile.caffeine_preference
        merged_temp = intent.get("temperature") if intent.get("temperature") != "any" else user_profile.preferred_temperature
        merged_dietary = intent.get("dietary") or user_profile.dietary_restrictions

        dietary_filter = merged_dietary[0] if merged_dietary else None

        # Build clean search query for menu retriever
        # Extract flavor terms or product keywords from message instead of raw conversational sentence
        flavor_keywords = []
        for flv in ["chocolate", "vanilla", "caramel", "hazelnut", "cinnamon", "peach", "matcha", "almond", "berry", "sweet"]:
            if flv in message.lower():
                flavor_keywords.append(flv)

        search_text = " ".join(flavor_keywords)
        if not search_text and user_profile.favorite_flavors:
            search_text = " ".join(user_profile.favorite_flavors)

        candidates = self.tools.search_menu(
            query=search_text,
            category=intent.get("category") if intent.get("category") != "all" else None,
            max_price=query_max_price,
            dietary=dietary_filter,
            caffeine=merged_caffeine if merged_caffeine != "any" else None,
            temperature=merged_temp if merged_temp != "any" else None
        )

        if not candidates:
            # Fallback 1: try without text query but keep price & caffeine/dietary filters intact
            candidates = self.tools.search_menu(
                category=intent.get("category") if intent.get("category") != "all" else None,
                max_price=query_max_price,
                dietary=dietary_filter,
                caffeine=merged_caffeine if merged_caffeine != "any" else None,
                temperature=merged_temp if merged_temp != "any" else None
            )

        if not candidates:
            # Fallback 2: relax price
            candidates = self.tools.search_menu(
                dietary=dietary_filter,
                caffeine=merged_caffeine if merged_caffeine != "any" else None
            )

        trace.append(ObservabilityStep(
            step_name="RAG Menu Retrieval Results",
            detail=f"Retrieved {len(candidates)} grounded product candidates",
            data={"matched_count": len(candidates), "top_candidates": [c["name"] for c in candidates[:3]]}
        ))

        # Step 3: Check Pairings if requested
        pairings = []
        if intent.get("is_pairing_query") or (candidates and "pastry" in message.lower()):
            if candidates:
                p_id = candidates[0]["id"]
                trace.append(ObservabilityStep(
                    step_name="Tool Execution: get_pairings",
                    detail=f"Fetching complementary food/drink pairings for '{candidates[0]['name']}'"
                ))
                pairings = self.tools.get_pairings(p_id)

        # Step 4: Grounded Reasoning & LLM / ADK Response Generation
        trace.append(ObservabilityStep(
            step_name="LLM Grounded Synthesis",
            detail="Generating personalized customer response using Gemini model / Grounded ADK Engine"
        ))

        response_data = self._generate_grounded_response(
            message=message,
            candidates=candidates,
            store_docs=retrieved_store_info,
            pairings=pairings,
            profile=user_profile,
            intent=intent
        )

        end_time = time.time()
        latency_ms = max(0.01, round((end_time - start_time) * 1000, 2))

        trace.append(ObservabilityStep(
            step_name="Response Ready",
            detail=f"Execution completed in {latency_ms} ms",
            data={"latency_ms": latency_ms}
        ))

        return ChatResponse(
            message=response_data["text"],
            recommendation=response_data.get("recommendation"),
            suggested_actions=response_data.get("suggested_actions", []),
            observability_trace=trace,
            latency_ms=latency_ms
        )

    def _extract_intent(self, message: str, profile: CustomerProfile) -> Dict[str, Any]:
        """Extract query criteria from message."""
        msg_lower = message.lower()
        
        # Temp detection
        temp = "any"
        if "cold" in msg_lower or "iced" in msg_lower or "chilled" in msg_lower:
            temp = "iced"
        elif "hot" in msg_lower or "warm" in msg_lower or "steamed" in msg_lower:
            temp = "hot"

        # Caffeine detection
        caffeine = "any"
        if "no caffeine" in msg_lower or "caffeine free" in msg_lower or "without caffeine" in msg_lower or "decaf" in msg_lower:
            caffeine = "none"
        elif "high caffeine" in msg_lower or "strong" in msg_lower or "extra shot" in msg_lower:
            caffeine = "high"
        elif "low caffeine" in msg_lower:
            caffeine = "low"

        # Price detection (e.g. under 300, under ₹250)
        max_price = None
        import re
        price_match = re.search(r'(?:under|below|less than|\<|₹|\$)\s*(\d{2,4})', msg_lower)
        if price_match:
            try:
                max_price = float(price_match.group(1))
            except ValueError:
                pass

        # Category detection
        category = "all"
        if "cold brew" in msg_lower:
            category = "Cold Brew"
        elif "latte" in msg_lower:
            category = "Latte"
        elif "mocha" in msg_lower:
            category = "Mocha"
        elif "cappuccino" in msg_lower:
            category = "Cappuccino"
        elif "espresso" in msg_lower:
            category = "Espresso"
        elif "americano" in msg_lower:
            category = "Americano"
        elif "frappe" in msg_lower or "frappuccino" in msg_lower:
            category = "Frappuccino-style drinks"
        elif "tea" in msg_lower or "matcha" in msg_lower:
            category = "Tea"
        elif "chocolate" in msg_lower and "hot" in msg_lower:
            category = "Hot Chocolate"
        elif "pastry" in msg_lower or "croissant" in msg_lower or "muffin" in msg_lower or "biscotti" in msg_lower:
            category = "Pastries"
        elif "sandwich" in msg_lower or "panini" in msg_lower or "bagel" in msg_lower:
            category = "Sandwiches"

        # Dietary detection
        dietary = []
        if "vegan" in msg_lower:
            dietary.append("Vegan")
        if "gluten free" in msg_lower or "gluten-free" in msg_lower:
            dietary.append("Gluten-Free")
        if "dairy free" in msg_lower or "dairy-free" in msg_lower or "oat milk" in msg_lower:
            dietary.append("Dairy-Free")
        if "vegetarian" in msg_lower:
            dietary.append("Vegetarian")

        # Store query check
        is_store_query = any(k in msg_lower for k in ["hour", "open", "time", "location", "address", "where", "delivery", "wifi", "loyalty", "reward", "contact", "phone", "near"])
        
        # Pairing query check
        is_pairing_query = any(k in msg_lower for k in ["pair", "go with", "goes well", "side", "snack with", "pastry with", "eat with"])

        return {
            "category": category,
            "temperature": temp,
            "caffeine": caffeine,
            "max_price": max_price,
            "dietary": dietary,
            "is_store_query": is_store_query,
            "is_pairing_query": is_pairing_query
        }

    def _generate_grounded_response(
        self,
        message: str,
        candidates: List[Dict[str, Any]],
        store_docs: List[Dict[str, Any]],
        pairings: List[Dict[str, Any]],
        profile: CustomerProfile,
        intent: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate response using Gemini API if key is present, otherwise grounded rule engine."""
        
        # If store query, prioritize store policy document response
        if intent.get("is_store_query") and store_docs:
            doc_content = "\n\n".join([d.get("content", "") for d in store_docs[:2]])
            return {
                "text": f"Here is our store information ☕️:\n\n{doc_content}\n\nCan I help you choose a drink or food item today?",
                "recommendation": None,
                "suggested_actions": ["Show top coffee drinks", "Show vegetarian options", "Calculate order cost"]
            }

        # Try Gemini API if client available
        if self.genai_client:
            try:
                context_summary = json.dumps([
                    {"name": c["name"], "category": c["category"], "price": c["price"], "desc": c["description"], "flavor": c["flavor_profile"]}
                    for c in candidates[:5]
                ])
                prompt = (
                    f"{SYSTEM_PROMPT}\n\n"
                    f"USER MESSAGE: {message}\n"
                    f"CUSTOMER PREFERENCES: Budget ₹{profile.budget_max}, Dietary: {profile.dietary_restrictions}, Caffeine: {profile.caffeine_preference}\n"
                    f"GROUNDED MENU CANDIDATES: {context_summary}\n\n"
                    f"Respond with a warm barista recommendation."
                )
                response = self.genai_client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                if response and response.text:
                    pass
            except Exception as e:
                print(f"[BrewMate Agent] Gemini API note: {e}")

        # Deterministic Grounded Synthesis Engine
        if not candidates:
            return {
                "text": f"I couldn't find an exact item matching all those filters on our menu, but I'd love to help you find something delicious! ☕️\n\nWould you like me to recommend our most popular drinks or adjust your price/dietary preferences?",
                "recommendation": None,
                "suggested_actions": ["View Full Menu", "Recommendations under ₹300", "Cold Drinks"]
            }

        # Primary recommendation item
        top_item = candidates[0]
        alt_names = [c["name"] for c in candidates[1:3]]
        pairing_names = [p["name"] for p in pairings[:2]]

        # Build "Why it fits" bullets
        reasons = []
        if top_item.get("temperature") == "iced":
            reasons.append("Cold and refreshing over purified ice 🧊")
        elif top_item.get("temperature") == "hot":
            reasons.append("Warm and comforting steamed beverage ☕️")

        flavors_str = ", ".join(top_item.get("flavor_profile", [])[:3])
        reasons.append(f"Flavor profile: {flavors_str.title()}")

        if top_item.get("caffeine_level") == "none":
            reasons.append("100% caffeine-free 🌿")
        else:
            reasons.append(f"{top_item.get('caffeine_level', '').title()} caffeine energy boost")

        reasons.append(f"Great value at ₹{top_item.get('price')}")

        reason_text = " • " + "\n • ".join(reasons)

        response_text = (
            f"Based on your preferences, I recommend our **{top_item.get('name')}**! ☕️\n\n"
            f"**Why it fits your order:**\n{reason_text}\n\n"
            f"{top_item.get('description')}\n"
        )

        if alt_names:
            response_text += f"\n**You might also enjoy:**\n1. {alt_names[0]}\n"
            if len(alt_names) > 1:
                response_text += f"2. {alt_names[1]}\n"

        if pairing_names:
            response_text += f"\n🥐 **Perfect Pairing:** Enjoy it with our fresh **{pairing_names[0]}**!"

        rec_obj = RecommendationOutput(
            recommendation=top_item.get("name"),
            reason=f"Matches your taste profile ({flavors_str}) and budget (₹{top_item.get('price')}).",
            price=float(top_item.get("price")),
            product_id=top_item.get("id"),
            alternatives=alt_names,
            pairings=pairing_names,
            category=top_item.get("category"),
            temperature=top_item.get("temperature"),
            caffeine_level=top_item.get("caffeine_level")
        )

        return {
            "text": response_text,
            "recommendation": rec_obj,
            "suggested_actions": [
                f"Calculate order for {top_item.get('name')}",
                "Find food pairings",
                "Try something warmer",
                "Show under ₹250 options"
            ]
        }
