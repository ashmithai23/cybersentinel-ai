from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from backend.app.database.session import get_db
from backend.app.database.models import Report
from backend.app.schemas.schemas import ReportOut, ReportCreateRequest
from backend.app.core.security import get_current_user_payload, TokenPayload
from backend.app.services.report_service import ReportGeneratorService
from backend.app.services.audit_service import log_audit_event

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("", response_model=List[ReportOut])
async def list_reports(
    db: AsyncSession = Depends(get_db),
    payload: TokenPayload = Depends(get_current_user_payload)
):
    res = await db.execute(select(Report).order_by(Report.id.desc()))
    return list(res.scalars().all())

@router.post("/generate", response_model=ReportOut)
async def generate_report(
    req: ReportCreateRequest,
    db: AsyncSession = Depends(get_db),
    payload: TokenPayload = Depends(get_current_user_payload)
):
    report = await ReportGeneratorService.generate_security_report(
        db=db,
        user_email=payload.email,
        title=req.title or "CyberSentinel AI Security Threat Assessment Report",
        report_format=req.format or "PDF"
    )
    
    await log_audit_event(
        db, payload.email, "GENERATE_REPORT", f"REPORT_{report.report_uuid}",
        details={"format": report.format, "total_findings": report.total_findings}
    )
    return report

@router.get("/{report_id}/download")
async def download_report_file(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    payload: TokenPayload = Depends(get_current_user_payload)
):
    res = await db.execute(select(Report).where(Report.id == report_id))
    report = res.scalar_one_or_none()
    if not report or not report.file_path:
        raise HTTPException(status_code=404, detail="Report file not found.")
        
    media_type = "application/pdf" if report.format == "PDF" else "application/json" if report.format == "JSON" else "text/csv"
    return FileResponse(
        path=report.file_path,
        filename=f"{report.report_uuid}.{report.format.lower()}",
        media_type=media_type
    )
