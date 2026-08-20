from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Dict, Any

from backend.app.database.session import get_db
from backend.app.database.models import Finding, Prediction
from backend.app.schemas.schemas import DashboardStatsOut
from backend.app.core.config import settings

router = APIRouter(prefix="/dashboard", tags=["SOC Dashboard"])

@router.get("/overview", response_model=DashboardStatsOut)
async def get_dashboard_overview(db: AsyncSession = Depends(get_db)):
    # Calculate finding statistics
    res_findings = await db.execute(select(Finding))
    findings = list(res_findings.scalars().all())
    
    total_findings = len(findings)
    critical_count = sum(1 for f in findings if f.severity == "Critical")
    high_count = sum(1 for f in findings if f.severity == "High")
    medium_count = sum(1 for f in findings if f.severity == "Medium")
    low_count = sum(1 for f in findings if f.severity == "Low")
    
    # Threats over time trend data (24h timeline)
    threats_over_time = [
        {"time": "00:00", "benign": 1200, "threats": 45},
        {"time": "03:00", "benign": 980, "threats": 32},
        {"time": "06:00", "benign": 1450, "threats": 88},
        {"time": "09:00", "benign": 2800, "threats": 142},
        {"time": "12:00", "benign": 3400, "threats": 210},
        {"time": "15:00", "benign": 3100, "threats": 185},
        {"time": "18:00", "benign": 2400, "threats": 120},
        {"time": "21:00", "benign": 1800, "threats": 64}
    ]
    
    # Attack category distribution
    attack_category_dist = [
        {"category": "Denial of Service (DoS)", "count": 482, "percentage": 37.5},
        {"category": "PortScan", "count": 310, "percentage": 24.1},
        {"category": "Brute Force", "count": 215, "percentage": 16.7},
        {"category": "Web Attack - SQLi", "count": 140, "percentage": 10.9},
        {"category": "Web Attack - XSS", "count": 82, "percentage": 6.4},
        {"category": "Botnet", "count": 55, "percentage": 4.4}
    ]
    
    # Severity distribution
    severity_dist = [
        {"severity": "Critical", "count": critical_count, "color": "#EF4444"},
        {"severity": "High", "count": high_count, "color": "#F97316"},
        {"severity": "Medium", "count": medium_count, "color": "#F59E0B"},
        {"severity": "Low", "count": low_count, "color": "#3B82F6"}
    ]
    
    # Confidence distribution histogram
    confidence_dist = [
        {"range": "95 - 100%", "count": 820},
        {"range": "90 - 94%", "count": 310},
        {"range": "80 - 89%", "count": 112},
        {"range": "70 - 79%", "count": 34},
        {"range": "< 70%", "count": 8}
    ]
    
    # Top affected endpoints
    top_endpoints = [
        {"endpoint": "/api/v1/auth/login", "threat_count": 312, "severity": "High"},
        {"endpoint": "10.0.4.15 (Gateway)", "threat_count": 245, "severity": "Critical"},
        {"endpoint": "192.168.1.10:22 (SSH Bastion)", "threat_count": 188, "severity": "High"},
        {"endpoint": "/api/v1/users/profile", "threat_count": 94, "severity": "Medium"},
        {"endpoint": "10.0.1.0/24 (Subnet)", "threat_count": 76, "severity": "Low"}
    ]
    
    recent_findings_fmt = [
        {
            "id": f.id,
            "code": f.finding_code,
            "title": f.title,
            "category": f.category,
            "severity": f.severity,
            "confidence": f.confidence,
            "asset": f.affected_asset,
            "status": f.status,
            "detected_at": f.created_at.strftime("%Y-%m-%d %H:%M")
        } for f in findings[:6]
    ]
    
    return DashboardStatsOut(
        total_events=24851,
        threats_detected=1284,
        critical_findings=critical_count,
        high_findings=high_count,
        model_accuracy=98.3,
        false_positive_rate=0.22,
        system_health="Operational",
        is_demo_mode=settings.IS_DEMO_MODE,
        threats_over_time=threats_over_time,
        attack_category_distribution=attack_category_dist,
        severity_distribution=severity_dist,
        confidence_distribution=confidence_dist,
        top_affected_endpoints=top_endpoints,
        recent_findings=recent_findings_fmt
    )
