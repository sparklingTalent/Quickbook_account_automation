# Quick Deployment Guide

Fastest way to get your QuickBooks Accounting app deployed to the cloud.

## ⚡ 5-Minute Deployment (Railway + Vercel)

### Backend (Railway)

1. **Sign up at [railway.app](https://railway.app)**

2. **Create new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure backend:**
   - Root Directory: `backend`
   - Build Command: (leave empty)
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Add environment variables:**
   ```
   USE_MOCK_DATA=true
   LOG_LEVEL=INFO
   ```

5. **Deploy!** Railway auto-detects Python and deploys.

6. **Get your backend URL:**
   - Click on your service
   - Copy the URL (e.g., `https://quickbooks-api.up.railway.app`)

---

### Frontend (Vercel)

1. **Sign up at [vercel.com](https://vercel.com)**

2. **Import project:**
   - Click "Add New" > "Project"
   - Import from GitHub
   - Select your repository

3. **Configure:**
   - Root Directory: `frontend`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add environment variable:**
   ```
   VITE_API_URL=https://your-railway-backend-url.up.railway.app/api/v1
   ```
   (Use the URL from step 6 above)

5. **Deploy!** Vercel builds and deploys automatically.

6. **Done!** Your app is live! 🎉

---

## 🐳 Docker Deployment (Alternative)

If you have Docker installed locally or on a server:

```bash
# Clone repository
git clone <your-repo-url>
cd quickbooks-accounting

# Start everything
docker-compose up -d

# Access:
# Frontend: http://localhost
# Backend: http://localhost:8000
```

---

## 📝 Environment Variables Cheat Sheet

### Backend (Railway/Cloud Platform):
```bash
USE_MOCK_DATA=true
LOG_LEVEL=INFO
# Optional:
QB_CLIENT_ID=xxx
QB_CLIENT_SECRET=xxx
GOOGLE_SHEETS_SPREADSHEET_ID=xxx
```

### Frontend (Vercel/Netlify):
```bash
VITE_API_URL=https://your-backend-url.com/api/v1
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend health check works: `https://your-backend-url.com/health`
- [ ] Frontend loads: `https://your-frontend-url.com`
- [ ] Dashboard displays data
- [ ] PDF export works
- [ ] Excel download works
- [ ] No console errors

---

## 🔄 Updates

After code changes:
- **Railway:** Auto-deploys on git push (if connected)
- **Vercel:** Auto-deploys on git push (if connected)
- **Docker:** Run `docker-compose up -d --build`

---

## 💰 Cost Estimate

- **Railway:** Free tier available, then ~$5-20/month
- **Vercel:** Free tier available, then ~$20/month
- **Total:** Free to start, ~$25-40/month for production

---

## 📚 Need More Details?

See full guides:
- `docs/DEPLOYMENT.md` - Complete guide
- `docs/DEPLOYMENT_BACKEND.md` - Backend details
- `docs/DEPLOYMENT_FRONTEND.md` - Frontend details

