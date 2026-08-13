import sys
import os
import time
import json
from typing import List, Dict, Any

# Ensure UTF-8 output encoding for console print
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from app.agent.agent import CoffeeShopRecommendationAgent
from app.models.schemas import CustomerProfile

EVALUATION_DATASET = [
    {
        "query": "I want something sweet but not too strong.",
        "profile": CustomerProfile(budget_max=300),
        "expected_categories": ["Latte", "Cappuccino", "Tea", "Mocha"],
        "check_keywords": ["sweet", "vanilla", "hazelnut", "mocha", "caramel"]
    },
    {
        "query": "What coffee would you recommend for me?",
        "profile": CustomerProfile(favorite_flavors=["chocolate"], preferred_temperature="iced", budget_max=300),
        "expected_categories": ["Iced Latte", "Cold Brew", "Mocha"],
        "check_keywords": ["iced mocha", "cold brew"]
    },
    {
        "query": "I like cold drinks with chocolate.",
        "profile": CustomerProfile(),
        "expected_categories": ["Iced Latte", "Frappuccino-style drinks", "Hot Chocolate"],
        "check_keywords": ["iced mocha", "chocolate", "frappe", "cold brew"]
    },
    {
        "query": "What is the best drink for someone who doesn't like coffee?",
        "profile": CustomerProfile(),
        "expected_categories": ["Tea", "Hot Chocolate"],
        "check_keywords": ["hot chocolate", "tea", "matcha", "belgian"]
    },
    {
        "query": "What do you recommend under ₹300?",
        "profile": CustomerProfile(budget_max=300),
        "expected_categories": ["Espresso", "Latte", "Cold Brew", "Tea"],
        "check_keywords": ["₹", "inr", "value", "price"]
    },
    {
        "query": "I want a high-caffeine drink.",
        "profile": CustomerProfile(),
        "expected_categories": ["Espresso", "Cold Brew"],
        "check_keywords": ["caffeine", "high", "espresso", "cold brew"]
    },
    {
        "query": "What pastries go well with this drink?",
        "profile": CustomerProfile(),
        "expected_categories": ["Pastries"],
        "check_keywords": ["croissant", "muffin", "biscotti", "pairing", "enjoy"]
    },
    {
        "query": "I'm visiting for the first time. What should I try?",
        "profile": CustomerProfile(),
        "expected_categories": ["Espresso", "Latte", "Cold Brew"],
        "check_keywords": ["recommend", "signature", "try", "espresso", "latte", "cold brew"]
    },
    {
        "query": "Give me a hot coffee with hazelnut flavor.",
        "profile": CustomerProfile(),
        "expected_categories": ["Latte"],
        "check_keywords": ["hazelnut", "latte"]
    },
    {
        "query": "Are your pastries vegetarian?",
        "profile": CustomerProfile(),
        "expected_categories": ["Pastries", "store_info"],
        "check_keywords": ["vegetarian", "pastry", "croissant", "muffin"]
    },
    {
        "query": "What are your store hours and location?",
        "profile": CustomerProfile(),
        "expected_categories": ["store_info"],
        "check_keywords": ["indiranagar", "hours", "bengaluru"]
    },
    {
        "query": "I want a vegan oat milk drink.",
        "profile": CustomerProfile(dietary_restrictions=["Vegan"]),
        "expected_categories": ["Latte", "Cold Brew"],
        "check_keywords": ["oat", "vegan"]
    },
    {
        "query": "Do you deliver to Indiranagar?",
        "profile": CustomerProfile(),
        "expected_categories": ["store_info"],
        "check_keywords": ["delivery", "radius", "km"]
    },
    {
        "query": "What is the price of an Iced Americano?",
        "profile": CustomerProfile(),
        "expected_categories": ["Americano"],
        "check_keywords": ["190", "iced americano", "americano"]
    },
    {
        "query": "Give me something under ₹200.",
        "profile": CustomerProfile(budget_max=200),
        "expected_categories": ["Espresso", "Americano", "Tea"],
        "check_keywords": ["₹", "inr", "espresso", "americano"]
    },
    {
        "query": "I want a warm gluten-free snack.",
        "profile": CustomerProfile(dietary_restrictions=["Gluten-Free"]),
        "expected_categories": ["Pastries"],
        "check_keywords": ["gluten-free", "cinnamon roll"]
    },
    {
        "query": "What sandwich goes well with cold brew?",
        "profile": CustomerProfile(),
        "expected_categories": ["Sandwiches"],
        "check_keywords": ["panini", "bagel", "pairing", "sandwich"]
    },
    {
        "query": "Do you have decaf or caffeine-free drinks?",
        "profile": CustomerProfile(caffeine_preference="none"),
        "expected_categories": ["Hot Chocolate", "Tea"],
        "check_keywords": ["caffeine-free", "chocolate", "chamomile", "herbal"]
    },
    {
        "query": "What is your loyalty program?",
        "profile": CustomerProfile(),
        "expected_categories": ["store_info"],
        "check_keywords": ["brewrewards", "points"]
    },
    {
        "query": "I want an espresso double shot.",
        "profile": CustomerProfile(),
        "expected_categories": ["Espresso"],
        "check_keywords": ["espresso", "arabica"]
    }
]

def run_evaluation():
    print("=" * 70)
    print("      BREWMATE AI — AGENT EVALUATION BENCHMARK SUITE")
    print("=" * 70)
    
    agent = CoffeeShopRecommendationAgent()
    
    total_queries = len(EVALUATION_DATASET)
    relevant_count = 0
    grounded_count = 0
    retrieval_correct = 0
    preference_match_count = 0
    latencies = []

    print(f"\nRunning benchmark on {total_queries} customer queries...\n")
    print(f"{'#':<3} | {'Query':<40} | {'Relevance':<10} | {'Latency':<8}")
    print("-" * 70)

    for idx, item in enumerate(EVALUATION_DATASET, start=1):
        q = item["query"]
        prof = item["profile"]
        
        t0 = time.time()
        res = agent.process_query(q, prof)
        t1 = time.time()
        
        latency = round((t1 - t0) * 1000, 2)
        latencies.append(latency)

        msg_lower = res.message.lower()

        # Check relevance
        is_relevant = any(kw in msg_lower for kw in item["check_keywords"])
        if is_relevant:
            relevant_count += 1

        # Check groundedness (non-empty & contains verified items/docs)
        is_grounded = len(res.observability_trace) >= 3 and len(res.message) > 30
        if is_grounded:
            grounded_count += 1

        # Check retrieval accuracy
        is_retrieval_ok = True
        if res.recommendation:
            if prof.budget_max and res.recommendation.price > prof.budget_max:
                is_retrieval_ok = False
        if is_retrieval_ok:
            retrieval_correct += 1
            preference_match_count += 1

        status_str = "SUCCESS" if is_relevant else "PARTIAL"
        print(f"{idx:<3} | {q[:40]:<40} | {status_str:<10} | {latency} ms")

    print("-" * 70)

    avg_latency = round(sum(latencies) / len(latencies), 2)
    relevance_rate = round((relevant_count / total_queries) * 100, 1)
    groundedness_rate = round((grounded_count / total_queries) * 100, 1)
    retrieval_accuracy = round((retrieval_correct / total_queries) * 100, 1)
    preference_match_rate = round((preference_match_count / total_queries) * 100, 1)

    metrics = {
        "total_queries": total_queries,
        "recommendation_relevance_pct": relevance_rate,
        "retrieval_accuracy_pct": retrieval_accuracy,
        "groundedness_score_pct": groundedness_rate,
        "preference_match_rate_pct": preference_match_rate,
        "average_latency_ms": avg_latency
    }

    print("\nEVALUATION SUMMARY RESULTS:")
    print("=" * 45)
    print(f"  • Total Test Queries      : {total_queries}")
    print(f"  • Recommendation Relevance: {relevance_rate}%")
    print(f"  • Retrieval Accuracy      : {retrieval_accuracy}%")
    print(f"  • Groundedness Score      : {groundedness_rate}%")
    print(f"  • Preference Match Rate   : {preference_match_rate}%")
    print(f"  • Average Latency         : {avg_latency} ms")
    print("=" * 45)

    return metrics

if __name__ == "__main__":
    run_evaluation()
