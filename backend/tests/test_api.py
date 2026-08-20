import pytest
import asyncio
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.session import init_db

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    asyncio.run(init_db())

def test_root_endpoint():
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["app"] == "CYBERSENTINEL AI"
        assert data["status"] == "Operational"

def test_login_demo_admin():
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "admin@cybersentinel.ai", "password": "CyberSentinel2026!"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "admin@cybersentinel.ai"
        assert data["user"]["role"] == "Admin"

def test_dashboard_overview():
    with TestClient(app) as client:
        login_res = client.post(
            "/api/v1/auth/login",
            json={"email": "admin@cybersentinel.ai", "password": "CyberSentinel2026!"}
        )
        token = login_res.json()["access_token"]
        
        response = client.get("/api/v1/dashboard/overview", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert data["total_events"] > 0
        assert "threats_over_time" in data
        assert "severity_distribution" in data

def test_model_comparison():
    with TestClient(app) as client:
        login_res = client.post(
            "/api/v1/auth/login",
            json={"email": "admin@cybersentinel.ai", "password": "CyberSentinel2026!"}
        )
        token = login_res.json()["access_token"]
        
        response = client.get("/api/v1/models/comparison", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert "comparison_table" in data
        assert len(data["comparison_table"]) >= 4

def test_findings_list():
    with TestClient(app) as client:
        login_res = client.post(
            "/api/v1/auth/login",
            json={"email": "admin@cybersentinel.ai", "password": "CyberSentinel2026!"}
        )
        token = login_res.json()["access_token"]
        
        response = client.get("/api/v1/findings", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 4
        assert "finding_code" in data[0]

def test_batch_threat_detection():
    with TestClient(app) as client:
        login_res = client.post(
            "/api/v1/auth/login",
            json={"email": "admin@cybersentinel.ai", "password": "CyberSentinel2026!"}
        )
        token = login_res.json()["access_token"]
        
        sample_event = {
            "destination_port": 80,
            "flow_duration": 100,
            "total_fwd_packets": 2000,
            "total_backward_packets": 2,
            "total_length_of_fwd_packets": 100000,
            "total_length_of_bwd_packets": 80,
            "fwd_packet_length_max": 100,
            "fwd_packet_length_min": 40,
            "fwd_packet_length_mean": 50,
            "bwd_packet_length_mean": 40,
            "flow_bytes_s": 1000000,
            "flow_packets_s": 20000,
            "flow_iat_mean": 0.1,
            "fwd_iat_mean": 0.1,
            "bwd_iat_mean": 0.0,
            "fwd_header_length": 40000,
            "bwd_header_length": 40,
            "fwd_packets_s": 20000,
            "bwd_packets_s": 0,
            "min_packet_length": 40,
            "max_packet_length": 100,
            "packet_length_mean": 50,
            "packet_length_std": 10,
            "syn_flag_count": 1,
            "rst_flag_count": 1,
            "psh_flag_count": 0,
            "ack_flag_count": 0,
            "urg_flag_count": 0,
            "down_up_ratio": 0.0,
            "average_packet_size": 50,
            "active_mean": 0,
            "idle_mean": 0
        }
        
        response = client.post(
            "/api/v1/detection/analyze-batch",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "model_name": "ANN / MLP",
                "asset_endpoint": "/api/v1/gateway",
                "events": [sample_event]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_analyzed"] == 1
        assert data["results"][0]["prediction"] != ""
        assert "explanation" in data["results"][0]

def test_interview_info_metadata():
    with TestClient(app) as client:
        response = client.get("/api/v1/info")
        assert response.status_code == 200
        data = response.json()
        assert data["app_name"] == "CYBERSENTINEL AI"
        assert "why_ann" in data["architecture"]["ml_justifications"]
