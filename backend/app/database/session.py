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
