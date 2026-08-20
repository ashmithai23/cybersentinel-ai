import io
import pandas as pd
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any

from backend.app.database.session import get_db
from backend.app.schemas.schemas import DetectionRequest, BatchDetectionOut, ColumnMappingRequest
from backend.app.core.security import get_current_user_payload, TokenPayload
from ml.predict import CyberSentinelInferenceEngine
from backend.app.services.audit_service import log_audit_event

router = APIRouter(prefix="/detection", tags=["Threat Detection"])

# Global inference engine instance
inference_engine = CyberSentinelInferenceEngine()

@router.post("/validate-log", response_model=Dict[str, Any])
async def validate_uploaded_log_file(
    file: UploadFile = File(...),
    payload: TokenPayload = Depends(get_current_user_payload)
):
    """
    Step 1 & 2: Validates uploaded CSV log file format and extracts detected columns for user feature mapping.
    """
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a valid CSV security log dataset."
        )
        
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        if df.empty:
            raise HTTPException(status_code=400, detail="Uploaded CSV file is empty.")
            
        # Normalize column names (strip spaces, lowercase, replace spaces & hyphens with underscores)
        df.columns = [str(col).strip().lower().replace(" ", "_").replace("-", "_") for col in df.columns]
        
        # Clean infinite values and NaNs
        df = df.replace([float('inf'), float('-inf')], 0).fillna(0)
        
        # Convert non-label columns to numeric where possible
        for col in df.columns:
            if col != "label":
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

        num_rows = len(df)
        columns = list(df.columns)
        
        # Extract records for inference (up to 1,000 rows)
        records = df.head(1000).to_dict(orient="records")
        sample_records = df.head(5).to_dict(orient="records")
        
        return {
            "filename": file.filename,
            "num_rows": num_rows,
            "detected_columns": columns,
            "sample_records": sample_records,
            "parsed_records": records,
            "expected_features": inference_engine.pipeline.feature_columns,
            "message": f"Successfully parsed {num_rows} records with {len(columns)} columns."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

@router.post("/analyze-batch", response_model=BatchDetectionOut)
async def analyze_batch_security_events(
    request: DetectionRequest,
    db: AsyncSession = Depends(get_db),
    payload: TokenPayload = Depends(get_current_user_payload)
):
    """
    Step 4, 5, 6: Runs preprocessing, model inference, risk scoring, explainable findings,
    and returns categorized threat results.
    """
    if not request.events:
        raise HTTPException(status_code=400, detail="No event records provided for threat detection.")
        
    try:
        df = pd.DataFrame(request.events)
        results = inference_engine.predict_batch(
            df=df,
            model_name=request.model_name or "ANN / MLP",
            asset_endpoint=request.asset_endpoint or "/api/v1/network"
        )
        
        total_analyzed = len(results)
        threats_found = sum(1 for r in results if r["prediction"] != "Benign")
        critical_count = sum(1 for r in results if r["severity"] == "Critical")
        high_count = sum(1 for r in results if r["severity"] == "High")
        medium_count = sum(1 for r in results if r["severity"] == "Medium")
        low_count = sum(1 for r in results if r["severity"] == "Low")

        await log_audit_event(
            db=db,
            user_email=payload.email,
            action="MODEL_INFERENCE",
            resource=f"BATCH_DETECTION ({total_analyzed} records)",
            result="SUCCESS",
            details={"model": request.model_name, "threats_found": threats_found}
        )

        return BatchDetectionOut(
            total_analyzed=total_analyzed,
            threats_found=threats_found,
            critical_count=critical_count,
            high_count=high_count,
            medium_count=medium_count,
            low_count=low_count,
            model_used=request.model_name or "ANN / MLP",
            results=results
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Threat Detection Engine failure: {str(e)}")
