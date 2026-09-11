import os
from datetime import datetime, timezone
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from backend.app.core.config import settings
from backend.app.database.models import Base, User, Finding, ModelVersion, Dataset, AuditLog
from backend.app.core.security import get_password_hash

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as session:
        # Check if admin user exists
        from sqlalchemy import select
        res = await session.execute(select(User).where(User.email == "admin@cybersentinel.ai"))
        admin_user = res.scalar_one_or_none()
        
        if not admin_user:
            demo_admin = User(
                email="admin@cybersentinel.ai",
                hashed_password=get_password_hash("CyberSentinel2026!"),
                full_name="Lead Security Analyst",
                role="Admin",
                is_active=True
            )
            demo_analyst = User(
                email="analyst@cybersentinel.ai",
                hashed_password=get_password_hash("AnalystPass123!"),
                full_name="SOC Tier 2 Analyst",
                role="Security Analyst",
                is_active=True
            )
            demo_viewer = User(
                email="viewer@cybersentinel.ai",
                hashed_password=get_password_hash("ViewerPass123!"),
                full_name="Executive Dashboard Viewer",
                role="Viewer",
                is_active=True
            )
            session.add_all([demo_admin, demo_analyst, demo_viewer])

            # Seed model version metadata
            m1 = ModelVersion(
                model_name="ANN / MLP",
                model_type="Deep Neural Network",
                version="v1.0.0",
                training_dataset="CIC-IDS2017 Defensive Dataset",
                accuracy=0.9827,
                precision=0.9734,
                recall=0.9827,
                f1_score=0.9766,
                roc_auc=0.9998,
                status="Production"
            )
            m2 = ModelVersion(
                model_name="1D CNN",
                model_type="Convolutional Neural Network",
                version="v1.0.0",
                training_dataset="CIC-IDS2017 Defensive Dataset",
                accuracy=0.9820,
                precision=0.9819,
                recall=0.9820,
                f1_score=0.9819,
                roc_auc=0.9996,
                status="Candidate"
            )
            m3 = ModelVersion(
                model_name="LSTM",
                model_type="Sequence Recurrent Network",
                version="v1.0.0",
                training_dataset="CIC-IDS2017 Defensive Dataset",
                accuracy=0.9827,
                precision=0.9734,
                recall=0.9827,
                f1_score=0.9766,
                roc_auc=0.9997,
                status="Candidate"
            )
            m4 = ModelVersion(
                model_name="Random Forest Baseline",
                model_type="Ensemble Machine Learning",
                version="v1.0.0",
                training_dataset="CIC-IDS2017 Defensive Dataset",
                accuracy=0.9830,
                precision=0.9825,
                recall=0.9830,
                f1_score=0.9828,
                roc_auc=0.9999,
                status="Candidate"
            )
            session.add_all([m1, m2, m3, m4])
            
            # Seed Initial Findings for SOC Analyst Workflows
            f1 = Finding(
                finding_code="FIND-2026-001",
                title="Critical SQL Injection Attempt Detected",
                category="Web Attack - SQL Injection",
                severity="Critical",
                confidence=98.5,
                affected_asset="/api/v1/auth/login",
                description="Multiple SQL injection payloads detected in User-Agent and HTTP query parameters attempting database schema extraction.",
                evidence={"payload": "UNION SELECT 1, @@version, user() --", "source_ip": "198.51.100.45"},
                potential_impact="Unauthorized database read access, credential exfiltration, or administrative authentication bypass.",
                recommendation="Enforce parametrized SQL queries, strict input validation, and Web Application Firewall (WAF) rule blocking.",
                remediation="Upgrade database access layer to Async SQLAlchemy ORM parameters and apply rate-limiting middleware.",
                status="New",
                assigned_analyst="admin@cybersentinel.ai",
                notes=[{"author": "system@cybersentinel.ai", "text": "Flagged automatically by CyberSentinel ANN Deep Learning Engine."}]
            )
            f2 = Finding(
                finding_code="FIND-2026-002",
                title="Volumetric DDoS Flood Traffic Detected",
                category="DDoS",
                severity="Critical",
                confidence=99.2,
                affected_asset="/api/v1/gateway",
                description="High packet flow velocity exceeding 35,000 packets/sec observed from distributed source IPs targeting main API gateway.",
                evidence={"packet_rate": 35400, "protocol": "TCP SYN"},
                potential_impact="Service disruption, resource exhaustion, and HTTP 503 gateway timeouts for legitimate users.",
                recommendation="Enable adaptive rate limiting, IP throttling, and upstream BGP DDoS scrubbing.",
                remediation="Apply rate limiting rules in FastAPI middleware and Cloudflare proxy rules.",
                status="Under Review",
                assigned_analyst="analyst@cybersentinel.ai",
                notes=[{"author": "system@cybersentinel.ai", "text": "Automated alert triggered by packet frequency anomaly threshold."}]
            )
            f3 = Finding(
                finding_code="FIND-2026-003",
                title="High Frequency Port Scanning Activity",
                category="PortScan",
                severity="High",
                confidence=96.8,
                affected_asset="192.168.1.105 (Internal Subnet)",
                description="Sequential TCP SYN probes detected across ports 1-1024 originating from an external untrusted host.",
                evidence={"probed_ports": [21, 22, 80, 443, 3306, 8080], "scanner": "Nmap 7.94"},
                potential_impact="Reconnaissance identifying exposed internal microservices and vulnerable listening ports.",
                recommendation="Block scanning source IP at peripheral firewall and close unused listening ports.",
                remediation="Update iptables firewall rules to drop SYN probe sweeps automatically.",
                status="Confirmed",
                assigned_analyst="analyst@cybersentinel.ai",
                notes=[{"author": "analyst@cybersentinel.ai", "text": "Confirmed active scanner; source IP added to blocklist."}]
            )
            f4 = Finding(
                finding_code="FIND-2026-004",
                title="Botnet Command & Control Keepalive Signals",
                category="Bot",
                severity="High",
                confidence=94.3,
                affected_asset="10.0.4.12 (Database Host)",
                description="Periodic outbound beaconing traffic with suspicious payload signatures detected towards external C2 servers.",
                evidence={"beacon_interval": "60s", "dest_ip": "203.0.113.88"},
                potential_impact="Potential host compromise, malware beaconing, or data exfiltration channel.",
                recommendation="Isolate database host from internal subnet and perform incident response forensic scan.",
                remediation="Quarantine host 10.0.4.12, rotate database credentials, and revoke active JWT tokens.",
                status="New",
                assigned_analyst="admin@cybersentinel.ai",
                notes=[{"author": "system@cybersentinel.ai", "text": "Detected by CyberSentinel LSTM Sequence Threat Model."}]
            )
            session.add_all([f1, f2, f3, f4])
            
            # Initial Audit Log entry
            audit = AuditLog(
                user_email="system@cybersentinel.ai",
                action="SYSTEM_INIT",
                resource="DATABASE",
                result="SUCCESS",
                ip_address="127.0.0.1",
                details={"message": "CyberSentinel AI database initialized with default security roles, defensive models, and initial findings."}
            )
            session.add(audit)
            
            await session.commit()
