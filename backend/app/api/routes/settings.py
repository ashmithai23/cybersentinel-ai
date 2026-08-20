from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import Dict, Any

from backend.app.database.session import get_db
from backend.app.core.config import settings
from backend.app.core.security import get_current_user_payload, TokenPayload

router = APIRouter(prefix="/settings", tags=["System Settings"])

@router.get("/status", response_model=Dict[str, Any])
async def get_system_status(
    db: AsyncSession = Depends(get_db),
    payload: TokenPayload = Depends(get_current_user_payload)
):
    db_status = "Connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "Degraded"
        
    return {
        "system_status": "Operational",
        "model_status": "Ready (Inference Loaded)",
        "api_status": "Online (FastAPI v1)",
        "database_status": db_status,
        "environment": settings.ENVIRONMENT,
        "is_demo_mode": settings.IS_DEMO_MODE,
        "supabase_connected": bool(settings.SUPABASE_URL),
        "mlflow_tracking_uri": settings.MLFLOW_TRACKING_URI
    }
