# QuickBooks Accounting Automation

Automated salary variance reporting tool for Architecture and Engineering firms that integrates with QuickBooks Online.

## Features

- ✅ Connect to QuickBooks Online via API
- ✅ Pull payroll/employee data
- ✅ Compare actual salary costs to budget
- ✅ Generate variance reports by employee and department
- ✅ Export to Excel, CSV, or Google Sheets
- ✅ Historical variance trend analysis
- ✅ RESTful API for integration
- ✅ **React Dashboard** - Interactive web interface for viewing trends

## Prerequisites

- Python 3.9+
- (Optional) QuickBooks Online account with API access - **Mock data is used by default**
- (Optional) Google Cloud project with Sheets API enabled

**Note:** The application uses **mock data by default**, so you can test and develop without a QuickBooks account!

## Setup

1. **Create virtual environment and install dependencies:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
   
   **Note:** If you get "command not found: pip", use `pip3` instead, or activate the virtual environment first.

2. **Configure environment variables (optional):**
   ```bash
   cp .env.example .env
   # The app works with mock data by default - no configuration needed!
   # Only edit .env if you have real QuickBooks credentials
   ```

3. **Set up QuickBooks API (optional - only if you have a QuickBooks account):**
   - Create an app at https://developer.intuit.com
   - Get Client ID and Client Secret
   - Configure redirect URI
   - Add to `.env` file and set `USE_MOCK_DATA=false`

4. **Set up Google Sheets (optional):**
   - ✅ Credentials already configured in `.env`
   - **IMPORTANT:** Share your Google Sheet with the service account email
   - Service account email: `shippingpricecalculator@pricing-calculator-478920.iam.gserviceaccount.com`
   - Spreadsheet ID: `1mPLCZX8NuhvtP6O4wdp8OgfTP6GJFVr16oT8ik12dBk`
   - See `docs/GOOGLE_SHEETS_SETUP.md` for detailed instructions
   - Test with: `python test_google_sheets.py`

5. **Run the application:**
   
   **Option 1: Using the run script (recommended):**
   ```bash
   ./run.sh
   ```
   
   **Option 2: Manual activation:**
   ```bash
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python main.py
   ```
   
   **Option 3: With uvicorn directly:**
   ```bash
   source venv/bin/activate
   uvicorn main:app --reload
   ```

## Dashboard

**New!** Interactive React dashboard for viewing variance trends:

```bash
# Start both backend and frontend
./start_dashboard.sh

# Or start separately:
# Terminal 1: Backend
./run.sh

# Terminal 2: Frontend
cd frontend && npm install && npm run dev
```

Then open: **http://localhost:3000**

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- **Dashboard**: http://localhost:3000

## Mock Data

The application includes a **mock QuickBooks client** that generates realistic sample data for:
- 6 sample employees (Engineering and Architecture departments)
- Monthly payroll data with realistic variance
- Budget data for testing variance reports

**Sample Employees:**
- John Smith (Engineering) - $12,000/month budget
- Sarah Johnson (Engineering) - $10,000/month budget
- Michael Chen (Architecture) - $13,000/month budget
- Emily Rodriguez (Architecture) - $11,000/month budget
- David Kim (Engineering) - $9,500/month budget
- Lisa Anderson (Architecture) - $10,500/month budget

You can test all features without a QuickBooks account!

## Usage

### Generate Variance Report

```bash
curl -X POST "http://localhost:8000/api/v1/reports/variance" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2024,
    "month": 1,
    "format": "excel"
  }'
```

### Get Historical Trends

```bash
curl "http://localhost:8000/api/v1/reports/variance/trends?months=12"
```

### Get Variance by Department

```bash
curl "http://localhost:8000/api/v1/reports/variance/by-department?year=2024&month=1"
```

## Budget Management

Budgets are stored in `data/budgets.json`. You can:
- Manually edit the JSON file
- Use the API to set budgets (endpoint to be implemented)
- Import from Excel/CSV (feature to be implemented)

## Deployment

### AWS Lambda (Serverless)

1. Install dependencies:
   ```bash
   pip install -r requirements.txt -t .
   ```

2. Create deployment package:
   ```bash
   zip -r deployment.zip . -x "*.git*" "*.env" "__pycache__/*"
   ```

3. Deploy to Lambda with handler: `main.handler`

### Docker

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Google Sheets Auto-Sync

The system automatically updates Google Sheets when you generate reports for the current month. You can also manually sync:

### Manual Sync

```bash
# Sync latest report
./venv/bin/python3 sync_sheets.py latest

# Sync current month
./venv/bin/python3 sync_sheets.py current

# Sync historical trends (12 months)
./venv/bin/python3 sync_sheets.py historical 12

# Sync everything
./venv/bin/python3 sync_sheets.py all
```

### API Endpoint

```bash
# Sync via API
curl -X POST "http://localhost:8000/api/v1/sync/sheets?sync_type=latest"
curl -X POST "http://localhost:8000/api/v1/sync/sheets?sync_type=all"
```

### Monthly Execution

Set up a cron job or scheduled task to run monthly:

```bash
# Run on 1st of each month at 9 AM - syncs to Google Sheets
0 9 1 * * cd /path/to/project && ./venv/bin/python3 sync_sheets.py all
```

## Documentation

See `docs/SETUP.md` for detailed setup instructions.

## License

Proprietary - All rights reserved

