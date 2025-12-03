# Frontend Deployment Guide

Detailed guide for deploying the React frontend to various platforms.

## Prerequisites

- Node.js 18+
- All frontend dependencies installed
- Backend API URL

## Quick Deployment Options

### 1. Vercel (Recommended - Easiest)

**Advantages:**
- Zero configuration
- Auto-deploy from GitHub
- Free SSL
- Global CDN
- Preview deployments

**Steps:**

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

3. **Or connect GitHub:**
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repository
   - Set root directory: `frontend`
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

4. **Set environment variable:**
   - Go to Project Settings > Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.com/api/v1`

5. **Redeploy** after adding environment variable

---

### 2. Netlify

**Advantages:**
- Free tier
- Continuous deployment
- Form handling
- Split testing

**Steps:**

1. **Build locally:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy via drag-and-drop:**
   - Go to [netlify.com](https://netlify.com)
   - Drag `dist` folder to deploy

3. **Or use CLI:**
   ```bash
   npm install -g netlify-cli
   cd frontend
   netlify deploy --prod
   ```

4. **Or connect GitHub:**
   - New site from Git
   - Select repository
   - Build settings:
     - Base directory: `frontend`
     - Build command: `npm run build`
     - Publish directory: `frontend/dist`

5. **Set environment variable:**
   - Site settings > Build & deploy > Environment
   - Add: `VITE_API_URL`

---

### 3. AWS S3 + CloudFront

**Advantages:**
- Highly scalable
- Global CDN
- Low cost for high traffic

**Steps:**

1. **Build:**
   ```bash
   cd frontend
   VITE_API_URL=https://your-backend-url.com/api/v1 npm run build
   ```

2. **Create S3 bucket:**
   ```bash
   aws s3 mb s3://quickbooks-dashboard
   ```

3. **Upload files:**
   ```bash
   aws s3 sync dist/ s3://quickbooks-dashboard --delete
   ```

4. **Enable static website hosting:**
   ```bash
   aws s3 website s3://quickbooks-dashboard --index-document index.html
   ```

5. **Create CloudFront distribution:**
   - Origin: S3 bucket
   - Default root object: `index.html`
   - Custom error pages:
     - 403 → `/index.html` (200)
     - 404 → `/index.html` (200)

6. **Update S3 bucket policy:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Sid": "PublicReadGetObject",
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::quickbooks-dashboard/*"
     }]
   }
   ```

---

### 4. Google Cloud Storage + Cloud CDN

**Steps:**

1. **Build:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Create bucket:**
   ```bash
   gsutil mb gs://quickbooks-dashboard
   gsutil -m rsync -r -d dist/ gs://quickbooks-dashboard
   gsutil web set -m index.html gs://quickbooks-dashboard
   gsutil iam ch allUsers:objectViewer gs://quickbooks-dashboard
   ```

3. **Setup Cloud CDN:**
   - Create load balancer
   - Add backend bucket
   - Configure Cloud CDN

---

## Environment Variables

### Build-time variables (Vite):

```bash
# .env.production
VITE_API_URL=https://your-backend-url.com/api/v1
```

**Important:** Vite environment variables must start with `VITE_` and are embedded at build time.

### Set for deployment:

**Vercel:**
```bash
vercel env add VITE_API_URL production
```

**Netlify:**
- Add in dashboard under Environment variables

**Build with env:**
```bash
VITE_API_URL=https://api.example.com/api/v1 npm run build
```

---

## CORS Configuration

Make sure your backend allows your frontend domain:

```python
# backend/main.py
allow_origins=[
    "https://your-frontend.vercel.app",
    "https://your-frontend.netlify.app",
    # etc.
]
```

---

## React Router Configuration

For single-page app routing, configure redirects:

**Vercel:** Create `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Netlify:** Create `_redirects` in `public/`:
```
/*    /index.html   200
```

**AWS S3/CloudFront:** Use error page redirects (see above)

---

## Build Optimization

1. **Enable compression:**
   - Vercel/Netlify: Automatic
   - S3: Use CloudFront compression

2. **Optimize images:**
   - Use WebP format
   - Lazy load images

3. **Code splitting:**
   - Already enabled in Vite
   - Check bundle size: `npm run build -- --analyze`

---

## Deployment Checklist

- [ ] Build succeeds locally
- [ ] Environment variables set
- [ ] Backend API URL is correct
- [ ] CORS configured on backend
- [ ] React Router redirects configured
- [ ] SSL certificate active
- [ ] Health check working
- [ ] All features tested

---

## Recommended Setup

**Best for most users:**
- **Frontend:** Vercel (free, easy, fast)
- **Backend:** Google Cloud Run or Railway

**Best for enterprise:**
- **Frontend:** AWS S3 + CloudFront
- **Backend:** AWS ECS or EC2

For full deployment guide, see `DEPLOYMENT.md`.

