from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database.models import AuditLog
from typing import Optional, Dict, Any

async def log_audit_event(
    db: AsyncSession,
    user_email: str,
    action: str,
    resource: str,
    result: str = "SUCCESS",
    ip_address: Optional[str] = "127.0.0.1",
    details: Optional[Dict[str, Any]] = None
):
    """
    Logs every security-relevant action into the audit database table.
    """
    audit = AuditLog(
        user_email=user_email,
        action=action,
        resource=resource,
        result=result,
        ip_address=ip_address,
        details=details
    )
    db.add(audit)
    await db.commit()
