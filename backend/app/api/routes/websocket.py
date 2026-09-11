import asyncio
import json
import random
import time
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List

router = APIRouter(tags=["Real-time Streaming"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

SAMPLE_IP_POOL = [
    "192.168.1.105", "10.0.4.12", "198.51.100.45", "203.0.113.88",
    "172.16.0.4", "192.168.1.1", "10.0.0.1", "185.220.101.5"
]

SAMPLE_CATEGORIES = [
    ("Benign", "Low", "#10B981", 15),
    ("Web Attack - SQL Injection", "Critical", "#EF4444", 98),
    ("DDoS", "Critical", "#EF4444", 95),
    ("PortScan", "High", "#F97316", 82),
    ("Bot", "High", "#F97316", 78),
    ("Brute Force", "Medium", "#F59E0B", 64)
]

@router.websocket("/ws/live-events")
async def websocket_live_events(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            cat, severity, color, base_risk = random.choice(SAMPLE_CATEGORIES)
            src_ip = random.choice(SAMPLE_IP_POOL)
            dest_port = random.choice([80, 443, 22, 3306, 8080, 53])
            pkt_count = random.randint(10, 45000)
            
            event_payload = {
                "timestamp": time.strftime("%H:%M:%S"),
                "source_ip": src_ip,
                "dest_port": dest_port,
                "protocol": "TCP",
                "prediction": cat,
                "severity": severity,
                "severity_color": color,
                "confidence": round(random.uniform(92.0, 99.8), 1),
                "risk_score": min(100, base_risk + random.randint(0, 5)),
                "packet_rate_pps": pkt_count,
                "status": "ANALYZED"
            }
            await websocket.send_json(event_payload)
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
