# Google Sheets Auto-Sync Documentation

## Overview

The system automatically keeps Google Sheets updated with the latest variance report data. This ensures your spreadsheet always has current information without manual intervention.

## How Auto-Sync Works

### Automatic Triggers

Auto-sync is triggered automatically in these scenarios:

1. **When generating reports for current month**
   - Any API call to generate a variance report for the current month
   - Format doesn't matter (JSON, Excel, CSV, or Sheets)
   - Updates the "LatestReport" sheet

2. **When accessing variance trends**
   - GET request to `/api/v1/reports/variance/trends`
   - Ensures latest data is synced

3. **When exporting to Google Sheets**
   - POST request with `format: "sheets"`
   - Updates both the month-specific sheet and "LatestReport"

### What Gets Synced

- **LatestReport** sheet: Always contains the current month's data
- **VarianceReport_YYYY_MM** sheets: Month-specific reports
- **HistoricalTrends** sheet: Historical data (when manually synced)

## Manual Sync

You can also manually trigger syncs:

### Via Script

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

### Via API

```bash
# Sync latest report
curl -X POST "http://localhost:8000/api/v1/sync/sheets?sync_type=latest"

# Sync all data
curl -X POST "http://localhost:8000/api/v1/sync/sheets?sync_type=all"

# Sync historical trends (18 months)
curl -X POST "http://localhost:8000/api/v1/sync/sheets?sync_type=historical&months=18"
```

## Testing Auto-Sync

Run the test script:

```bash
./venv/bin/python3 test_auto_sync.py
```

This will:
- Verify Google Sheets is configured
- Test auto-sync for current month
- Test auto-sync on data access
- Verify manual sync works

## Configuration

Auto-sync requires:
- ✅ Google Sheets credentials in `.env`
- ✅ Spreadsheet shared with service account
- ✅ `GOOGLE_SHEETS_SPREADSHEET_ID` set in `.env`

## Scheduled Sync

For monthly automated syncs, set up a cron job:

```bash
# Run on 1st of each month at 9 AM
0 9 1 * * cd /path/to/project && ./venv/bin/python3 sync_sheets.py all
```

## Troubleshooting

### Auto-sync not working

1. **Check Google Sheets configuration:**
   ```bash
   ./venv/bin/python3 test_google_sheets.py
   ```

2. **Check logs:**
   - Auto-sync logs warnings if it fails (non-blocking)
   - Check server logs for details

3. **Manual sync test:**
   ```bash
   ./venv/bin/python3 sync_sheets.py latest
   ```

### Sheets not updating

- Verify service account has edit access
- Check spreadsheet ID is correct
- Ensure credentials file is valid
- Try manual sync first to isolate issue

### Performance

- Auto-sync is non-blocking (doesn't slow down API responses)
- Syncs happen in background
- Failed syncs don't break API calls

## Best Practices

1. **Regular Manual Syncs**: Run `sync_sheets.py all` weekly to ensure all data is current
2. **Monitor Logs**: Check for sync warnings in application logs
3. **Test After Changes**: Run `test_auto_sync.py` after configuration changes
4. **Scheduled Syncs**: Set up cron job for monthly full syncs

## API Endpoints

### Sync Endpoint

```
POST /api/v1/sync/sheets?sync_type={type}&months={n}
```

**Parameters:**
- `sync_type`: `latest`, `current`, `historical`, or `all`
- `months`: Number of months for historical sync (default: 12)

**Response:**
```json
{
  "status": "success",
  "message": "Latest report synced to Google Sheets",
  "sheet_name": "LatestReport"
}
```

