import os
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
            
            # Seed initial realistic defensive findings
            f1 = Finding(
                finding_code="FIND-2026-001",
                title="Volumetric HTTP Flood Attack Detected (DoS)",
                category="Denial of Service (DoS)",
                severity="Critical",
                confidence=99.2,
                affected_asset="Gateway Load Balancer / API Gateway (10.0.4.15)",
                description="AI Detection Engine identified a sudden spike of 45,000 requests/sec with TCP SYN flag anomaly originating from external subnet 198.51.100.0/24.",
                evidence={"flow_duration_us": 120, "flow_packets_s": 50000, "syn_flags": 1},
                potential_impact="Exhaustion of connection table capacity leading to service outage for legitimate API clients.",
                recommendation="Deploy rate-limiting at Web Application Firewall (WAF) and enforce BGP Anycast scrubbing.",
                remediation="1. Enable AWS Shield / Cloudflare DDoS Protection.\n2. Configure IP rate-limit rule: max 200 req/min per IP.\n3. Drop TCP SYN packets without valid cookie response.",
                status="New",
                assigned_analyst="admin@cybersentinel.ai",
                notes=[{"author": "System AI", "text": "High confidence classification (99.2%) via 1D CNN model."}]
            )
            f2 = Finding(
                finding_code="FIND-2026-002",
                title="SQL Injection Vector in User Authentication Parameter",
                category="Web Attack - SQLi",
                severity="High",
                confidence=94.5,
                affected_asset="Auth Microservice /api/v1/auth/login",
                description="Malicious SQL payload `' UNION SELECT username, password_hash FROM users--` detected in request body parameter during AI payload inspection.",
                evidence={"destination_port": 443, "payload_len": 1650, "psh_flag": 1},
                potential_impact="Unauthorized data extraction from backend PostgreSQL database tables and credential bypass.",
                recommendation="Enforce parameterized SQL queries via ORM and sanitize all incoming JSON payload attributes.",
                remediation="1. Replace raw SQL query with SQLAlchemy parameterized ORM calls.\n2. Apply input validation regex restricting special characters in username fields.",
                status="Under Review",
                assigned_analyst="analyst@cybersentinel.ai",
                notes=[{"author": "analyst@cybersentinel.ai", "text": "Reviewing payload logs; confirmed parameter sanitization bug."}]
            )
            f3 = Finding(
                finding_code="FIND-2026-003",
                title="SSH Automated Brute Force Campaign",
                category="Brute Force",
                severity="High",
                confidence=96.1,
                affected_asset="Bastion Host (192.168.1.10:22)",
                description="Sustained sequence of 1,200 failed SSH authentication events detected over 300 seconds from remote host 203.0.113.45.",
                evidence={"destination_port": 22, "flow_packets": 2400, "duration_ms": 300000},
                potential_impact="Potential unauthorized shell access if weak SSH credentials exist on target bastion host.",
                recommendation="Disable SSH password authentication in favor of public key authentication and install Fail2Ban.",
                remediation="1. Set 'PasswordAuthentication no' in /etc/ssh/sshd_config.\n2. Restrict SSH access to authorized corporate VPN IP range.",
                status="Confirmed",
                assigned_analyst="analyst@cybersentinel.ai",
                notes=[{"author": "analyst@cybersentinel.ai", "text": "Attacking IP blocked at firewall border."}]
            )
            f4 = Finding(
                finding_code="FIND-2026-004",
                title="Automated Port Scan Sequence Detected",
                category="PortScan",
                severity="Medium",
                confidence=89.7,
                affected_asset="Internal Subnet Range (10.0.1.0/24)",
                description="Sequential TCP SYN packets directed to 1,024 destination ports within 15 seconds indicating automated Nmap scan activity.",
                evidence={"total_ports_scanned": 1024, "syn_flag_count": 1024, "flow_duration_us": 15000},
                potential_impact="Reconnaissance phase of multi-stage attack enabling discovery of open service ports.",
                recommendation="Implement firewall stealth rules and block scanning source IP.",
                remediation="1. Configure iptables to drop TCP port sweep attempts.\n2. Enable automatic dynamic IP blocking.",
                status="Resolved",
                assigned_analyst="admin@cybersentinel.ai",
                notes=[{"author": "admin@cybersentinel.ai", "text": "Confirmed internal vulnerability scanner test; rule updated."}]
            )
            session.add_all([f1, f2, f3, f4])

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
            
            # Initial Audit Log entry
            audit = AuditLog(
                user_email="system@cybersentinel.ai",
                action="SYSTEM_INIT",
                resource="DATABASE",
                result="SUCCESS",
                ip_address="127.0.0.1",
                details={"message": "CyberSentinel AI database initialized with default security roles and defensive models."}
            )
            session.add(audit)
            
            await session.commit()
