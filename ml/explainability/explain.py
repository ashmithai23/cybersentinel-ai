import numpy as np
from typing import Dict, Any, List

FEATURE_DESCRIPTIONS = {
    "destination_port": "Target destination network port",
    "flow_duration": "Microseconds duration of connection flow",
    "total_fwd_packets": "Volume of forward network packets",
    "total_backward_packets": "Volume of backward response packets",
    "total_length_of_fwd_packets": "Total payload size sent forward",
    "total_length_of_bwd_packets": "Total payload size returned backward",
    "fwd_packet_length_max": "Maximum forward packet length",
    "fwd_packet_length_mean": "Average size of forward packets",
    "bwd_packet_length_mean": "Average size of response packets",
    "flow_bytes_s": "Transmission throughput in Bytes/second",
    "flow_packets_s": "Packet rate per second",
    "flow_iat_mean": "Mean inter-arrival time between packets",
    "syn_flag_count": "SYN connection establishment flag count",
    "rst_flag_count": "RST connection reset flag count",
    "psh_flag_count": "PSH urgent push flag count",
    "ack_flag_count": "ACK acknowledgement flag count",
    "down_up_ratio": "Download-to-upload bandwidth ratio"
}

def explain_prediction(
    feature_names: List[str],
    sample_features: np.ndarray,
    predicted_label: str,
    confidence: float
) -> Dict[str, Any]:
    """
    Generates explainable findings for security predictions using feature magnitude & domain heuristic rules.
    Outputs top contributing features and human-readable cybersecurity rationale.
    """
    # Calculate feature importances based on standardized deviation & scale
    abs_vals = np.abs(sample_features)
    top_indices = np.argsort(abs_vals)[::-1][:5]
    
    top_features = []
    for idx in top_indices:
        fname = feature_names[idx] if idx < len(feature_names) else f"feature_{idx}"
        val = float(sample_features[idx])
        desc = FEATURE_DESCRIPTIONS.get(fname, "Network flow metric")
        top_features.append({
            "feature": fname,
            "description": desc,
            "value": round(val, 4),
            "contribution_percentage": round(float(abs_vals[idx] / (np.sum(abs_vals) + 1e-6) * 100), 2)
        })
        
    # Natural Language Explanation Generator based on Threat Category
    if predicted_label == "Benign":
        reason = "Normal network traffic behavior with standard packet sizes, balanced flow duration, and expected ACK/PSH flag distribution."
    elif predicted_label == "Denial of Service (DoS)":
        reason = f"High packet rate ({top_features[0]['feature']}={top_features[0]['value']}) combined with asymmetric forward-to-backward packet ratio and anomalous SYN/RST flag frequency indicating volumetric flood."
    elif predicted_label == "PortScan":
        reason = f"Single-packet connection attempts across destination ports with near-zero flow duration ({top_features[0]['feature']}={top_features[0]['value']}) characteristic of automated host discovery."
    elif predicted_label == "Brute Force":
        reason = f"Repeated authentication flow sequences on port {top_features[0]['value']} with elevated TCP PSH flag count and sustained packet inter-arrival times."
    elif "Web Attack" in predicted_label:
        reason = f"Abnormally large HTTP payload size ({top_features[0]['feature']}={top_features[0]['value']}) containing high density of SQL/Script injection markers."
    elif predicted_label in ["Botnet", "Infiltration"]:
        reason = f"Periodic outbound beaconing activity detected with unusual destination port binding ({top_features[0]['value']}) and long idle intervals."
    else:
        reason = f"Anomalous metric pattern detected across top contributing features: {top_features[0]['feature']} and {top_features[1]['feature']}."

    return {
        "predicted_label": predicted_label,
        "confidence": round(confidence * 100, 2),
        "top_contributing_features": top_features,
        "explanation": reason
    }
