# QuickBooks Accounting - Deployment Guide

Quick reference for deploying the QuickBooks Accounting Automation project to the cloud.

## 🏗️ Project Structure

The project is organized into two main parts:

```
quickbooks-accounting/
├── backend/        # Python FastAPI Backend
└── frontend/       # React Dashboard
```

## 🚀 Quick Start Deployment

### Option 1: Railway (Easiest - Recommended)

**Backend:**
1. Go to [railway.app](https://railway.app)
2. New Project > Deploy from GitHub
3. Select repository
4. Root directory: `backend`
5. Add environment variables
6. Deploy!

**Frontend:**
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Root directory: `frontend`
4. Framework: Vite
5. Add environment variable: `VITE_API_URL`
6. Deploy!

**Time to deploy: ~10 minutes** ⏱️

---

### Option 2: Docker Compose (Full Stack)

**Deploy entire stack locally or on any server:**

```bash
# Build and run
docker-compose up -d

# Backend: http://localhost:8000
# Frontend: http://localhost
```

See `docker-compose.yml` for configuration.

---

### Option 3: Google Cloud Run (Backend) + Vercel (Frontend)

**Backend - Cloud Run:**
```bash
cd backend
gcloud builds submit --tag gcr.io/PROJECT_ID/quickbooks-api
gcloud run deploy quickbooks-api \
  --image gcr.io/PROJECT_ID/quickbooks-api \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "USE_MOCK_DATA=true"
```

**Frontend - Vercel:**
```bash
cd frontend
vercel
```

---

## 📋 Deployment Checklist

### Backend Setup:
- [ ] Python 3.11+ installed
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Environment variables configured (`.env` or platform env vars)
- [ ] Port 8000 accessible (or platform default)
- [ ] Health check endpoint working (`/health`)

### Frontend Setup:
- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variable set (`VITE_API_URL`)
- [ ] Backend CORS allows frontend domain

### After Deployment:
- [ ] Test API endpoints
- [ ] Test dashboard loads
- [ ] Test PDF export
- [ ] Test Excel download
- [ ] Check logs for errors
- [ ] Monitor performance

---

## 🌐 Platform-Specific Guides

### Backend Deployment
- **Railway:** See `docs/DEPLOYMENT_BACKEND.md` (Railway section)
- **Google Cloud Run:** See `docs/DEPLOYMENT_BACKEND.md` (Cloud Run section)
- **AWS Lambda:** See `docs/DEPLOYMENT.md` (AWS Lambda section)
- **Heroku:** See `docs/DEPLOYMENT.md` (Heroku section)

### Frontend Deployment
- **Vercel:** See `docs/DEPLOYMENT_FRONTEND.md` (Vercel section)
- **Netlify:** See `docs/DEPLOYMENT_FRONTEND.md` (Netlify section)
- **AWS S3:** See `docs/DEPLOYMENT_FRONTEND.md` (AWS S3 section)

---

## 🔧 Environment Variables

### Backend
```bash
USE_MOCK_DATA=true  # Use mock data (no QuickBooks needed)
QB_CLIENT_ID=xxx    # Optional: Real QuickBooks credentials
QB_CLIENT_SECRET=xxx
LOG_LEVEL=INFO
```

### Frontend
```bash
VITE_API_URL=https://your-backend-url.com/api/v1
```

**Important:** Set these in your platform's environment variables settings.

---

## 📊 Recommended Architecture

### For Small Projects (Free/Low Cost):
- **Backend:** Railway or Heroku (free tier)
- **Frontend:** Vercel or Netlify (free tier)

### For Production (Scalable):
- **Backend:** Google Cloud Run or AWS Lambda
- **Frontend:** Vercel or AWS S3 + CloudFront

### For Enterprise (High Availability):
- **Backend:** AWS ECS/Fargate or GKE
- **Frontend:** AWS S3 + CloudFront
- **Database:** RDS or Cloud SQL (if needed)

---

## 🔗 Quick Links

- **Full Deployment Guide:** `docs/DEPLOYMENT.md`
- **Backend Deployment:** `docs/DEPLOYMENT_BACKEND.md`
- **Frontend Deployment:** `docs/DEPLOYMENT_FRONTEND.md`
- **Project Structure:** `PROJECT_STRUCTURE.md`

---

## 🆘 Troubleshooting

### Backend won't start:
- Check Python version (needs 3.11+)
- Verify all dependencies installed
- Check environment variables
- Review logs for errors

### Frontend can't connect to backend:
- Verify `VITE_API_URL` is correct
- Check CORS settings on backend
- Ensure backend is running
- Check network/firewall rules

### Build fails:
- Check Node.js version (needs 18+)
- Delete `node_modules` and reinstall
- Clear npm cache: `npm cache clean --force`

---

## 📞 Support

For detailed deployment instructions, see:
- `docs/DEPLOYMENT.md` - Complete deployment guide
- `docs/DEPLOYMENT_BACKEND.md` - Backend-specific
- `docs/DEPLOYMENT_FRONTEND.md` - Frontend-specific

