# Project Structure

This document explains the reorganized project structure for deployment.

## New Structure

```
quickbooks-accounting/
├── backend/                    # Python FastAPI Backend
│   ├── app/
│   │   ├── api/               # API routes and endpoints
│   │   ├── payroll/           # Payroll service logic
│   │   ├── quickbooks/        # QuickBooks client
│   │   ├── reports/           # Report generation
│   │   └── services/          # Utility services
│   ├── data/                  # Data files (budgets.json)
│   ├── main.py                # FastAPI application entry
│   ├── config.py              # Configuration settings
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile             # Docker configuration
│   ├── .env.example           # Environment variables template
│   └── README.md              # Backend documentation
│
├── frontend/                   # React Frontend (Vite)
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── hooks/             # Custom React hooks
│   │   └── utils/             # Utilities
│   ├── public/                # Static assets
│   ├── package.json           # Node dependencies
│   ├── Dockerfile             # Docker configuration
│   ├── nginx.conf             # Nginx config for production
│   ├── .env.example           # Environment variables template
│   └── README.md              # Frontend documentation
│
├── docs/                       # Documentation
│   ├── DEPLOYMENT.md          # Main deployment guide
│   ├── DEPLOYMENT_BACKEND.md  # Backend deployment details
│   ├── DEPLOYMENT_FRONTEND.md # Frontend deployment details
│   └── ...
│
├── docker-compose.yml          # Full stack deployment
├── .gitignore                 # Git ignore rules
└── README.md                  # Main project README
```

## Backend Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── api/
│   │   ├── routes.py          # Main API routes
│   │   ├── batch.py           # Batch endpoints
│   │   └── auto_sync.py       # Auto-sync logic
│   ├── payroll/
│   │   ├── service.py         # Payroll service
│   │   └── budget.py          # Budget management
│   ├── quickbooks/
│   │   ├── client.py          # Real QuickBooks client
│   │   ├── mock_client.py     # Mock client for testing
│   │   └── models.py          # Data models
│   ├── reports/
│   │   ├── exporter.py        # Export to Excel/CSV/Sheets
│   │   └── variance.py        # Variance calculations
│   └── services/
│       ├── cache.py           # Caching utilities
│       └── sheets_sync.py     # Google Sheets sync
├── data/
│   └── budgets.json           # Budget data
├── main.py                    # FastAPI app
├── config.py                  # Settings
└── requirements.txt           # Dependencies
```

## Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── VarianceTrendsChart.jsx
│   │   ├── DepartmentBreakdown.jsx
│   │   ├── EmployeeAnalysis.jsx
│   │   ├── MonthlyComparison.jsx
│   │   ├── SummaryCards.jsx
│   │   ├── PDFExportButton.jsx
│   │   └── ...
│   ├── pages/
│   │   └── Dashboard.jsx
│   ├── services/
│   │   └── api.js             # API service
│   ├── hooks/
│   │   └── useApiCache.js     # Caching hook
│   ├── utils/
│   │   └── pdfGenerator.js    # PDF generation
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── vite.config.js
```

## Migration Guide

### Moving Files

If you need to reorganize manually:

1. **Backend files** → `backend/`
   - All Python files
   - `requirements.txt`
   - `data/` folder
   - `app/` folder

2. **Frontend files** → Already in `frontend/`

3. **Keep in root:**
   - `docker-compose.yml`
   - `.gitignore`
   - `README.md`
   - `docs/` folder

### Update Imports

After moving, update imports if needed:
- Backend imports should remain relative to `backend/`
- Frontend imports should remain relative to `frontend/src/`

## Deployment

See `docs/DEPLOYMENT.md` for detailed deployment instructions.

