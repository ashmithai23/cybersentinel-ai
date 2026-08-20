from fastapi import APIRouter
from typing import Dict, Any
from backend.app.schemas.schemas import SystemInfoOut
from backend.app.core.config import settings

router = APIRouter(prefix="/info", tags=["Interview Mode & Project Metadata"])

@router.get("", response_model=SystemInfoOut)
async def get_project_interview_info():
    architecture_metadata = {
        "problem_statement": "Legacy Rule-based Intrusion Detection Systems (IDS) suffer from high false-positive rates and fail to detect novel attack variants in high-throughput network environments.",
        "solution": "CyberSentinel AI combines Deep Learning (ANN, 1D CNN, LSTM) with SHAP feature explainability, automated risk scoring, and human-in-the-loop analyst workflow.",
        "dataset_details": {
            "name": "CIC-IDS2017 Benchmark Schema",
            "sample_count": 10000,
            "feature_count": 32,
            "categories": ["Benign", "Denial of Service (DoS)", "PortScan", "Brute Force", "Web Attack - SQLi", "Web Attack - XSS", "Botnet", "Infiltration"]
        },
        "ml_justifications": {
            "why_ann": "Multi-Layer Perceptron (MLP) effectively models non-linear correlations across high-dimensional static flow features with rapid batch inference (<6ms).",
            "why_cnn1d": "1D CNN filters extract spatial patterns and local metric correlations across adjacent network attributes (e.g. packet header size ratios).",
            "why_lstm": "Recurrent LSTM memory units capture multi-step temporal attack progressions over sequential time windows (e.g. multi-failed logins followed by privilege escalation).",
            "why_fastapi": "Asynchronous Python framework with native Pydantic schema validation, automatic OpenAPI / Swagger generation, and high throughput async I/O.",
            "why_supabase": "Enterprise PostgreSQL with Row Level Security (RLS), instant REST/realtime hooks, and effortless cloud persistence."
        },
        "risk_scoring_formula": "Risk Score = Base Category Weight (0-100) x Model Confidence % + Sensitive Asset Bonus (+10) + Repeat Frequency Bonus (+15). Range: 0 to 100."
    }
    
    return SystemInfoOut(
        app_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        is_demo_mode=settings.IS_DEMO_MODE,
        active_dataset="CIC-IDS2017 Defensive Benchmark",
        active_model="ANN / MLP (Production)",
        architecture=architecture_metadata,
        ethical_boundary="DEFENSIVE ONLY. No autonomous exploitation, credential theft, or unauthorized scanning."
    )
