from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from backend.app.database.session import get_db
from backend.app.database.models import AuditLog
from backend.app.schemas.schemas import AuditLogOut
from backend.app.core.security import get_current_user_payload, TokenPayload, RoleChecker

router = APIRouter(prefix="/audit", tags=["Audit Logging"])

@router.get("", response_model=List[AuditLogOut])
async def list_audit_logs(
    action: Optional[str] = None,
    user_email: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    payload: TokenPayload = Depends(RoleChecker(allowed_roles=["Admin", "Security Analyst"]))
):
    query = select(AuditLog).order_by(AuditLog.id.desc()).limit(limit)
    if action:
        query = query.where(AuditLog.action == action)
    if user_email:
        query = query.where(AuditLog.user_email == user_email)
        
    res = await db.execute(query)
    return list(res.scalars().all())
