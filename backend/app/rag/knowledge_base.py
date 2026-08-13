import os
import json
from typing import List, Dict, Any, Optional

class KnowledgeBase:
    """
    Structured Knowledge Base Manager for BrewMate AI.
    Loads and manages menu items, store details, FAQs, and recommendation rules.
    """
    def __init__(self, data_dir: Optional[str] = None):
        if data_dir is None:
            # Default path relative to this file
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data"))
            data_dir = base_dir

        self.data_dir = data_dir
        self.menu_items: List[Dict[str, Any]] = []
        self.store_info: Dict[str, Any] = {}
        self.recommendations_rules: Dict[str, Any] = {}
        self.documents: List[Dict[str, Any]] = []
        
        self.load_all()

    def load_all(self):
        """Load JSON files from data directory and index text documents."""
        menu_path = os.path.join(self.data_dir, "menu.json")
        store_path = os.path.join(self.data_dir, "store_info.json")
        recs_path = os.path.join(self.data_dir, "recommendations.json")

        if os.path.exists(menu_path):
            with open(menu_path, "r", encoding="utf-8") as f:
                self.menu_items = json.load(f)

        if os.path.exists(store_path):
            with open(store_path, "r", encoding="utf-8") as f:
                self.store_info = json.load(f)

        if os.path.exists(recs_path):
            with open(recs_path, "r", encoding="utf-8") as f:
                self.recommendations_rules = json.load(f)

        self._build_documents()

    def _build_documents(self):
        """Convert structured JSON data into searchable document chunks for RAG."""
        docs = []

        # 1. Product documents
        for item in self.menu_items:
            doc_text = (
                f"Product Name: {item.get('name')}. Category: {item.get('category')}. "
                f"Price: ₹{item.get('price')}. Description: {item.get('description')}. "
                f"Ingredients: {', '.join(item.get('ingredients', []))}. "
                f"Flavor Profile: {', '.join(item.get('flavor_profile', []))}. "
                f"Caffeine Level: {item.get('caffeine_level')}. Temperature: {item.get('temperature')}. "
                f"Dietary: {', '.join(item.get('dietary_info', []))}. Calories: {item.get('calories')} kcal. "
                f"Availability: {'In Stock' if item.get('availability') else 'Out of Stock'}."
            )
            docs.append({
                "id": item.get("id"),
                "type": "product",
                "title": item.get("name"),
                "content": doc_text,
                "data": item
            })

        # 2. Store Info & Policies
        if self.store_info:
            location_text = f"Location: {self.store_info.get('location', {}).get('address')}, {self.store_info.get('location', {}).get('city')}. Landmark: {self.store_info.get('location', {}).get('landmark')}."
            docs.append({
                "id": "store-location",
                "type": "store_info",
                "title": "Store Location & Address",
                "content": location_text,
                "data": self.store_info.get("location")
            })

            hours_str = ", ".join([f"{day}: {hours}" for day, hours in self.store_info.get("hours", {}).items()])
            docs.append({
                "id": "store-hours",
                "type": "store_info",
                "title": "Opening Hours & Timings",
                "content": f"Opening Hours: {hours_str}",
                "data": self.store_info.get("hours")
            })

            pickup_text = f"Pickup Rules: Counter pickup {self.store_info.get('ordering_and_pickup', {}).get('counter_pickup')}. Curbside pickup: {self.store_info.get('ordering_and_pickup', {}).get('curbside_pickup')}. Customizations: {self.store_info.get('ordering_and_pickup', {}).get('customizations')}."
            docs.append({
                "id": "store-pickup",
                "type": "store_info",
                "title": "Pickup & Ordering Options",
                "content": pickup_text,
                "data": self.store_info.get("ordering_and_pickup")
            })

            delivery_text = f"Delivery Policy: Available within {self.store_info.get('delivery', {}).get('radius_km')} km. Min order ₹{self.store_info.get('delivery', {}).get('min_order_amount')}. Free delivery above ₹{self.store_info.get('delivery', {}).get('free_delivery_above')}. ETA: {self.store_info.get('delivery', {}).get('estimated_time_minutes')}."
            docs.append({
                "id": "store-delivery",
                "type": "store_info",
                "title": "Delivery Options & Charges",
                "content": delivery_text,
                "data": self.store_info.get("delivery")
            })

            loyalty_text = f"BrewRewards Loyalty Program: {self.store_info.get('loyalty_program', {}).get('name')}. {self.store_info.get('loyalty_program', {}).get('earning_rate')} {self.store_info.get('loyalty_program', {}).get('redemption')}"
            docs.append({
                "id": "store-loyalty",
                "type": "store_info",
                "title": "Loyalty Program BrewRewards",
                "content": loyalty_text,
                "data": self.store_info.get("loyalty_program")
            })

            for i, faq in enumerate(self.store_info.get("faq", [])):
                docs.append({
                    "id": f"store-faq-{i+1}",
                    "type": "faq",
                    "title": f"FAQ: {faq.get('question')}",
                    "content": f"Q: {faq.get('question')} A: {faq.get('answer')}",
                    "data": faq
                })

        # 3. Pairings & Recommendation Rules
        for pairing in self.recommendations_rules.get("food_pairings", []):
            docs.append({
                "id": f"pairing-{pairing.get('drink_category')}",
                "type": "pairing_rule",
                "title": f"Pairing Guide for {pairing.get('drink_category')}",
                "content": f"Best pairings for {pairing.get('drink_category')}: {', '.join(pairing.get('best_pairings'))}. Reason: {pairing.get('reasoning')}",
                "data": pairing
            })

        self.documents = docs

    def get_product_by_id(self, product_id: str) -> Optional[Dict[str, Any]]:
        for p in self.menu_items:
            if p["id"].lower() == product_id.lower() or p["name"].lower() == product_id.lower():
                return p
        return None

    def get_all_products(self) -> List[Dict[str, Any]]:
        return self.menu_items

    def get_store_info(self) -> Dict[str, Any]:
        return self.store_info
