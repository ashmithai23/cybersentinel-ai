import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from backend.app.core.config import settings
from backend.app.database.session import init_db
from backend.app.api.routes import (
    auth,
    dashboard,
    detection,
    events,
    findings,
    models,
    network,
    api_security,
    reports,
    audit,
    info,
    settings as settings_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup database seeding & table initialization
    print(f"[CYBERSENTINEL AI] Starting platform backend in {settings.ENVIRONMENT}...")
    await init_db()
    yield
    print("[CYBERSENTINEL AI] Shutting down backend service cleanly.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Assisted Security Threat Detection, Analysis and Vulnerability Intelligence Platform",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Response Timing Header Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time-MS"] = str(round(process_time * 1000, 2))
    return response

# Register API Router
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(dashboard.router, prefix=api_prefix)
app.include_router(detection.router, prefix=api_prefix)
app.include_router(events.router, prefix=api_prefix)
app.include_router(findings.router, prefix=api_prefix)
app.include_router(models.router, prefix=api_prefix)
app.include_router(network.router, prefix=api_prefix)
app.include_router(api_security.router, prefix=api_prefix)
app.include_router(reports.router, prefix=api_prefix)
app.include_router(audit.router, prefix=api_prefix)
app.include_router(info.router, prefix=api_prefix)
app.include_router(settings_router.router, prefix=api_prefix)

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "Operational",
        "docs": "/docs",
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
