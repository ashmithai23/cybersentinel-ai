from typing import Dict, Any, List

# Category baseline risk multiplier out of 100
CATEGORY_BASE_RISK = {
    "Benign": 0,
    "Denial of Service (DoS)": 85,
    "PortScan": 45,
    "Brute Force": 75,
    "Web Attack - SQLi": 90,
    "Web Attack - XSS": 70,
    "Botnet": 95,
    "Infiltration": 95
}

class CyberSentinelRiskEngine:
    """
    Transparent Risk Scoring Engine for CyberSentinel AI.
    Calculates numerical risk score (0 - 100) and severity level based on
    Model Confidence, Threat Category Impact, Endpoint Criticality, and Rule Indicators.
    """
    @staticmethod
    def calculate_risk(
        attack_category: str,
        confidence: float,
        asset_endpoint: str = "/api/v1/user",
        is_repeat_offender: bool = False
    ) -> Dict[str, Any]:
        
        base_risk = CATEGORY_BASE_RISK.get(attack_category, 50)
        reasons = []
        
        if attack_category == "Benign":
            return {
                "score": 0,
                "severity": "Low",
                "color": "#10B981", # emerald/green
                "reasons": ["Validated benign traffic pattern with low risk footprint."]
            }
            
        reasons.append(f"Threat category '{attack_category}' carries base threat weight of {base_risk}/100.")
        
        # 1. Model confidence weight adjustment
        confidence_factor = max(0.5, confidence)
        score = base_risk * confidence_factor
        reasons.append(f"Model confidence level of {round(confidence * 100, 1)}% applied as scaling factor.")
        
        # 2. Endpoint criticality adjustment
        critical_endpoints = ["/api/v1/auth", "/admin", "/payment", "/db", "/api/v1/users", "192.168.1.1"]
        is_sensitive = any(ep in asset_endpoint.lower() for ep in critical_endpoints)
        if is_sensitive:
            score += 10
            reasons.append(f"Target asset endpoint '{asset_endpoint}' is classified as critical infrastructure.")
            
        # 3. Frequency / Repetition adjustment
        if is_repeat_offender:
            score += 15
            reasons.append("Multiple recurring security anomalies detected from identical source IP within active window.")
            
        final_score = int(min(100, max(0, round(score))))
        
        if final_score >= 85:
            severity = "Critical"
            color = "#EF4444" # red
        elif final_score >= 65:
            severity = "High"
            color = "#F97316" # orange
        elif final_score >= 35:
            severity = "Medium"
            color = "#F59E0B" # yellow
        elif final_score >= 15:
            severity = "Low"
            color = "#3B82F6" # blue
        else:
            severity = "Informational"
            color = "#10B981" # green
            
        return {
            "score": final_score,
            "severity": severity,
            "color": color,
            "reasons": reasons
        }
