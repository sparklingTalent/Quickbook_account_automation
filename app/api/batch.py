"""Batch API endpoint for loading multiple resources at once."""
from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from typing import Optional
from datetime import datetime
from app.quickbooks.client import QuickBooksClient
from app.quickbooks.mock_client import MockQuickBooksClient
from app.payroll.service import PayrollService
from app.api.routes import get_qb_client
from app.api.auto_sync import auto_sync_on_data_access

router = APIRouter(prefix="/api/v1", tags=["batch"])


@router.get("/batch/dashboard")
async def get_dashboard_data(
    months: int = Query(12, ge=1, le=24),
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    qb_client = Depends(get_qb_client)
):
    """
    Batch endpoint to get all dashboard data in one request.
    This reduces the number of HTTP requests and improves performance.
    """
    try:
        payroll_service = PayrollService(qb_client)
        
        # Get all data in parallel
        from app.reports.exporter import ReportExporter
        from app.reports.variance import format_variance_report
        
        # Generate variance report
        df = payroll_service.generate_variance_report(year, month)
        df_formatted = format_variance_report(df)
        
        # Get department breakdown
        dept_df = df_formatted[df_formatted["Employee ID"] == ""].copy()
        dept_df = dept_df[dept_df["Employee Name"].str.startswith("DEPARTMENT TOTAL")]
        
        # Get historical trends
        trends_df = payroll_service.get_historical_variance_trends(months, year, month)
        
        # Get employees
        employees = qb_client.get_employees()
        
        # Auto-sync if current month
        now = datetime.now()
        if year == now.year and month == now.month:
            auto_sync_on_data_access()
        
        return JSONResponse(content={
            "trends": trends_df.to_dict(orient="records"),
            "department": dept_df.to_dict(orient="records"),
            "employees": [emp.dict() for emp in employees],
            "report": df_formatted.to_dict(orient="records"),
        })
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

