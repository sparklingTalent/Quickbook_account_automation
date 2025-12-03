#!/usr/bin/env python3
"""Simple test script to verify the application works with mock data."""
# Run with: ./venv/bin/python3 test_simple.py
# Or: source venv/bin/activate && python test_simple.py

from app.quickbooks.mock_client import MockQuickBooksClient
from app.payroll.service import PayrollService
from app.reports.exporter import ReportExporter
from app.reports.variance import format_variance_report
import pandas as pd

def main():
    print("=" * 60)
    print("QuickBooks Accounting Automation - Test Script")
    print("=" * 60)
    print()
    
    # Initialize mock client
    print("1. Initializing Mock QuickBooks Client...")
    client = MockQuickBooksClient()
    employees = client.get_employees()
    print(f"   ✓ Loaded {len(employees)} employees")
    for emp in employees:
        print(f"      - {emp.display_name} ({emp.department})")
    print()
    
    # Test payroll service
    print("2. Testing Payroll Service...")
    service = PayrollService(client)
    payroll_data = service.get_monthly_payroll(2024, 1)
    print(f"   ✓ Generated payroll data for {len(payroll_data)} employees")
    print()
    
    # Generate variance report
    print("3. Generating Variance Report for January 2024...")
    df = service.generate_variance_report(2024, 1)
    df_formatted = format_variance_report(df)
    print(f"   ✓ Generated report with {len(df_formatted)} rows")
    print()
    
    # Display report
    print("4. Variance Report Results:")
    print("-" * 60)
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', None)
    pd.set_option('display.max_colwidth', 20)
    print(df_formatted.to_string(index=False))
    print("-" * 60)
    print()
    
    # Summary statistics
    print("5. Summary Statistics:")
    employee_rows = df_formatted[df_formatted["Employee ID"] != ""]
    total_budget = employee_rows["Budget"].sum()
    total_actual = employee_rows["Actual"].sum()
    total_variance = employee_rows["Variance"].sum()
    
    print(f"   Total Budget:    ${total_budget:,.2f}")
    print(f"   Total Actual:     ${total_actual:,.2f}")
    print(f"   Total Variance:   ${total_variance:,.2f}")
    print(f"   Variance %:       {(total_variance/total_budget*100):.2f}%")
    print()
    
    # Test export to CSV
    print("6. Testing CSV Export...")
    exporter = ReportExporter()
    csv_path = exporter.export_to_csv(df_formatted, "test_variance_report.csv")
    print(f"   ✓ Exported to: {csv_path}")
    print()
    
    # Test export to Excel
    print("7. Testing Excel Export...")
    excel_path = exporter.export_to_excel(df_formatted, "test_variance_report.xlsx")
    print(f"   ✓ Exported to: {excel_path}")
    print()
    
    print("=" * 60)
    print("All tests passed! ✓")
    print("=" * 60)
    print()
    print("Next steps:")
    print("  1. Start the API server: ./run.sh")
    print("  2. Visit http://localhost:8000/docs for interactive API docs")
    print("  3. Run API tests: ./test_api.sh (in another terminal)")
    print()

if __name__ == "__main__":
    main()

