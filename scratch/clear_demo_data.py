import asyncio
from sqlalchemy import delete
from backend.app.database.session import AsyncSessionLocal
from backend.app.database.models import Finding, SecurityEvent, Prediction

async def clear_all_demo_records():
    print("Clearing all demo findings, security events, and predictions...")
    async with AsyncSessionLocal() as session:
        await session.execute(delete(Finding))
        await session.execute(delete(SecurityEvent))
        await session.execute(delete(Prediction))
        await session.commit()
    print("SUCCESS: Database reset! Zero demo records remain.")

if __name__ == "__main__":
    asyncio.run(clear_all_demo_records())
