from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# --- AUTH SCHEMAS ---
class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "Security Analyst"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

# --- DASHBOARD SCHEMAS ---
class MetricCard(BaseModel):
    title: str
    value: str
    change: str
    trend: str # "up", "down", "neutral"
    color: str

class DashboardStatsOut(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    
    total_events: int
    threats_detected: int
    critical_findings: int
    high_findings: int
    model_accuracy: float
    false_positive_rate: float
    system_health: str
    is_demo_mode: bool
    threats_over_time: List[Dict[str, Any]]
    attack_category_distribution: List[Dict[str, Any]]
    severity_distribution: List[Dict[str, Any]]
    confidence_distribution: List[Dict[str, Any]]
    top_affected_endpoints: List[Dict[str, Any]]
    recent_findings: List[Dict[str, Any]]

# --- DETECTION SCHEMAS ---
class ColumnMappingRequest(BaseModel):
    columns: List[str]

class DetectionRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    model_name: Optional[str] = "ANN / MLP"
    asset_endpoint: Optional[str] = "/api/v1/network"
    events: List[Dict[str, Any]]

class SinglePredictionResult(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    event_index: int
    prediction: str
    confidence: float
    risk_score: int
    severity: str
    severity_color: str
    risk_reasons: List[str]
    top_features: List[Dict[str, Any]]
    explanation: str
    model_used: str
    raw_attributes: Dict[str, Any]

class BatchDetectionOut(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    total_analyzed: int
    threats_found: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    model_used: str
    results: List[SinglePredictionResult]

# --- FINDINGS SCHEMAS ---
class FindingCreate(BaseModel):
    title: str
    category: str
    severity: str
    confidence: float
    affected_asset: str
    description: str
    evidence: Optional[Dict[str, Any]] = None
    potential_impact: str
    recommendation: str
    remediation: str

class FindingStatusUpdate(BaseModel):
    status: str # New, Under Review, Confirmed, False Positive, Resolved
    assigned_analyst: Optional[str] = None

class FindingNoteCreate(BaseModel):
    text: str

class FindingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    finding_code: str
    title: str
    category: str
    severity: str
    confidence: float
    affected_asset: str
    description: str
    evidence: Optional[Dict[str, Any]] = None
    potential_impact: str
    recommendation: str
    remediation: str
    status: str
    assigned_analyst: Optional[str] = None
    notes: Optional[List[Dict[str, Any]]] = []
    created_at: datetime
    updated_at: datetime

# --- MODEL MONITORING SCHEMAS ---
class ModelVersionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    id: int
    model_name: str
    model_type: str
    version: str
    training_dataset: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    status: str
    created_at: datetime

class ModelComparisonOut(BaseModel):
    active_production_model: str
    models: Dict[str, Any]
    comparison_table: List[Dict[str, Any]]

# --- NETWORK ANALYSIS SCHEMAS ---
class NetworkAnalysisOut(BaseModel):
    total_packets: int
    total_bandwidth_mb: float
    unique_sources: int
    unique_destinations: int
    protocol_distribution: List[Dict[str, Any]]
    top_source_ips: List[Dict[str, Any]]
    top_destination_ips: List[Dict[str, Any]]
    traffic_timeline: List[Dict[str, Any]]
    detected_anomalies: List[Dict[str, Any]]

# --- API SECURITY SCHEMAS ---
class ApiSecurityAnalysisOut(BaseModel):
    total_api_requests: int
    auth_failure_count: int
    sqli_attempts_count: int
    xss_attempts_count: int
    rate_limit_violations: int
    top_targeted_endpoints: List[Dict[str, Any]]
    recent_payload_anomalies: List[Dict[str, Any]]

# --- REPORT SCHEMAS ---
class ReportCreateRequest(BaseModel):
    title: Optional[str] = "CyberSentinel AI Security Assessment Report"
    include_evidence: bool = True
    format: str = "PDF" # PDF, JSON, CSV

class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    report_uuid: str
    title: str
    executive_summary: str
    generated_by: str
    file_path: str
    format: str
    total_findings: int
    critical_count: int
    high_count: int
    created_at: datetime

# --- AUDIT LOG SCHEMAS ---
class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_email: str
    action: str
    resource: str
    result: str
    ip_address: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime

# --- SYSTEM & INTERVIEW MODE INFO ---
class SystemInfoOut(BaseModel):
    app_name: str
    version: str
    environment: str
    is_demo_mode: bool
    active_dataset: str
    active_model: str
    architecture: Dict[str, Any]
    ethical_boundary: str
