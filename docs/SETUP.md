# Setup Guide

## QuickBooks API Setup

1. Go to https://developer.intuit.com
2. Create a new app
3. Select "QuickBooks Online" as the product
4. Note your Client ID and Client Secret
5. Set redirect URI: `http://localhost:8000/auth/callback`
6. Add credentials to `.env` file

## OAuth 2.0 Flow

The application needs to implement OAuth 2.0 flow to get access tokens. Here's a simplified flow:

1. Redirect user to QuickBooks authorization URL
2. User authorizes the app
3. Receive authorization code
4. Exchange code for access token and refresh token
5. Store tokens securely
6. Use access token for API calls

## Google Sheets Setup

1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable Google Sheets API
4. Create Service Account
5. Download credentials JSON
6. Share your Google Sheet with the service account email
7. Set credentials path in `.env`

## Budget Configuration

Budgets can be configured in `data/budgets.json`. Format:

```json
{
  "employee_id_year_month": {
    "employee_id": "123",
    "employee_name": "John Doe",
    "department": "Engineering",
    "month": "01",
    "year": 2024,
    "amount": 10000.0
  }
}
```

## Testing

Run tests with:
```bash
pytest tests/
```

## Troubleshooting

### QuickBooks API Errors
- Verify credentials in `.env`
- Check API environment (sandbox vs production)
- Ensure OAuth tokens are valid

### Google Sheets Errors
- Verify service account has access to spreadsheet
- Check credentials file path
- Ensure Sheets API is enabled

