#!/usr/bin/env python3
# Run with: ./test_google_sheets.py or venv/bin/python3 test_google_sheets.py
# Make sure to activate venv first: source venv/bin/activate
"""Test Google Sheets integration."""

import os
from pathlib import Path
from app.quickbooks.mock_client import MockQuickBooksClient
from app.payroll.service import PayrollService
from app.reports.exporter import ReportExporter
from app.reports.variance import format_variance_report
from config import settings

def main():
    print("=" * 60)
    print("Google Sheets Integration Test")
    print("=" * 60)
    print()
    
    # Check configuration
    print("1. Checking Configuration...")
    print(f"   Credentials Path: {settings.google_sheets_credentials_path}")
    print(f"   Spreadsheet ID: {settings.google_sheets_spreadsheet_id}")
    print()
    
    # Check if credentials file exists
    if settings.google_sheets_credentials_path:
        creds_path = Path(settings.google_sheets_credentials_path)
        if creds_path.exists():
            print(f"   ✓ Credentials file found: {creds_path.absolute()}")
        else:
            print(f"   ✗ Credentials file NOT found: {creds_path.absolute()}")
            print(f"   Please ensure credentials.json is in the project root")
            return
    else:
        print("   ✗ GOOGLE_SHEETS_CREDENTIALS_PATH not set in .env")
        return
    
    if not settings.google_sheets_spreadsheet_id:
        print("   ✗ GOOGLE_SHEETS_SPREADSHEET_ID not set in .env")
        return
    
    print()
    
    # Initialize exporter
    print("2. Initializing Google Sheets Exporter...")
    try:
        exporter = ReportExporter()
        if exporter.sheets_service:
            print("   ✓ Google Sheets service initialized successfully")
        else:
            print("   ✗ Failed to initialize Google Sheets service")
            print("   Check your credentials file and ensure it's a valid service account JSON")
            return
    except Exception as e:
        print(f"   ✗ Error initializing exporter: {e}")
        return
    
    print()
    
    # Generate test data
    print("3. Generating Test Data...")
    client = MockQuickBooksClient()
    service = PayrollService(client)
    df = service.generate_variance_report(2024, 1)
    df_formatted = format_variance_report(df)
    print(f"   ✓ Generated variance report with {len(df_formatted)} rows")
    print()
    
    # Test export to Google Sheets
    print("4. Testing Google Sheets Export...")
    try:
        result = exporter.export_to_google_sheets(
            df_formatted,
            spreadsheet_id=settings.google_sheets_spreadsheet_id,
            sheet_name="VarianceReport_Test"
        )
        updated_cells = result.get("updatedCells", 0)
        print(f"   ✓ Successfully exported to Google Sheets!")
        print(f"   ✓ Updated {updated_cells} cells")
        print()
        print(f"   View your spreadsheet at:")
        print(f"   https://docs.google.com/spreadsheets/d/{settings.google_sheets_spreadsheet_id}")
        print()
    except Exception as e:
        print(f"   ✗ Error exporting to Google Sheets: {e}")
        print()
        print("   Troubleshooting:")
        print("   1. Ensure the service account email has access to the spreadsheet")
        print("   2. Share the spreadsheet with the service account email from credentials.json")
        print("   3. Check that the spreadsheet ID is correct")
        print("   4. Verify the credentials file is valid JSON")
        return
    
    print("=" * 60)
    print("Google Sheets Integration Test: PASSED ✓")
    print("=" * 60)
    print()
    print("Next steps:")
    print("  1. Check your Google Sheet to see the exported data")
    print("  2. Use the API endpoint with format='sheets' to export reports")
    print("  3. Example: POST /api/v1/reports/variance with format='sheets'")

if __name__ == "__main__":
    main()

