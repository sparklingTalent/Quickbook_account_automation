# Testing Guide

This guide shows you how to test and check the results of the QuickBooks Accounting Automation application.

## Quick Start

### Option 1: Run Simple Test Script (Recommended First)

This tests the core functionality without starting a server:

```bash
# Activate virtual environment
source venv/bin/activate

# Run the test script
python test_simple.py
```

This will:
- ✅ Load mock employees
- ✅ Generate payroll data
- ✅ Create a variance report
- ✅ Export to CSV and Excel
- ✅ Display results in the terminal

### Option 2: Start API Server and Test Endpoints

**Step 1: Start the server**

```bash
./run.sh
```

Or manually:
```bash
source venv/bin/activate
python main.py
```

The server will start at `http://localhost:8000`

**Step 2: Test via Browser (Easiest)**

1. Open your browser and go to: **http://localhost:8000/docs**
   - This is the Swagger UI - an interactive API documentation
   - You can test all endpoints directly from the browser!

2. Try these endpoints:
   - `GET /api/v1/health` - Click "Try it out" → "Execute"
   - `GET /api/v1/employees` - See all mock employees
   - `POST /api/v1/reports/variance` - Generate a variance report

**Step 3: Test via Command Line**

In a **new terminal** (keep server running), run:

```bash
./test_api.sh
```

This will test all endpoints and show JSON results.

**Step 4: Test Individual Endpoints**

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Get employees
curl http://localhost:8000/api/v1/employees

# Generate variance report (JSON)
curl -X POST "http://localhost:8000/api/v1/reports/variance" \
  -H "Content-Type: application/json" \
  -d '{"year": 2024, "month": 1, "format": "json"}'

# Generate variance report (Excel - downloads file)
curl -X POST "http://localhost:8000/api/v1/reports/variance" \
  -H "Content-Type: application/json" \
  -d '{"year": 2024, "month": 1, "format": "excel"}' \
  --output variance_report.xlsx

# Get variance trends
curl "http://localhost:8000/api/v1/reports/variance/trends?months=6"

# Get variance by department
curl "http://localhost:8000/api/v1/reports/variance/by-department?year=2024&month=1"
```

## Expected Results

### Employees Endpoint
Should return 6 mock employees:
- John Smith (Engineering)
- Sarah Johnson (Engineering)
- Michael Chen (Architecture)
- Emily Rodriguez (Architecture)
- David Kim (Engineering)
- Lisa Anderson (Architecture)

### Variance Report
Should show:
- Budget vs Actual for each employee
- Variance amount and percentage
- Department totals
- Status (Over Budget, Under Budget, On Budget)

### Sample Output

```json
{
  "Employee ID": "emp_001",
  "Employee Name": "John Smith",
  "Department": "Engineering",
  "Budget": 12000.0,
  "Actual": 10622.28,
  "Variance": -1377.72,
  "Variance %": -11.48,
  "Status": "Under Budget"
}
```

## Viewing Generated Files

After running tests, you'll find:
- `test_variance_report.csv` - CSV format report
- `test_variance_report.xlsx` - Excel format report
- `variance_report_2024_01.xlsx` - If downloaded via API

Open these files in Excel, Google Sheets, or any spreadsheet application.

## Troubleshooting

### Server won't start
- Make sure virtual environment is activated: `source venv/bin/activate`
- Check if port 8000 is already in use
- Look for error messages in the terminal

### No data in reports
- Make sure you're using mock data (default)
- Check that `data/budgets.json` exists
- Verify the month/year you're querying has budget data

### API returns errors
- Ensure server is running
- Check the server terminal for error messages
- Verify you're using the correct endpoint URLs

## Next Steps

Once you've verified everything works:
1. Customize mock data in `app/quickbooks/mock_client.py`
2. Update budgets in `data/budgets.json`
3. Set up real QuickBooks credentials when ready
4. Configure Google Sheets export if needed

