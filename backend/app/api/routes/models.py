import os
import json
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.database.session import get_db
from backend.app.database.models import ModelVersion
from backend.app.schemas.schemas import ModelComparisonOut, ModelVersionOut
from backend.app.core.security import get_current_user_payload, TokenPayload
from backend.app.core.config import settings
from backend.app.services.audit_service import log_audit_event

router = APIRouter(prefix="/models", tags=["AI Models & MLOps"])

MODEL_DIR = settings.MODEL_DIR

@router.get("/comparison", response_model=ModelComparisonOut)
async def get_model_comparison(
    db: AsyncSession = Depends(get_db),
    payload: TokenPayload = Depends(get_current_user_payload)
):
    comp_path = os.path.join(MODEL_DIR, "model_comparison.json")
    models_data = {}
    if os.path.exists(comp_path):
        with open(comp_path, "r") as f:
            models_data = json.load(f)
            
    # Fetch model versions from database
    res = await db.execute(select(ModelVersion))
    db_models = list(res.scalars().all())
    
    active_prod = "Random Forest Baseline"
    table_rows = []
    
    for db_m in db_models:
        if db_m.status == "Production":
            active_prod = db_m.model_name
            
        m_metrics = models_data.get(db_m.model_name, {})
        inf_time = m_metrics.get("inference_time_ms", 5.2)
        
        table_rows.append({
            "model": db_m.model_name,
            "type": db_m.model_type,
            "accuracy": db_m.accuracy,
            "precision": db_m.precision,
            "recall": db_m.recall,
            "f1_score": db_m.f1_score,
            "roc_auc": db_m.roc_auc,
            "inference_time_ms": inf_time,
            "status": db_m.status
        })

    return ModelComparisonOut(
        active_production_model=active_prod,
        models=models_data,
        comparison_table=table_rows
    )

@router.post("/set-production/{model_id}", response_model=Dict[str, Any])
async def set_active_production_model(
    model_id: int,
    db: AsyncSession = Depends(get_db),
    payload: TokenPayload = Depends(get_current_user_payload)
):
    res = await db.execute(select(ModelVersion).where(ModelVersion.id == model_id))
    target_model = res.scalar_one_or_none()
    if not target_model:
        raise HTTPException(status_code=404, detail="Model version not found.")
        
    # Reset all to Candidate, set target to Production
    all_res = await db.execute(select(ModelVersion))
    for m in all_res.scalars().all():
        m.status = "Candidate" if m.id != model_id else "Production"
        
    await db.commit()
    await log_audit_event(
        db, payload.email, "SET_PRODUCTION_MODEL", f"MODEL_{target_model.model_name}",
        details={"model_id": model_id, "model_name": target_model.model_name}
    )
    return {"message": f"Successfully activated '{target_model.model_name}' as primary production inference model."}
