import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

# Ensure app package is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Load environment variables
load_dotenv()

app = FastAPI(
    title="BrewMate AI — Personalized Coffee Shop Assistant API",
    description="Backend API powering Google ADK + RAG coffee recommendations.",
    version="1.0.0"
)

# Configure CORS for Netlify frontend and local dev environments
allowed_origins = [
    "https://brewmate-ai.netlify.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:5173"
]

custom_origins = os.getenv("ALLOWED_ORIGINS")
if custom_origins:
    allowed_origins.extend([o.strip() for o in custom_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if os.getenv("ENVIRONMENT") != "production" else allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def root_health():
    """Health check endpoint for container platforms & load balancers."""
    return {"status": "ok", "service": "BrewMate AI Backend", "version": "1.0.0"}

# Include API Router
from app.api.routes import router as api_router
app.include_router(api_router)

# Mount static frontend build files if available (for single-container deployment)
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow /api and /health routes to be handled by FastAPI
        if full_path.startswith("api/") or full_path == "health":
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
