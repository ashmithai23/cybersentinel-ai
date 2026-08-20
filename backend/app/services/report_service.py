import os
import uuid
import json
import csv
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

from backend.app.database.models import Finding, Report

REPORTS_DIR = "reports"
os.makedirs(REPORTS_DIR, exist_ok=True)

class ReportGeneratorService:
    @staticmethod
    async def generate_security_report(
        db: AsyncSession,
        user_email: str,
        title: str = "CyberSentinel AI Security Threat Assessment",
        report_format: str = "PDF"
    ) -> Report:
        # Fetch findings
        res = await db.execute(select(Finding))
        findings: List[Finding] = list(res.scalars().all())
        
        total_findings = len(findings)
        critical_count = sum(1 for f in findings if f.severity == "Critical")
        high_count = sum(1 for f in findings if f.severity == "High")
        medium_count = sum(1 for f in findings if f.severity == "Medium")
        low_count = sum(1 for f in findings if f.severity == "Low")
        
        report_uuid = f"REP-{uuid.uuid4().hex[:8].upper()}"
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        
        exec_summary = (
            f"CyberSentinel AI conducted an AI-assisted defensive security assessment on {now_str}. "
            f"A total of {total_findings} vulnerability findings were identified across analyzed endpoints. "
            f"This includes {critical_count} Critical, {high_count} High, {medium_count} Medium, and {low_count} Low severity items. "
            f"Immediate remediation action is recommended for all Critical and High findings to reduce platform risk exposure."
        )
        
        if report_format.upper() == "PDF":
            filename = f"{report_uuid}.pdf"
            file_path = os.path.join(REPORTS_DIR, filename)
            ReportGeneratorService._create_pdf(
                file_path=file_path,
                report_uuid=report_uuid,
                title=title,
                user_email=user_email,
                date_str=now_str,
                exec_summary=exec_summary,
                findings=findings,
                stats=(total_findings, critical_count, high_count, medium_count, low_count)
            )
        elif report_format.upper() == "JSON":
            filename = f"{report_uuid}.json"
            file_path = os.path.join(REPORTS_DIR, filename)
            data = {
                "report_uuid": report_uuid,
                "title": title,
                "generated_by": user_email,
                "generated_at": now_str,
                "executive_summary": exec_summary,
                "metrics": {
                    "total_findings": total_findings,
                    "critical": critical_count,
                    "high": high_count,
                    "medium": medium_count,
                    "low": low_count
                },
                "findings": [
                    {
                        "code": f.finding_code,
                        "title": f.title,
                        "category": f.category,
                        "severity": f.severity,
                        "confidence": f.confidence,
                        "asset": f.affected_asset,
                        "description": f.description,
                        "recommendation": f.recommendation,
                        "remediation": f.remediation,
                        "status": f.status
                    } for f in findings
                ]
            }
            with open(file_path, "w") as f:
                json.dump(data, f, indent=2)
        else: # CSV
            filename = f"{report_uuid}.csv"
            file_path = os.path.join(REPORTS_DIR, filename)
            with open(file_path, "w", newline="") as f:
                writer = csv.writer(f)
                writer.writerow(["Finding ID", "Title", "Category", "Severity", "Confidence (%)", "Affected Asset", "Status"])
                for finding in findings:
                    writer.writerow([
                        finding.finding_code,
                        finding.title,
                        finding.category,
                        finding.severity,
                        finding.confidence,
                        finding.affected_asset,
                        finding.status
                    ])

        report = Report(
            report_uuid=report_uuid,
            title=title,
            executive_summary=exec_summary,
            generated_by=user_email,
            file_path=file_path,
            format=report_format.upper(),
            total_findings=total_findings,
            critical_count=critical_count,
            high_count=high_count
        )
        db.add(report)
        await db.commit()
        await db.refresh(report)
        return report

    @staticmethod
    def _create_pdf(
        file_path: str,
        report_uuid: str,
        title: str,
        user_email: str,
        date_str: str,
        exec_summary: str,
        findings: List[Finding],
        stats: tuple
    ):
        doc = SimpleDocTemplate(file_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
        styles = getSampleStyleSheet()
        
        # Custom dark palette styles
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=6
        )
        h2_style = ParagraphStyle(
            'Heading2Dark',
            parent=styles['Heading2'],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=12,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'ReportBody',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#334155'),
            spaceAfter=6
        )
        
        story = []
        
        # Header Banner
        story.append(Paragraph(title, title_style))
        story.append(Paragraph(f"<b>Report ID:</b> {report_uuid} | <b>Generated By:</b> {user_email} | <b>Date:</b> {date_str}", body_style))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#06B6D4"), spaceBefore=8, spaceAfter=12))
        
        # 1. Executive Summary
        story.append(Paragraph("1. Executive Summary", h2_style))
        story.append(Paragraph(exec_summary, body_style))
        story.append(Spacer(1, 10))
        
        # 2. Assessment Methodology & AI Engine
        story.append(Paragraph("2. Assessment Overview & Methodology", h2_style))
        method_text = (
            "This automated security evaluation utilizes CyberSentinel AI's multi-layered Deep Learning architecture. "
            "Traffic flow vectors are analyzed across 32 numerical attributes using Artificial Neural Networks (ANN/MLP), "
            "1D Convolutional Neural Networks (1D CNN), and LSTM temporal sequence models trained on defensive CIC-IDS security benchmarks. "
            "Predictions are augmented with a transparent risk scoring engine and feature importance explainability."
        )
        story.append(Paragraph(method_text, body_style))
        story.append(Spacer(1, 10))
        
        # 3. Severity Distribution Table
        story.append(Paragraph("3. Severity Distribution Summary", h2_style))
        tot, crit, high, med, low = stats
        summary_table_data = [
            ["Total Findings", "Critical", "High", "Medium", "Low"],
            [str(tot), str(crit), str(high), str(med), str(low)]
        ]
        t_sum = Table(summary_table_data, colWidths=[100, 100, 100, 100, 100])
        t_sum.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
            ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#F8FAFC')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ]))
        story.append(t_sum)
        story.append(Spacer(1, 15))
        
        # 4. Detailed Technical Findings
        story.append(Paragraph("4. Detailed Technical Findings & Remediation", h2_style))
        
        for idx, f in enumerate(findings, 1):
            story.append(Paragraph(f"<b>{idx}. [{f.severity.upper()}] {f.title}</b> ({f.finding_code})", ParagraphStyle('FHead', parent=h2_style, fontSize=11, leading=14, textColor=colors.HexColor('#0F172A'))))
            story.append(Paragraph(f"<b>Category:</b> {f.category} | <b>Confidence:</b> {f.confidence}% | <b>Asset:</b> {f.affected_asset} | <b>Status:</b> {f.status}", body_style))
            story.append(Paragraph(f"<b>Description:</b> {f.description}", body_style))
            story.append(Paragraph(f"<b>Potential Impact:</b> {f.potential_impact}", body_style))
            story.append(Paragraph(f"<b>Recommended Remediation:</b> {f.remediation}", body_style))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#E2E8F0'), spaceBefore=6, spaceAfter=10))

        # 5. Ethical Limitations & Scope Boundary
        story.append(Paragraph("5. Ethical Boundaries & Scope Statement", h2_style))
        boundary_text = (
            "CyberSentinel AI operates strictly as an educational and defensive security threat analysis platform. "
            "It does not perform autonomous exploitation, credential theft, unauthorized network scanning, or payload execution. "
            "All intelligence generated herein is intended solely for security posture hardening and risk mitigation."
        )
        story.append(Paragraph(boundary_text, body_style))

        doc.build(story)
