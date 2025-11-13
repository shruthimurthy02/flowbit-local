# Flowbit Production Deployment Guide

## 🎯 Overview

This guide covers deploying Flowbit to production:
- **Frontend**: Vercel (Next.js)
- **Backend API**: Render (Node.js + Express)
- **Vanna AI Service**: Render (Python + FastAPI)
- **Database**: Render PostgreSQL or Supabase

## 📋 Prerequisites

- GitHub repository with Flowbit code
- Vercel account (free tier)
- Render account (free tier)
- PostgreSQL database (Render or Supabase)

## 🚀 Deployment Steps

### Step 1: Verify Local Setup

Before deploying, ensure everything works locally:

```powershell
# Test Backend API
curl http://localhost:3001/stats
curl http://localhost:3001/invoices?page=1&per_page=5

# Test Vanna Service
curl http://127.0.0.1:8000/
curl http://127.0.0.1:8000/status

# Test Frontend
# Open http://localhost:3000 in browser
```

**Expected Results:**
- ✅ Backend returns JSON data
- ✅ Vanna returns `{"status": "ok"}`
- ✅ Frontend displays dashboard with charts

### Step 2: Create PostgreSQL Database

#### Option A: Render PostgreSQL (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `flowbit-db`
   - **Database**: `flowbit_db`
   - **User**: `flowbit_user` (or use default)
   - **Region**: Choose closest to you
   - **Plan**: Free
4. Click **"Create Database"**
5. Copy the **Internal Database URL** (for Render services)
6. Copy the **External Database URL** (for local development)

**Connection String Format:**
```
postgresql://flowbit_user:password@dpg-xxxxx-a.oregon-postgres.render.com/flowbit_db
```

#### Option B: Supabase PostgreSQL

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the connection string
5. Use it in your environment variables

### Step 3: Deploy Backend API to Render

1. **Go to Render Dashboard:**
   - https://dashboard.render.com

2. **Create New Web Service:**
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service:**
   - **Name**: `flowbit-api`
   - **Root Directory**: `apps/api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

4. **Environment Variables:**
   ```
   DATABASE_URL=postgresql://user:password@host:5432/flowbit_db?sslmode=require
   VANNA_API_BASE_URL=https://flowbit-vanna.onrender.com
   PORT=3001
   NODE_ENV=production
   ALLOWED_ORIGINS=https://flowbit.vercel.app
   ```

5. **Deploy:**
   - Click **"Create Web Service"**
   - Wait for deployment to complete
   - Note the URL: `https://flowbit-api.onrender.com`

6. **Run Database Migrations:**
   ```bash
   # In Render shell or locally with production DATABASE_URL
   cd apps/api
   npx prisma migrate deploy
   npx ts-node prisma/seed.ts
   ```

### Step 4: Deploy Vanna AI Service to Render

1. **Create New Web Service:**
   - Click **"New +"** → **"Web Service"**
   - Select the same GitHub repository

2. **Configure Service:**
   - **Name**: `flowbit-vanna`
   - **Root Directory**: `services/vanna`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free (or paid)

3. **Environment Variables:**
   ```
   DATABASE_URL=postgresql+psycopg://user:password@host:5432/flowbit_db?sslmode=require
   GROQ_API_KEY=your_groq_api_key_here
   PORT=8000
   VANNA_MAX_ROWS=200
   ```

4. **Deploy:**
   - Click **"Create Web Service"**
   - Wait for deployment
   - Note the URL: `https://flowbit-vanna.onrender.com`

### Step 5: Deploy Frontend to Vercel

1. **Go to Vercel:**
   - https://vercel.com
   - Sign in with GitHub

2. **Import Project:**
   - Click **"Add New..."** → **"Project"**
   - Import your GitHub repository
   - Select the repository

3. **Configure Project:**
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_BASE_URL=https://flowbit-api.onrender.com
   NEXT_PUBLIC_API_URL=https://flowbit-api.onrender.com
   ```

5. **Deploy:**
   - Click **"Deploy"**
   - Wait for deployment
   - Note the URL: `https://flowbit.vercel.app` (or custom domain)

### Step 6: Update CORS Settings

1. **Update Backend CORS:**
   - In Render dashboard for `flowbit-api`
   - Update `ALLOWED_ORIGINS` to include your Vercel URL
   - Redeploy if needed

2. **Verify CORS:**
   - Check browser console for CORS errors
   - Ensure API calls succeed from frontend

## ✅ Verification Checklist

### Backend API
- [ ] Health endpoint: `https://flowbit-api.onrender.com/health`
- [ ] Stats endpoint: `https://flowbit-api.onrender.com/stats`
- [ ] Invoices endpoint: `https://flowbit-api.onrender.com/invoices`
- [ ] Vendors endpoint: `https://flowbit-api.onrender.com/vendors/top10`
- [ ] Category endpoint: `https://flowbit-api.onrender.com/category-spend`
- [ ] Cash outflow endpoint: `https://flowbit-api.onrender.com/cash-outflow`
- [ ] Chat endpoint: `POST https://flowbit-api.onrender.com/chat-with-data`

### Vanna Service
- [ ] Health endpoint: `https://flowbit-vanna.onrender.com/`
- [ ] Status endpoint: `https://flowbit-vanna.onrender.com/status`
- [ ] Query endpoint: `POST https://flowbit-vanna.onrender.com/query`

### Frontend
- [ ] Homepage loads: `https://flowbit.vercel.app`
- [ ] Dashboard displays data
- [ ] Charts render correctly
- [ ] Invoice table shows data
- [ ] Chat interface works
- [ ] API calls succeed (check Network tab)
- [ ] No console errors

### Integration
- [ ] Frontend → Backend API communication works
- [ ] Backend → Vanna service communication works
- [ ] Vanna → Database queries work
- [ ] CORS configured correctly
- [ ] All HTTPS connections secure

## 🧪 Automated Verification Script

Run this script after deployment to verify all services:

```powershell
# Set your deployment URLs
$BACKEND_URL = "https://flowbit-api.onrender.com"
$VANNA_URL = "https://flowbit-vanna.onrender.com"
$FRONTEND_URL = "https://flowbit.vercel.app"

Write-Host "=== Flowbit Deployment Verification ===" -ForegroundColor Cyan

# Test Backend
Write-Host "`n[1/6] Testing Backend API..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$BACKEND_URL/stats"
    Write-Host "✅ Stats endpoint: $($stats.totalSpend)" -ForegroundColor Green
} catch {
    Write-Host "❌ Stats endpoint failed: $_" -ForegroundColor Red
}

try {
    $invoices = Invoke-RestMethod -Uri "$BACKEND_URL/invoices?page=1&per_page=5"
    Write-Host "✅ Invoices endpoint: $($invoices.invoices.Count) invoices" -ForegroundColor Green
} catch {
    Write-Host "❌ Invoices endpoint failed: $_" -ForegroundColor Red
}

# Test Vanna
Write-Host "`n[2/6] Testing Vanna Service..." -ForegroundColor Yellow
try {
    $vanna = Invoke-RestMethod -Uri "$VANNA_URL/status"
    Write-Host "✅ Vanna status: $($vanna.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Vanna status failed: $_" -ForegroundColor Red
}

# Test Chat Endpoint
Write-Host "`n[3/6] Testing Chat Endpoint..." -ForegroundColor Yellow
try {
    $chatBody = @{question="show top 5 vendors by spend"} | ConvertTo-Json
    $chat = Invoke-RestMethod -Uri "$BACKEND_URL/chat-with-data" -Method POST -Body $chatBody -ContentType "application/json"
    Write-Host "✅ Chat endpoint: SQL generated" -ForegroundColor Green
} catch {
    Write-Host "❌ Chat endpoint failed: $_" -ForegroundColor Red
}

# Test Frontend
Write-Host "`n[4/6] Testing Frontend..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri $FRONTEND_URL -UseBasicParsing
    if ($frontend.StatusCode -eq 200) {
        Write-Host "✅ Frontend loads: Status $($frontend.StatusCode)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend failed: $_" -ForegroundColor Red
}

Write-Host "`n=== Verification Complete ===" -ForegroundColor Cyan
Write-Host "Frontend: $FRONTEND_URL" -ForegroundColor White
Write-Host "Backend: $BACKEND_URL" -ForegroundColor White
Write-Host "Vanna: $VANNA_URL" -ForegroundColor White
```

## 🔧 Troubleshooting

### Database Connection Issues

**Problem:** Can't connect to database

**Solution:**
1. Verify DATABASE_URL is correct (include `?sslmode=require` for Render)
2. Check firewall rules
3. Ensure database is accessible from deployment platform
4. Test connection from Render shell

### Build Failures

**Problem:** Build fails on Render/Vercel

**Solution:**
1. Check build logs in Render/Vercel dashboard
2. Verify all dependencies are in package.json
3. Check Node.js version compatibility
4. Verify environment variables are set
5. Ensure root directory is correct

### CORS Errors

**Problem:** CORS errors in browser console

**Solution:**
1. Update `ALLOWED_ORIGINS` in backend to include Vercel URL
2. Include protocol (https://) in URLs
3. Check browser console for specific errors
4. Verify CORS middleware is configured

### Migration Issues

**Problem:** Database migrations fail

**Solution:**
1. Run migrations manually in Render shell
2. Verify DATABASE_URL is set correctly
3. Check database permissions
4. Review migration logs

## 📊 Production URLs

After deployment, you should have:
- **Frontend**: `https://flowbit.vercel.app`
- **Backend API**: `https://flowbit-api.onrender.com`
- **Vanna Service**: `https://flowbit-vanna.onrender.com`
- **Database**: Your PostgreSQL instance

## 📝 Environment Variables Reference

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_BASE_URL=https://flowbit-api.onrender.com
NEXT_PUBLIC_API_URL=https://flowbit-api.onrender.com
```

### Backend (Render)
```env
DATABASE_URL=postgresql://user:password@host:5432/flowbit_db?sslmode=require
VANNA_API_BASE_URL=https://flowbit-vanna.onrender.com
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://flowbit.vercel.app
```

### Vanna Service (Render)
```env
DATABASE_URL=postgresql+psycopg://user:password@host:5432/flowbit_db?sslmode=require
GROQ_API_KEY=your_groq_api_key
PORT=8000
VANNA_MAX_ROWS=200
```

## 🎉 Success!

Once all services are deployed and verified, your Flowbit application is live in production!

Good luck with your deployment! 🚀

