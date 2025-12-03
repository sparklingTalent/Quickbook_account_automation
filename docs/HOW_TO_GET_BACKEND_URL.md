# How to Get Your Backend URL

Quick guide to find your backend URL after deployment.

---

## 🚂 Railway (Recommended)

### Method 1: Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Click on your **project**
3. Click on your **backend service**
4. Go to **Settings** tab
5. Scroll to **Networking** section
6. Find **Public Domain** - this is your backend URL!
   - Example: `https://quickbooks-api-production.up.railway.app`

### Method 2: Railway CLI
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Get service URL
railway status
```

### Method 3: Check Deployment Logs
1. Go to your service in Railway dashboard
2. Click **Deployments** tab
3. Click on latest deployment
4. Check logs - the URL is usually shown there

---

## ☁️ Google Cloud Run

### Method 1: Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **Cloud Run**
3. Click on your service name
4. The URL is shown at the top: `https://your-service-xxxxx.run.app`

### Method 2: Command Line
```bash
# Get the URL
gcloud run services describe quickbooks-api \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'
```

Output: `https://quickbooks-api-xxxxx-uc.a.run.app`

---

## 🟣 Heroku

### Method 1: Heroku Dashboard
1. Go to [dashboard.heroku.com](https://dashboard.heroku.com)
2. Click on your app
3. The URL is shown at the top: `https://your-app-name.herokuapp.com`

### Method 2: Heroku CLI
```bash
# Get app info
heroku info

# Or just the URL
heroku info -s | grep web_url
```

---

## 🟠 Render

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click on your **Web Service**
3. The URL is shown at the top: `https://your-service.onrender.com`

---

## 🟢 DigitalOcean App Platform

1. Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
2. Navigate to **Apps**
3. Click on your app
4. Go to **Settings** tab
5. Find **Domains** section
6. Your URL: `https://your-app-xxxxx.ondigitalocean.app`

---

## 🔵 AWS Elastic Beanstalk

### Method 1: AWS Console
1. Go to [AWS Console](https://console.aws.amazon.com)
2. Navigate to **Elastic Beanstalk**
3. Click on your environment
4. The URL is shown at the top: `http://your-env.elasticbeanstalk.com`

### Method 2: AWS CLI
```bash
aws elasticbeanstalk describe-environments \
  --environment-names your-env-name \
  --query 'Environments[0].CNAME'
```

---

## 🧪 Test Your Backend URL

Once you have your URL, test it:

```bash
# Health check
curl https://your-backend-url.com/health

# Should return:
# {"status": "healthy", "service": "QuickBooks Accounting Automation"}
```

Or open in browser:
```
https://your-backend-url.com/docs
```

---

## 📝 Important Notes

### Full API URL Format
Your backend URL should be:
```
https://your-backend-url.com/api/v1
```

**Examples:**
- Railway: `https://quickbooks-api.up.railway.app/api/v1`
- Cloud Run: `https://quickbooks-api-xxxxx.run.app/api/v1`
- Heroku: `https://your-app.herokuapp.com/api/v1`

### For Frontend Configuration
When setting `VITE_API_URL` in Vercel/Netlify, use:
```
VITE_API_URL=https://your-backend-url.com/api/v1
```

**Don't forget `/api/v1` at the end!**

---

## 🔍 Troubleshooting

### URL Not Working?
1. **Check if service is running:**
   - Railway: Check deployment status (should be "Active")
   - Cloud Run: Check service status
   - Heroku: Check dyno status

2. **Check environment variables:**
   - Make sure `PORT` is set correctly (usually auto-set)
   - Verify `USE_MOCK_DATA=true` is set

3. **Check logs:**
   - Railway: View logs in dashboard
   - Cloud Run: `gcloud run services logs read`
   - Heroku: `heroku logs --tail`

4. **Test locally first:**
   ```bash
   # Make sure it works locally
   curl http://localhost:8000/health
   ```

---

## 🎯 Quick Reference

| Platform | Where to Find URL |
|----------|-------------------|
| **Railway** | Dashboard → Service → Settings → Networking |
| **Cloud Run** | Console → Cloud Run → Service name |
| **Heroku** | Dashboard → App → Top of page |
| **Render** | Dashboard → Web Service → Top of page |
| **DigitalOcean** | Dashboard → Apps → Settings → Domains |
| **AWS EB** | Console → Elastic Beanstalk → Environment |

---

## ✅ Next Steps

After getting your backend URL:

1. **Test it:**
   ```bash
   curl https://your-backend-url.com/health
   ```

2. **Update frontend:**
   - Set `VITE_API_URL=https://your-backend-url.com/api/v1` in Vercel

3. **Configure CORS:**
   - Set `ALLOWED_ORIGINS=*` on backend (or specific frontend URL)

4. **Deploy frontend:**
   - Frontend will now connect to your backend!

---

## 📞 Still Can't Find It?

1. Check your deployment platform's documentation
2. Look in deployment logs
3. Check email notifications (some platforms send the URL)
4. Try the platform's CLI tool

