from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey, Column
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

def utc_now():
    return datetime.now(timezone.utc)

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="Security Analyst", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now)

class SecurityEvent(Base):
    __tablename__ = "security_events"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    event_uuid: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    source_ip: Mapped[str] = mapped_column(String(64), index=True)
    dest_ip: Mapped[str] = mapped_column(String(64), index=True)
    dest_port: Mapped[int] = mapped_column(Integer, index=True)
    protocol: Mapped[str] = mapped_column(String(20), default="TCP")
    flow_duration: Mapped[float] = mapped_column(Float, default=0.0)
    packet_count: Mapped[int] = mapped_column(Integer, default=1)
    bytes_count: Mapped[int] = mapped_column(Integer, default=0)
    raw_payload: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

class Prediction(Base):
    __tablename__ = "predictions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    event_uuid: Mapped[str] = mapped_column(String(64), index=True)
    model_name: Mapped[str] = mapped_column(String(50), index=True)
    prediction_label: Mapped[str] = mapped_column(String(50), index=True)
    confidence: Mapped[float] = mapped_column(Float)
    risk_score: Mapped[int] = mapped_column(Integer)
    severity: Mapped[str] = mapped_column(String(20), index=True)
    top_features: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

class ModelVersion(Base):
    __tablename__ = "model_versions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    model_name: Mapped[str] = mapped_column(String(50), index=True)
    model_type: Mapped[str] = mapped_column(String(50))
    version: Mapped[str] = mapped_column(String(20))
    training_dataset: Mapped[str] = mapped_column(String(100), default="CIC-IDS2017 Synthetic")
    accuracy: Mapped[float] = mapped_column(Float)
    precision: Mapped[float] = mapped_column(Float)
    recall: Mapped[float] = mapped_column(Float)
    f1_score: Mapped[float] = mapped_column(Float)
    roc_auc: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(20), default="Candidate") # Production, Candidate, Archived
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

class Finding(Base):
    __tablename__ = "findings"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    finding_code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(50), index=True)
    severity: Mapped[str] = mapped_column(String(20), index=True) # Critical, High, Medium, Low, Informational
    confidence: Mapped[float] = mapped_column(Float)
    affected_asset: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    evidence: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    potential_impact: Mapped[str] = mapped_column(Text)
    recommendation: Mapped[str] = mapped_column(Text)
    remediation: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default="New", index=True) # New, Under Review, Confirmed, False Positive, Resolved
    assigned_analyst: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    notes: Mapped[Optional[dict]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now)

class Report(Base):
    __tablename__ = "reports"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    report_uuid: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    executive_summary: Mapped[str] = mapped_column(Text)
    generated_by: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(255))
    format: Mapped[str] = mapped_column(String(10), default="PDF")
    total_findings: Mapped[int] = mapped_column(Integer, default=0)
    critical_count: Mapped[int] = mapped_column(Integer, default=0)
    high_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_email: Mapped[str] = mapped_column(String(255), index=True)
    action: Mapped[str] = mapped_column(String(100), index=True)
    resource: Mapped[str] = mapped_column(String(255))
    result: Mapped[str] = mapped_column(String(50), default="Success")
    ip_address: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    details: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

class Dataset(Base):
    __tablename__ = "datasets"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    filename: Mapped[str] = mapped_column(String(255))
    num_samples: Mapped[int] = mapped_column(Integer)
    attack_distribution: Mapped[dict] = mapped_column(JSON)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
