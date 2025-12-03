# Backend Deployment Guide

Detailed guide for deploying the FastAPI backend to various cloud platforms.

## Prerequisites

- Python 3.11+
- All backend dependencies installed
- Environment variables configured

## Quick Deployment Options

### 1. Railway (Easiest)

1. Go to [railway.app](https://railway.app)
2. Click "New Project" > "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects Python
5. Add environment variables in dashboard
6. Deploy automatically!

**Pros:** Zero configuration, auto-deploy from GitHub
**Cons:** Limited customization

---

### 2. Heroku

1. Install Heroku CLI
2. Create `Procfile` in backend folder:
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
3. Create `runtime.txt`:
   ```
   python-3.11.0
   ```
4. Deploy:
   ```bash
   cd backend
   heroku create quickbooks-api
   heroku config:set USE_MOCK_DATA=true
   git push heroku main
   ```

---

### 3. Google Cloud Run (Recommended)

**Advantages:**
- Serverless (pay per request)
- Auto-scaling
- Container-based
- Free tier available

**Steps:**

1. **Create Dockerfile** (already created in backend/)
2. **Build and deploy:**
   ```bash
   cd backend
   
   # Set project
   gcloud config set project YOUR_PROJECT_ID
   
   # Build container
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/quickbooks-api
   
   # Deploy
   gcloud run deploy quickbooks-api \
     --image gcr.io/YOUR_PROJECT_ID/quickbooks-api \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 8000 \
     --memory 512Mi \
     --timeout 300 \
     --set-env-vars "USE_MOCK_DATA=true,LOG_LEVEL=INFO"
   ```

3. **Get URL:**
   ```bash
   gcloud run services describe quickbooks-api \
     --platform managed \
     --region us-central1 \
     --format 'value(status.url)'
   ```

4. **Update environment variables:**
   ```bash
   gcloud run services update quickbooks-api \
     --set-env-vars "USE_MOCK_DATA=true,QB_CLIENT_ID=xxx" \
     --region us-central1
   ```

---

### 4. AWS Elastic Beanstalk

**Steps:**

1. **Install EB CLI:**
   ```bash
   pip install awsebcli
   ```

2. **Initialize:**
   ```bash
   cd backend
   eb init -p "Python 3.11" quickbooks-api
   ```

3. **Create environment:**
   ```bash
   eb create quickbooks-api-env
   ```

4. **Deploy:**
   ```bash
   eb deploy
   ```

5. **Set environment variables:**
   ```bash
   eb setenv USE_MOCK_DATA=true
   ```

---

### 5. DigitalOcean App Platform

1. Go to DigitalOcean dashboard
2. Create new App
3. Connect GitHub repository
4. Select backend folder
5. Set build command: `pip install -r requirements.txt`
6. Set run command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Add environment variables
8. Deploy!

---

## Environment Variables Setup

All platforms require these environment variables:

```bash
# Required
USE_MOCK_DATA=true  # or false for real QuickBooks

# Optional (for real QuickBooks)
QB_CLIENT_ID=your_client_id
QB_CLIENT_SECRET=your_client_secret

# Optional (for Google Sheets)
GOOGLE_SHEETS_CREDENTIALS_PATH=/app/credentials.json
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id

# Optional
LOG_LEVEL=INFO
```

---

## CORS Configuration

Update `main.py` to allow your frontend domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-domain.com",
        "http://localhost:3000",  # Keep for local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Health Check

All platforms should check: `GET /health`

Configure health checks:
- **Cloud Run:** Automatic (uses port 8000)
- **AWS:** `/health` endpoint
- **Heroku:** Automatic via Procfile

---

## Monitoring

### Recommended: Add logging

```python
import logging
logging.basicConfig(level=logging.INFO)
```

### Platforms with built-in monitoring:
- **Google Cloud Run:** Cloud Logging (automatic)
- **AWS:** CloudWatch
- **Heroku:** Logs dashboard

---

## Scaling

- **Cloud Run:** Auto-scales (0 to 1000+ instances)
- **Heroku:** Use dyno types
- **AWS:** Configure auto-scaling groups
- **Railway:** Auto-scales automatically

---

## Next Steps

1. Choose platform
2. Follow specific guide
3. Test deployment
4. Update frontend API URL
5. Monitor logs

For full deployment guide, see `DEPLOYMENT.md`.

