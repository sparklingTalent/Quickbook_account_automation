# 🔧 Quick Fix: CORS Error on Railway

## Problem
Your frontend at `https://quickbook-dashboard-mocha.vercel.app` cannot connect to your Railway backend because CORS is blocking it.

## ✅ Solution: Set ALLOWED_ORIGINS on Railway

### Step 1: Go to Railway Dashboard
1. Open [Railway Dashboard](https://railway.app/dashboard)
2. Click on your backend service: `carefree-playfulness-production-cb34`

### Step 2: Add Environment Variable
1. Click on the **Variables** tab
2. Click **+ New Variable**
3. Fill in:
   - **Variable:** `ALLOWED_ORIGINS`
   - **Value:** `*` (to allow all origins)
4. Click **Add**

**Alternative:** If you want to be more specific, you can set:
- **Variable:** `ALLOWED_ORIGINS`
- **Value:** `https://quickbook-dashboard-mocha.vercel.app`

Or multiple domains (comma-separated):
- **Value:** `https://quickbook-dashboard-mocha.vercel.app,https://quickbook-account-automation.vercel.app`

### Step 3: Redeploy
Railway will automatically redeploy when you add the variable. Wait for the deployment to complete (usually 1-2 minutes).

### Step 4: Verify
1. Go back to your Vercel frontend
2. Refresh the page
3. The error should be gone!

---

## 🧪 Test CORS is Working

After setting the variable, test with:

```bash
curl -H "Origin: https://quickbook-dashboard-mocha.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://carefree-playfulness-production-cb34.up.railway.app/api/v1/health \
     -v
```

You should see `access-control-allow-origin: *` or your specific domain in the response headers.

---

## 📋 Current Configuration

- **Backend URL:** `https://carefree-playfulness-production-cb34.up.railway.app/api/v1`
- **Frontend URL:** `https://quickbook-dashboard-mocha.vercel.app`
- **Issue:** Frontend origin not in CORS allowed list

---

## ✅ After Fix

Once `ALLOWED_ORIGINS=*` is set on Railway:
- ✅ Frontend can connect to backend
- ✅ API calls will work
- ✅ Dashboard will load data
- ✅ No more CORS errors

