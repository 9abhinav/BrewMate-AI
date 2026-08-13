# =========================================================
# Stage 1: Build React Vite Frontend Static Assets
# =========================================================
FROM node:24-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# =========================================================
# Stage 2: Production FastAPI Application & Server
# =========================================================
FROM python:3.11-slim AS runner
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend dependencies and install
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy Knowledge Base data
COPY data/ ./data/

# Copy Backend Python Application Code
COPY backend/ ./backend/

# Copy Built Frontend Assets from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose HTTP Port
EXPOSE 8000

WORKDIR /app/backend

# Run FastAPI ASGI server via Uvicorn
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
