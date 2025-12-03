"""FastAPI routes for the application."""
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import FileResponse, JSONResponse
from typing import Optional
from datetime import datetime
import logging
from pydantic import BaseModel
import tempfile
from pathlib import Path

from app.quickbooks.client import QuickBooksClient
from app.quickbooks.mock_client import MockQuickBooksClient
from app.payroll.service import PayrollService
from app.reports.exporter import ReportExporter
from app.reports.variance import format_variance_report
from app.services.sheets_sync import SheetsSyncService
from app.api.auto_sync import auto_sync_latest_report, auto_sync_on_data_access
from config import settings


router = APIRouter(prefix="/api/v1", tags=["reports"])


# Dependency to get QuickBooks client (uses mock if credentials not available)
def get_qb_client():
    """
    Get QuickBooks client - uses mock data if credentials not configured.
    
    In production with real QuickBooks account, this would:
    1. Get tokens from session/database
    2. Use real QuickBooksClient
    """
    # Use mock data if configured or if credentials are missing
    if settings.use_mock_data or not settings.qb_client_id or not settings.qb_client_secret:
        return MockQuickBooksClient()
    
    # In production, get tokens from OAuth flow/session
    access_token = "your_access_token"  # Get from OAuth flow
    company_id = "your_company_id"  # Get from OAuth flow
    return QuickBooksClient(access_token, company_id)


class VarianceReportRequest(BaseModel):
    """Request model for variance report."""
    year: int
    month: int
    format: str = "json"
    months: Optional[int] = 12  # Number of months for historical trends


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "QuickBooks Accounting Automation"}


@router.get("/employees")
async def get_employees(qb_client = Depends(get_qb_client)):
    """Get list of employees from QuickBooks."""
    try:
        employees = qb_client.get_employees()
        return {"employees": [emp.dict() for emp in employees]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reports/variance")
async def generate_variance_report(
    request: VarianceReportRequest,
    qb_client = Depends(get_qb_client)
):
    """
    Generate salary variance report.
    
    Args:
        request: Report request with year, month, and format
        qb_client: QuickBooks client dependency
    """
    try:
        payroll_service = PayrollService(qb_client)
        df = payroll_service.generate_variance_report(request.year, request.month)
        df_formatted = format_variance_report(df)
        
        exporter = ReportExporter()
        
        if request.format == "json":
            # Auto-sync latest report if this is current month
            auto_sync_latest_report(request.year, request.month)
            return JSONResponse(content=df_formatted.to_dict(orient="records"))
        
        elif request.format == "excel":
            with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
                # Get additional data for charts
                dept_df = payroll_service.generate_variance_report(request.year, request.month)
                dept_df_formatted = format_variance_report(dept_df)
                
                # Get department breakdown
                dept_breakdown = dept_df_formatted[dept_df_formatted["Employee ID"] == ""].copy()
                dept_breakdown = dept_breakdown[dept_breakdown["Employee Name"].str.startswith("DEPARTMENT TOTAL")]
                
                # Get historical trends
                trends_df = payroll_service.get_historical_variance_trends(
                    request.months or 12, 
                    request.year, 
                    request.month
                )
                
                filepath = exporter.export_to_excel(
                    df_formatted, 
                    tmp.name,
                    department_data=dept_breakdown,
                    trends_data=trends_df,
                    include_charts=True
                )
                return FileResponse(
                    filepath,
                    filename=f"variance_report_{request.year}_{request.month:02d}.xlsx",
                    media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                )
        
        elif request.format == "csv":
            with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
                filepath = exporter.export_to_csv(df_formatted, tmp.name)
                return FileResponse(
                    filepath,
                    filename=f"variance_report_{request.year}_{request.month:02d}.csv",
                    media_type="text/csv"
                )
        
        elif request.format == "sheets":
            if not exporter.sheets_service:
                raise HTTPException(
                    status_code=400,
                    detail="Google Sheets not configured. Please set up credentials."
                )
            
            # Export to specific month sheet
            month_sheet_name = f"VarianceReport_{request.year}_{request.month:02d}"
            result = exporter.export_to_google_sheets(
                df_formatted,
                sheet_name=month_sheet_name
            )
            
            # Auto-sync latest report if this is current month
            auto_sync_latest_report(request.year, request.month)
            
            return {
                "status": "success",
                "message": "Report exported to Google Sheets",
                "updated_cells": result.get("updatedCells", 0),
                "sheet_name": month_sheet_name
            }
        
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {request.format}")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reports/variance/trends")
async def get_variance_trends(
    months: int = Query(12, ge=1, le=24),
    end_year: Optional[int] = Query(None, description="End year for trends (defaults to current year)"),
    end_month: Optional[int] = Query(None, ge=1, le=12, description="End month for trends (defaults to current month)"),
    qb_client = Depends(get_qb_client)
):
    """
    Get historical variance trends.
    
    Args:
        months: Number of months to look back
        end_year: End year for trends (defaults to current year)
        end_month: End month for trends (defaults to current month)
    """
    try:
        payroll_service = PayrollService(qb_client)
        df = payroll_service.get_historical_variance_trends(months, end_year, end_month)
        
        # Auto-sync latest data when trends are accessed (only if using current date)
        if end_year is None or end_month is None:
            auto_sync_on_data_access()
        
        return JSONResponse(content=df.to_dict(orient="records"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reports/variance/by-department")
async def get_variance_by_department(
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    qb_client = Depends(get_qb_client)
):
    """Get variance report aggregated by department."""
    try:
        payroll_service = PayrollService(qb_client)
        df = payroll_service.generate_variance_report(year, month)
        
        # Filter to department totals only
        dept_df = df[df["Employee ID"] == ""].copy()
        dept_df = dept_df[dept_df["Employee Name"].str.startswith("DEPARTMENT TOTAL")]
        
        return JSONResponse(content=dept_df.to_dict(orient="records"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sync/sheets")
async def sync_to_sheets(
    sync_type: str = Query("latest", regex="^(latest|current|historical|all)$"),
    months: int = Query(12, ge=1, le=24),
    qb_client = Depends(get_qb_client)
):
    """
    Sync data to Google Sheets.
    
    Args:
        sync_type: Type of sync - 'latest', 'current', 'historical', or 'all'
        months: Number of months for historical sync (default: 12)
    """
    try:
        sync_service = SheetsSyncService()
        
        if sync_type == "latest":
            success = sync_service.sync_latest_report()
            return {
                "status": "success" if success else "failed",
                "message": "Latest report synced to Google Sheets" if success else "Failed to sync",
                "sheet_name": "LatestReport"
            }
        
        elif sync_type == "current":
            success = sync_service.sync_current_month()
            return {
                "status": "success" if success else "failed",
                "message": "Current month synced to Google Sheets" if success else "Failed to sync"
            }
        
        elif sync_type == "historical":
            success = sync_service.sync_historical_trends(months)
            return {
                "status": "success" if success else "failed",
                "message": f"{months} months of historical trends synced" if success else "Failed to sync",
                "sheet_name": f"HistoricalTrends_{months}Months"
            }
        
        elif sync_type == "all":
            results = sync_service.sync_all()
            return {
                "status": "success" if all(results.values()) else "partial",
                "message": "All data synced to Google Sheets",
                "results": results
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

