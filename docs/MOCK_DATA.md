# Mock Data Documentation

## Overview

The application includes a **MockQuickBooksClient** that generates realistic sample data for development and testing without requiring a QuickBooks account.

## Mock Employees

The mock client includes 6 sample employees representing an Architecture and Engineering firm:

| Employee ID | Name | Department | Monthly Budget |
|------------|------|------------|----------------|
| emp_001 | John Smith | Engineering | $12,000 |
| emp_002 | Sarah Johnson | Engineering | $10,000 |
| emp_003 | Michael Chen | Architecture | $13,000 |
| emp_004 | Emily Rodriguez | Architecture | $11,000 |
| emp_005 | David Kim | Engineering | $9,500 |
| emp_006 | Lisa Anderson | Architecture | $10,500 |

## Mock Payroll Data

The mock client generates payroll data with:
- **Realistic variance**: Actual payroll amounts vary by ±5% from budget to demonstrate variance reporting
- **Daily entries**: Generates payroll entries for each working day in the month
- **Mixed types**: Some employees are salary-based, others are hourly
- **Department grouping**: Employees are organized by Engineering and Architecture departments

## How It Works

1. **Automatic Detection**: The application automatically uses mock data if:
   - `USE_MOCK_DATA=true` in `.env` (default)
   - QuickBooks credentials are not provided
   - `QB_CLIENT_ID` or `QB_CLIENT_SECRET` are empty

2. **Budget Data**: Sample budgets are stored in `data/budgets.json` matching the mock employees

3. **Variance Simulation**: The mock payroll data includes random variance (95-110% of budget) to create realistic variance reports

## Testing with Mock Data

You can test all features:

```bash
# Start the server
./run.sh

# Generate a variance report for January 2024
curl -X POST "http://localhost:8000/api/v1/reports/variance" \
  -H "Content-Type: application/json" \
  -d '{"year": 2024, "month": 1, "format": "json"}'

# Get employees
curl "http://localhost:8000/api/v1/employees"

# Get variance trends
curl "http://localhost:8000/api/v1/reports/variance/trends?months=6"
```

## Switching to Real QuickBooks

When you're ready to use real QuickBooks data:

1. Set up QuickBooks API credentials at https://developer.intuit.com
2. Add credentials to `.env`:
   ```
   QB_CLIENT_ID=your_real_client_id
   QB_CLIENT_SECRET=your_real_secret
   USE_MOCK_DATA=false
   ```
3. Implement OAuth 2.0 flow to get access tokens
4. Update `get_qb_client()` in `app/api/routes.py` to use real tokens

The application will automatically switch to the real QuickBooks client when `USE_MOCK_DATA=false` and valid credentials are provided.

