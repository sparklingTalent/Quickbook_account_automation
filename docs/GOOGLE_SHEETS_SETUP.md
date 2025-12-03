# Google Sheets Setup Guide

## Current Status

✅ **Credentials configured:**
- Service account file: `credentials.json`
- Spreadsheet ID: `1mPLCZX8NuhvtP6O4wdp8OgfTP6GJFVr16oT8ik12dBk`
- Service account email: `shippingpricecalculator@pricing-calculator-478920.iam.gserviceaccount.com`

## Required Step: Share Spreadsheet with Service Account

The service account needs **edit access** to your Google Sheet. Follow these steps:

### Step 1: Open Your Google Sheet

Open your spreadsheet:
```
https://docs.google.com/spreadsheets/d/1mPLCZX8NuhvtP6O4wdp8OgfTP6GJFVr16oT8ik12dBk
```

### Step 2: Share with Service Account

1. Click the **"Share"** button (top right)
2. In the "Add people and groups" field, enter:
   ```
   shippingpricecalculator@pricing-calculator-478920.iam.gserviceaccount.com
   ```
3. Set permission to **"Editor"** (not just Viewer)
4. **Uncheck** "Notify people" (service accounts don't need notifications)
5. Click **"Share"**

### Step 3: Verify Access

Run the test script to verify:

```bash
source venv/bin/activate
python test_google_sheets.py
```

You should see:
```
✓ Successfully exported to Google Sheets!
✓ Updated X cells
```

## Using Google Sheets Export

### Via API

```bash
curl -X POST "http://localhost:8000/api/v1/reports/variance" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2024,
    "month": 1,
    "format": "sheets"
  }'
```

### Via Swagger UI

1. Start server: `./run.sh`
2. Open: http://localhost:8000/docs
3. Use `POST /api/v1/reports/variance`
4. Set `format: "sheets"`

### Via Python Code

```python
from app.quickbooks.mock_client import MockQuickBooksClient
from app.payroll.service import PayrollService
from app.reports.exporter import ReportExporter
from app.reports.variance import format_variance_report

# Generate report
client = MockQuickBooksClient()
service = PayrollService(client)
df = service.generate_variance_report(2024, 1)
df_formatted = format_variance_report(df)

# Export to Google Sheets
exporter = ReportExporter()
result = exporter.export_to_google_sheets(df_formatted)
print(f"Exported {result.get('updatedCells')} cells")
```

## Troubleshooting

### Error: "The caller does not have permission"
- **Solution:** Share the spreadsheet with the service account email (see Step 2 above)
- Make sure permission is set to **"Editor"**, not "Viewer"

### Error: "Spreadsheet not found"
- **Solution:** Verify the spreadsheet ID in `.env` is correct
- Check that the spreadsheet exists and is accessible

### Error: "Invalid credentials"
- **Solution:** Verify `credentials.json` is valid
- Ensure the service account has Google Sheets API enabled in Google Cloud Console

### Service account email not found
- Run: `python -c "from config import settings; import json; print(json.load(open(settings.google_sheets_credentials_path))['client_email'])"`
- This will show the service account email you need to share with

## Monthly Automation

Once set up, you can automate monthly exports:

```bash
# Run on 1st of each month
curl -X POST "http://localhost:8000/api/v1/reports/variance" \
  -H "Content-Type: application/json" \
  -d "{\"year\":$(date +%Y),\"month\":$(date +%m),\"format\":\"sheets\"}"
```

The report will automatically update in your Google Sheet!

