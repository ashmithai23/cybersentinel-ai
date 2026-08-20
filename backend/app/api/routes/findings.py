from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List, Optional, Dict, Any

from backend.app.database.session import get_db
from backend.app.database.models import Finding
from backend.app.schemas.schemas import FindingOut, FindingCreate, FindingStatusUpdate, FindingNoteCreate
from backend.app.core.security import get_current_user_payload, TokenPayload
from backend.app.services.audit_service import log_audit_event

router = APIRouter(prefix="/findings", tags=["Vulnerability Findings"])

@router.get("", response_model=List[FindingOut])
async def list_findings(
    category: Optional[str] = None,
    severity: Optional[str] = None,
    finding_status: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    payload: TokenPayload = Depends(get_current_user_payload)
):
    query = select(Finding).order_by(Finding.id.desc())
    if category:
        query = query.where(Finding.category == category)
    if severity:
        query = query.where(Finding.severity == severity)
    if finding_status:
        query = query.where(Finding.status == finding_status)
        
    res = await db.execute(query)
    findings = list(res.scalars().all())
    
    if search:
        s = search.lower()
        findings = [
            f for f in findings if s in f.title.lower() or s in f.finding_code.lower() or s in f.affected_asset.lower() or s in f.category.lower()
        ]
        
    return findings

@router.get("/{finding_id}", response_model=FindingOut)
async def get_finding_by_id(
    finding_id: int,
    db: AsyncSession = Depends(get_db),
    payload: TokenPayload = Depends(get_current_user_payload)
):
    res = await db.execute(select(Finding).where(Finding.id == finding_id))
    finding = res.scalar_one_or_none()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found.")
    return finding

@router.patch("/{finding_id}/status", response_model=FindingOut)
async def update_finding_status(
    finding_id: int,
    status_update: FindingStatusUpdate,
    db: AsyncSession = Depends(get_db),
    payload: TokenPayload = Depends(get_current_user_payload)
):
    """
    Updates status transition (New -> Under Review -> Confirmed / False Positive -> Resolved).
    """
    valid_statuses = ["New", "Under Review", "Confirmed", "False Positive", "Resolved"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status '{status_update.status}'. Allowed: {valid_statuses}")
        
    res = await db.execute(select(Finding).where(Finding.id == finding_id))
    finding = res.scalar_one_or_none()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found.")
        
    old_status = finding.status
    finding.status = status_update.status
    if status_update.assigned_analyst:
        finding.assigned_analyst = status_update.assigned_analyst
        
    notes = finding.notes or []
    notes.append({
        "author": payload.email,
        "text": f"Status updated from '{old_status}' to '{finding.status}'."
    })
    finding.notes = notes
    
    await db.commit()
    await db.refresh(finding)
    
    await log_audit_event(
        db, payload.email, "UPDATE_FINDING_STATUS", f"FINDING_{finding.finding_code}",
        details={"old_status": old_status, "new_status": finding.status}
    )
    return finding

@router.post("/{finding_id}/notes", response_model=FindingOut)
async def add_finding_note(
    finding_id: int,
    note_in: FindingNoteCreate,
    db: AsyncSession = Depends(get_db),
    payload: TokenPayload = Depends(get_current_user_payload)
):
    res = await db.execute(select(Finding).where(Finding.id == finding_id))
    finding = res.scalar_one_or_none()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found.")
        
    notes = finding.notes or []
    notes.append({
        "author": payload.email,
        "text": note_in.text
    })
    finding.notes = notes
    await db.commit()
    await db.refresh(finding)
    
    await log_audit_event(db, payload.email, "ADD_FINDING_NOTE", f"FINDING_{finding.finding_code}")
    return finding
