from typing import List, Dict, Any, Optional
from app.rag.retriever import RAGRetriever
from app.models.schemas import CustomerProfile

class AgentTools:
    """
    Executable Tools for CoffeeShopRecommendationAgent (ADK multi-tool engine).
    """
    def __init__(self, retriever: RAGRetriever):
        self.retriever = retriever

    def search_menu(
        self,
        query: str = "",
        category: Optional[str] = None,
        max_price: Optional[float] = None,
        dietary: Optional[str] = None,
        caffeine: Optional[str] = None,
        temperature: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Tool 1: Search available products matching query and filters."""
        return self.retriever.search_menu(
            query=query,
            category=category,
            max_price=max_price,
            dietary=dietary,
            caffeine=caffeine,
            temperature=temperature
        )

    def get_product_details(self, product_id: str) -> Optional[Dict[str, Any]]:
        """Tool 2: Return complete details about a specific product."""
        return self.retriever.kb.get_product_by_id(product_id)

    def search_store_information(self, query: str) -> List[Dict[str, Any]]:
        """Tool 3: Retrieve store hours, location, policies, and FAQs."""
        results = self.retriever.retrieve(query=query, top_k=5)
        # Filter for non-product documents
        store_docs = [d for d in results.get("documents", []) if d["type"] != "product"]
        if not store_docs:
            # Fallback to general FAQ search
            store_info = self.retriever.kb.get_store_info()
            return [{"type": "store_info", "data": store_info}]
        return store_docs

    def get_recommendations(
        self,
        preferences: Optional[Dict[str, Any]] = None,
        query: str = ""
    ) -> List[Dict[str, Any]]:
        """Tool 4: Find products matching personalized customer preferences."""
        prefs = preferences or {}
        max_price = prefs.get("budget_max")
        flavors = prefs.get("favorite_flavors", [])
        caffeine = prefs.get("caffeine_preference")
        temp = prefs.get("preferred_temperature")
        dietary = prefs.get("dietary_restrictions", [])
        dietary_str = dietary[0] if dietary else None

        # Execute search with preferences
        matched = self.retriever.search_menu(
            query=query or (" ".join(flavors) if flavors else ""),
            max_price=max_price,
            dietary=dietary_str,
            caffeine=caffeine if caffeine != "any" else None,
            temperature=temp if temp != "any" else None
        )

        if not matched and (max_price or dietary_str or caffeine or temp):
            # Fallback: relax caffeine/temp filter if exact combination is narrow
            matched = self.retriever.search_menu(
                query=query or (" ".join(flavors) if flavors else ""),
                max_price=max_price
            )

        return matched

    def check_availability(self, product_id: str) -> Dict[str, Any]:
        """Tool 5: Check whether a product is currently available."""
        prod = self.retriever.kb.get_product_by_id(product_id)
        if not prod:
            return {"product_id": product_id, "exists": False, "available": False, "message": "Product not found on menu."}
        return {
            "product_id": prod["id"],
            "name": prod["name"],
            "exists": True,
            "available": prod.get("availability", True),
            "price": prod.get("price")
        }

    def calculate_order(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Tool 6: Calculate total cost for order items with tax & delivery."""
        calculated_items = []
        subtotal = 0.0

        for item in items:
            p_id = item.get("product_id") or item.get("id")
            qty = item.get("quantity", 1)
            size = item.get("size", "Regular")
            
            prod = self.retriever.kb.get_product_by_id(p_id) if p_id else None
            if prod:
                base_price = float(prod.get("price", 0))
                # Small size modifier if applicable
                size_mult = 1.2 if size.lower() in ["large", "double"] else 1.0
                unit_price = round(base_price * size_mult, 2)
                item_total = round(unit_price * qty, 2)
                subtotal += item_total
                
                calculated_items.append({
                    "product_id": prod["id"],
                    "name": prod["name"],
                    "size": size,
                    "quantity": qty,
                    "unit_price": unit_price,
                    "total_price": item_total
                })

        tax = round(subtotal * 0.05, 2) # 5% GST
        delivery_fee = 40.0 if (subtotal < 500 and subtotal > 0) else 0.0
        grand_total = round(subtotal + tax + delivery_fee, 2)

        return {
            "subtotal": subtotal,
            "tax": tax,
            "delivery_fee": delivery_fee,
            "total": grand_total,
            "items": calculated_items
        }

    def get_pairings(self, product_id: str) -> List[Dict[str, Any]]:
        """Tool 7: Recommend food/drink pairings for a specified product."""
        return self.retriever.get_pairings(product_id)
