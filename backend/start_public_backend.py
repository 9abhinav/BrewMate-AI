import os
import sys
import time
from pyngrok import ngrok
import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"[BrewMate Public Server] Starting ngrok tunnel on port {port}...")
    try:
        public_url = ngrok.connect(port).public_url
        print("=" * 60)
        print(f"🔥 LIVE PUBLIC BACKEND URL: {public_url}")
        print("=" * 60)
    except Exception as e:
        print(f"[ngrok Error] {e}")

    # Start FastAPI server
    from app.main import app
    uvicorn.run(app, host="0.0.0.0", port=port)
