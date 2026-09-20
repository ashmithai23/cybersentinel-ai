import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_all_routes():
    print("Beginning Comprehensive End-to-End System Audit...")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Login
        res = await client.post("/api/v1/auth/login", json={"email": "admin@cybersentinel.ai", "password": "CyberSentinel2026!"})
        print(f"1. Auth Login: Status {res.status_code}")
        assert res.status_code == 200, f"Login failed: {res.text}"
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Dashboard
        res = await client.get("/api/v1/dashboard/overview", headers=headers)
        print(f"2. Dashboard Overview: Status {res.status_code}")
        assert res.status_code == 200, f"Dashboard failed: {res.text}"

        # 3. Security Events
        res = await client.get("/api/v1/events", headers=headers)
        print(f"3. Security Events: Status {res.status_code}")
        assert res.status_code == 200, f"Events failed: {res.text}"

        # 4. Findings
        res = await client.get("/api/v1/findings", headers=headers)
        print(f"4. Vulnerability Findings: Status {res.status_code}")
        assert res.status_code == 200, f"Findings failed: {res.text}"

        # 5. Network Analysis
        res = await client.get("/api/v1/network/overview", headers=headers)
        print(f"5. Network Overview: Status {res.status_code}")
        assert res.status_code == 200, f"Network failed: {res.text}"

        # 6. API Security
        res = await client.get("/api/v1/api-security/overview", headers=headers)
        print(f"6. API Security: Status {res.status_code}")
        assert res.status_code == 200, f"API Security failed: {res.text}"

        # 7. AI Models
        res = await client.get("/api/v1/models/comparison", headers=headers)
        print(f"7. AI Models Comparison: Status {res.status_code}")
        assert res.status_code == 200, f"Models comparison failed: {res.text}"

        # 8. Reports
        res = await client.get("/api/v1/reports", headers=headers)
        print(f"8. Reports List: Status {res.status_code}")
        assert res.status_code == 200, f"Reports failed: {res.text}"

        # 9. Batch Threat Detection
        sample_batch = {
            "model_name": "ANN / MLP",
            "asset_endpoint": "/api/v1/network",
            "events": [
                {
                    "destination_port": 80,
                    "flow_duration": 120.0,
                    "total_fwd_packets": 4500,
                    "flow_bytes_s": 15000000.0,
                    "protocol": "TCP",
                    "action": "ALLOWED"
                }
            ]
        }
        res = await client.post("/api/v1/detection/analyze-batch", json=sample_batch, headers=headers)
        print(f"9. Batch Threat Detection: Status {res.status_code}")
        assert res.status_code == 200, f"Batch Detection failed: {res.text}"

    print("\nSUCCESS: All 9 Core API Endpoints & ML Inference Engine Passed with 0 Errors!")

if __name__ == "__main__":
    asyncio.run(test_all_routes())
