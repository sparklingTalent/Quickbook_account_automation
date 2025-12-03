# QuickBooks Accounting - Backend API

FastAPI backend for QuickBooks Accounting Automation.

## Structure

```
backend/
├── app/
│   ├── api/          # API routes
│   ├── payroll/      # Payroll service
│   ├── quickbooks/   # QuickBooks client
│   ├── reports/      # Report generation
│   └── services/     # Utility services
├── data/             # Data files (budgets.json)
├── main.py           # Application entry point
├── config.py         # Configuration
└── requirements.txt  # Dependencies
```

## Quick Start

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload
```

## Environment Variables

See `.env.example` for all available environment variables.

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Deployment

See `../docs/DEPLOYMENT.md` for cloud deployment instructions.

