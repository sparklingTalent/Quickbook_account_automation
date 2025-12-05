# 🚨 Fix: "Network Error" on Vercel

## Problem
Your frontend on Vercel is trying to connect to `localhost:8000` instead of your production backend.

## ✅ Solution: Set Environment Variable

### Step 1: Get Your Backend URL

First, get your backend URL from your deployment platform:

- **Railway:** Dashboard → Service → Settings → Networking → Public Domain
- **Cloud Run:** Console → Cloud Run → Service → URL at top
- **Heroku:** Dashboard → App → URL at top

Example: `https://quickbooks-api.up.railway.app`

### Step 2: Set Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your **project**
3. Go to **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. Click **Add New**
6. Fill in:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend-url.com/api/v1`
   - **Environments:** ✅ Production ✅ Preview ✅ Development
7. Click **Save**

**Important:** 
- Replace `your-backend-url.com` with your actual backend URL
- **Must include `/api/v1` at the end!**
- Example: `https://quickbooks-api.up.railway.app/api/v1`

### Step 3: Redeploy

After setting the environment variable:

1. Go to **Deployments** tab
2. Click the **3 dots** (⋯) on your latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### Step 4: Verify

1. Open your Vercel URL
2. Open browser console (F12)
3. Check the **Console** tab - you should see:
   ```
   🔗 API Base URL: https://your-backend-url.com/api/v1
   ```
4. Check the **Network** tab - API calls should go to your backend URL (not localhost)

---

## 🔍 Troubleshooting

### Still seeing localhost?

1. **Check environment variable:**
   - Vercel Dashboard → Settings → Environment Variables
   - Make sure `VITE_API_URL` is set correctly
   - Make sure it's enabled for **Production** environment

2. **Check build logs:**
   - Deployments → Click deployment → Build Logs
   - Look for `VITE_API_URL` in the logs
   - Should show your backend URL

3. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

4. **Check backend CORS (Railway):**
   - Go to Railway Dashboard → Your Service → Variables
   - Add environment variable:
     - **Key:** `ALLOWED_ORIGINS`
     - **Value:** `*` (to allow all origins) OR your specific Vercel domain like `https://your-app.vercel.app`
   - **Redeploy** your Railway service after adding the variable
   - The error message will show your frontend origin - add that to `ALLOWED_ORIGINS` if using specific domains

### Backend URL format

✅ **Correct:**
```
https://quickbooks-api.up.railway.app/api/v1
```

❌ **Wrong:**
```
https://quickbooks-api.up.railway.app          (missing /api/v1)
http://localhost:8000/api/v1                  (localhost won't work)
https://quickbooks-api.up.railway.app/api     (missing /v1)
```

---

## 📋 Quick Checklist

- [ ] Backend is deployed and accessible
- [ ] Backend URL includes `/api/v1` at the end
- [ ] `VITE_API_URL` is set in Vercel
- [ ] Environment variable is enabled for Production
- [ ] Frontend is redeployed after setting env var
- [ ] Backend CORS allows Vercel domain (`ALLOWED_ORIGINS=*`)

---

## 🧪 Test Your Setup

### Test Backend:
```bash
curl https://your-backend-url.com/health
```

Should return: `{"status": "healthy", ...}`

### Test Frontend:
1. Open your Vercel URL
2. Open browser console (F12)
3. Should see: `🔗 API Base URL: https://your-backend-url.com/api/v1`
4. No network errors in console

---

## 📞 Still Not Working?

1. **Check browser console** for specific error messages
2. **Check Network tab** to see what URL is being called
3. **Verify backend is running** - test with curl
4. **Check CORS headers** in Network tab response headers
5. **Review Vercel build logs** for any errors

---

## 🎯 Common Mistakes

❌ **Forgetting `/api/v1` at the end**
- Wrong: `https://backend.com`
- Right: `https://backend.com/api/v1`

❌ **Using localhost in production**
- Wrong: `http://localhost:8000/api/v1`
- Right: `https://your-backend-url.com/api/v1`

❌ **Not redeploying after setting env var**
- Always redeploy after changing environment variables!

❌ **Setting env var only for Development**
- Make sure it's set for **Production** too!

---

## ✅ Success Indicators

When it's working, you'll see:
- ✅ Dashboard loads data
- ✅ No console errors
- ✅ Network tab shows requests to your backend URL
- ✅ Charts and graphs display correctly

