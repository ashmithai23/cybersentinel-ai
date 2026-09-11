export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'Admin' | 'Security Analyst' | 'Viewer';
}

export interface DashboardStats {
  total_events: number;
  threats_detected: number;
  critical_findings: number;
  high_findings: number;
  model_accuracy: number;
  false_positive_rate: number;
  system_health: string;
  is_demo_mode: boolean;
  threats_over_time: Array<{ time: string; benign: number; threats: number }>;
  attack_category_distribution: Array<{ category: string; count: number; percentage: number }>;
  severity_distribution: Array<{ severity: string; count: number; color: string }>;
  confidence_distribution: Array<{ range: string; count: number }>;
  top_affected_endpoints: Array<{ endpoint: string; threat_count: number; severity: string }>;
  recent_findings: Array<{
    id: number;
    code: string;
    title: string;
    category: string;
    severity: string;
    confidence: number;
    asset: string;
    status: string;
    detected_at: string;
  }>;
}

export interface PredictionResult {
  event_index: number;
  prediction: string;
  confidence: number;
  risk_score: number;
  severity: string;
  severity_color: string;
  risk_reasons: string[];
  top_features: Array<{
    feature: string;
    description: string;
    value: number;
    contribution_percentage: number;
  }>;
  explanation: string;
  model_used: string;
  raw_attributes: Record<string, any>;
}

export interface BatchDetectionResponse {
  total_analyzed: number;
  threats_found: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  model_used: string;
  results: PredictionResult[];
}

export interface Finding {
  id: number;
  finding_code: string;
  title: string;
  category: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  confidence: number;
  affected_asset: string;
  description: string;
  evidence?: Record<string, any>;
  potential_impact: string;
  recommendation: string;
  remediation: string;
  status: 'New' | 'Under Review' | 'Confirmed' | 'False Positive' | 'Resolved';
  assigned_analyst?: string;
  notes?: Array<{ author: string; text: string }>;
  created_at: string;
  updated_at: string;
}

export interface ModelComparisonData {
  active_production_model: string;
  models: Record<string, any>;
  comparison_table: Array<{
    model: string;
    type: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    inference_time_ms: number;
    status: string;
  }>;
}

export interface NetworkAnalysis {
  total_packets: number;
  total_bandwidth_mb: number;
  unique_sources: number;
  unique_destinations: number;
  protocol_distribution: Array<{ protocol: string; packets: number; percentage: number }>;
  top_source_ips: Array<{ ip: string; country: string; bytes_mb: number; threat_level: string }>;
  top_destination_ips: Array<{ ip: string; service: string; packets: number }>;
  traffic_timeline: Array<{ timestamp: string; mbps: number; anomalies: number }>;
  detected_anomalies: Array<{ id: string; type: string; src: string; dst: string; reason: string }>;
}

export interface ApiSecurityAnalysis {
  total_api_requests: number;
  auth_failure_count: number;
  sqli_attempts_count: number;
  xss_attempts_count: number;
  rate_limit_violations: number;
  top_targeted_endpoints: Array<{
    path: string;
    method: string;
    requests: number;
    anomalies: number;
    status_breakdown?: Record<string, number>;
  }>;
  recent_payload_anomalies: Array<{
    id: string;
    endpoint: string;
    threat_type: string;
    confidence: number;
    detected_pattern: string;
    client_ip: string;
    timestamp: string;
  }>;
}

export interface SecurityReport {
  id: number;
  report_uuid: string;
  title: string;
  executive_summary: string;
  generated_by: string;
  file_path: string;
  format: 'PDF' | 'JSON' | 'CSV';
  total_findings: number;
  critical_count: number;
  high_count: number;
  created_at: string;
}

export interface SystemInfo {
  app_name: string;
  version: string;
  environment: string;
  is_demo_mode: boolean;
  active_dataset: string;
  active_model: string;
  architecture: {
    problem_statement: string;
    solution: string;
    dataset_details: Record<string, any>;
    ml_justifications: Record<string, string>;
    risk_scoring_formula: string;
  };
  ethical_boundary: string;
}

export interface SystemStatus {
  system_status: string;
  model_status: string;
  api_status: string;
  database_status: string;
  environment: string;
  is_demo_mode: boolean;
  supabase_connected: boolean;
}
