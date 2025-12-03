# React Dashboard Setup Guide

## Quick Start

### Prerequisites

- Node.js 16+ and npm (check with `node --version` and `npm --version`)
- Backend server running (see main README)

### Installation

1. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the dashboard:**
   ```bash
   # From frontend directory
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

### Start Both Backend and Frontend

From project root:

```bash
./start_dashboard.sh
```

This will:
- Start the backend API server (if not running)
- Start the React frontend
- Open both at their respective ports

## Dashboard Features

### 📊 Summary Cards
- Total employees count
- Total budget and actual amounts
- Total variance with percentage
- Average variance over selected period

### 📈 Historical Variance Trends
- Line chart showing budget vs actual over time
- Variance trend line
- Interactive tooltips
- Average variance statistics

### 📉 Department Breakdown
- Bar chart comparing departments
- Detailed table with budget, actual, and variance
- Color-coded variance indicators

### 🎛️ Controls
- Select historical period (6, 12, 18, or 24 months)
- Choose specific year and month for department breakdown
- Refresh button to reload data

## Troubleshooting

### "Cannot connect to API"
- Make sure backend is running: `./run.sh`
- Check backend is accessible: `curl http://localhost:8000/api/v1/health`
- Verify CORS settings in `main.py`

### "npm: command not found"
- Install Node.js from https://nodejs.org/
- Or use nvm: `nvm install 18 && nvm use 18`

### Port 3000 already in use
- Change port in `vite.config.js`:
  ```js
  server: {
    port: 3001, // Change to available port
  }
  ```

### Build for Production

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/` and can be served by any static file server.

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── VarianceTrendsChart.jsx
│   │   ├── DepartmentBreakdown.jsx
│   │   ├── SummaryCards.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorMessage.jsx
│   ├── pages/
│   │   └── Dashboard.jsx    # Main dashboard page
│   ├── services/
│   │   └── api.js           # API service layer
│   ├── App.jsx
│   └── main.jsx
├── public/                  # Static assets
├── package.json
└── vite.config.js
```

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Recharts** - Charting library
- **Axios** - HTTP client
- **date-fns** - Date utilities

