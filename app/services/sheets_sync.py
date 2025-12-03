"""Service to keep Google Sheets synchronized with latest data."""
from datetime import datetime
from typing import Optional
from app.quickbooks.mock_client import MockQuickBooksClient
from app.payroll.service import PayrollService
from app.reports.exporter import ReportExporter
from app.reports.variance import format_variance_report
from config import settings
import logging

logger = logging.getLogger(__name__)


class SheetsSyncService:
    """Service to sync data to Google Sheets automatically."""
    
    def __init__(self):
        """Initialize sync service."""
        self.exporter = ReportExporter()
        self.client = MockQuickBooksClient()
        self.payroll_service = PayrollService(self.client)
    
    def sync_current_month(self, spreadsheet_id: Optional[str] = None):
        """
        Sync current month's data to Google Sheets.
        
        Args:
            spreadsheet_id: Optional spreadsheet ID (uses config if not provided)
        """
        if not self.exporter.sheets_service:
            logger.warning("Google Sheets not initialized. Cannot sync.")
            return False
        
        try:
            now = datetime.now()
            year = now.year
            month = now.month
            
            # Generate current month report
            df = self.payroll_service.generate_variance_report(year, month)
            df_formatted = format_variance_report(df)
            
            # Export to Google Sheets
            sheet_name = f"CurrentMonth_{year}_{month:02d}"
            result = self.exporter.export_to_google_sheets(
                df_formatted,
                spreadsheet_id=spreadsheet_id,
                sheet_name=sheet_name
            )
            
            logger.info(f"Synced current month ({year}-{month:02d}) to Google Sheets")
            return True
        except Exception as e:
            logger.error(f"Error syncing current month: {e}")
            return False
    
    def sync_latest_report(self, spreadsheet_id: Optional[str] = None, sheet_name: str = "LatestReport"):
        """
        Sync latest variance report to a dedicated 'Latest' sheet.
        This sheet always contains the most recent data.
        
        Args:
            spreadsheet_id: Optional spreadsheet ID
            sheet_name: Name of the sheet to update (default: "LatestReport")
        """
        if not self.exporter.sheets_service:
            logger.warning("Google Sheets not initialized. Cannot sync.")
            return False
        
        try:
            now = datetime.now()
            year = now.year
            month = now.month
            
            # Generate latest report
            df = self.payroll_service.generate_variance_report(year, month)
            df_formatted = format_variance_report(df)
            
            # Add metadata row at the top
            metadata_row = {
                'Report Date': f"{year}-{month:02d}",
                'Generated At': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'Total Employees': len(df[df['Employee ID'] != '']),
                'Total Budget': df[df['Employee ID'] != '']['Budget'].sum(),
                'Total Actual': df[df['Employee ID'] != '']['Actual'].sum(),
            }
            
            # Export to Google Sheets
            result = self.exporter.export_to_google_sheets(
                df_formatted,
                spreadsheet_id=spreadsheet_id,
                sheet_name=sheet_name
            )
            
            logger.info(f"Synced latest report to Google Sheets (sheet: {sheet_name})")
            return True
        except Exception as e:
            logger.error(f"Error syncing latest report: {e}")
            return False
    
    def sync_historical_trends(self, months: int = 12, spreadsheet_id: Optional[str] = None):
        """
        Sync historical trends to Google Sheets.
        
        Args:
            months: Number of months to sync
            spreadsheet_id: Optional spreadsheet ID
        """
        if not self.exporter.sheets_service:
            logger.warning("Google Sheets not initialized. Cannot sync.")
            return False
        
        try:
            # Get historical trends
            trends_df = self.payroll_service.get_historical_variance_trends(months)
            
            # Export to Google Sheets
            sheet_name = f"HistoricalTrends_{months}Months"
            result = self.exporter.export_to_google_sheets(
                trends_df,
                spreadsheet_id=spreadsheet_id,
                sheet_name=sheet_name
            )
            
            logger.info(f"Synced {months} months of historical trends to Google Sheets")
            return True
        except Exception as e:
            logger.error(f"Error syncing historical trends: {e}")
            return False
    
    def sync_all(self, spreadsheet_id: Optional[str] = None):
        """
        Sync all data to Google Sheets:
        - Latest report
        - Current month
        - Historical trends (12 months)
        
        Args:
            spreadsheet_id: Optional spreadsheet ID
        """
        results = {
            'latest': False,
            'current_month': False,
            'historical': False
        }
        
        results['latest'] = self.sync_latest_report(spreadsheet_id)
        results['current_month'] = self.sync_current_month(spreadsheet_id)
        results['historical'] = self.sync_historical_trends(12, spreadsheet_id)
        
        return results

