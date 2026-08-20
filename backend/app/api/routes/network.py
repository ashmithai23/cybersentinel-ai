from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from backend.app.database.session import get_db
from backend.app.schemas.schemas import NetworkAnalysisOut
from backend.app.core.security import get_current_user_payload, TokenPayload

router = APIRouter(prefix="/network", tags=["Network Analysis"])

@router.get("/overview", response_model=NetworkAnalysisOut)
async def get_network_analysis_overview(
    db: AsyncSession = Depends(get_db),
    payload: TokenPayload = Depends(get_current_user_payload)
):
    protocol_dist = [
        {"protocol": "TCP", "packets": 18240, "percentage": 73.4},
        {"protocol": "UDP", "packets": 4120, "percentage": 16.6},
        {"protocol": "HTTP/HTTPS", "packets": 1980, "percentage": 8.0},
        {"protocol": "ICMP", "packets": 511, "percentage": 2.0}
    ]
    
    top_sources = [
        {"ip": "198.51.100.42", "country": "US", "bytes_mb": 482.0, "threat_level": "Critical"},
        {"ip": "203.0.113.88", "country": "NL", "bytes_mb": 145.5, "threat_level": "High"},
        {"ip": "203.0.113.45", "country": "DE", "bytes_mb": 98.2, "threat_level": "High"},
        {"ip": "198.51.100.104", "country": "RO", "bytes_mb": 42.0, "threat_level": "Medium"},
        {"ip": "10.0.2.14", "country": "Internal", "bytes_mb": 1250.0, "threat_level": "Low"}
    ]
    
    top_dests = [
        {"ip": "10.0.4.15", "service": "API Gateway (443)", "packets": 14500},
        {"ip": "10.0.1.5", "service": "Web App (80)", "packets": 4200},
        {"ip": "192.168.1.10", "service": "SSH Bastion (22)", "packets": 2400},
        {"ip": "10.0.1.25", "service": "Database Cluster (5432)", "packets": 1800}
    ]
    
    traffic_timeline = [
        {"timestamp": "18:00", "mbps": 45.2, "anomalies": 2},
        {"timestamp": "18:10", "mbps": 88.4, "anomalies": 5},
        {"timestamp": "18:20", "mbps": 420.0, "anomalies": 48},
        {"timestamp": "18:30", "mbps": 510.5, "anomalies": 64},
        {"timestamp": "18:40", "mbps": 120.0, "anomalies": 12},
        {"timestamp": "18:50", "mbps": 52.1, "anomalies": 3}
    ]
    
    anomalies = [
        {"id": "ANOM-01", "type": "Volumetric Flood", "src": "198.51.100.42", "dst": "10.0.4.15", "reason": "Sustained >50,000 pps TCP SYN burst."},
        {"id": "ANOM-02", "type": "Port Scan Sweep", "src": "198.51.100.104", "dst": "10.0.1.0/24", "reason": "1024 distinct ports touched in 15 seconds."}
    ]

    return NetworkAnalysisOut(
        total_packets=24851,
        total_bandwidth_mb=2017.7,
        unique_sources=342,
        unique_destinations=18,
        protocol_distribution=protocol_dist,
        top_source_ips=top_sources,
        top_destination_ips=top_dests,
        traffic_timeline=traffic_timeline,
        detected_anomalies=anomalies
    )
