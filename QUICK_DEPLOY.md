# Flowbit Quick Deployment Guide

## 🚀 One-Click Deployment Steps

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Flowbit production ready"
git remote add origin https://github.com/<your-username>/flowbit-assignment.git
git push -u origin main
```

### Step 2: Deploy Database (Render)

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Name: `flowbit-db`
4. Click **"Create Database"**
5. Copy the **Internal Database URL**

### Step 3: Deploy Backend (Render)

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repo
4. Configure:
   - **Name**: `flowbit-api`
   - **Root Directory**: `apps/api`
   - **Build**: `npm install && npx prisma generate && npm run build`
   - **Start**: `npm start`
5. Add environment variables (see PRODUCTION_ENV_TEMPLATE.md)
6. Deploy

### Step 4: Deploy Vanna (Render)

1. Same repo, new service
2. Configure:
   - **Name**: `flowbit-vanna`
   - **Root Directory**: `services/vanna`
   - **Build**: `pip install -r requirements.txt`
   - **Start**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
3. Add environment variables
4. Deploy

### Step 5: Deploy Frontend (Vercel)

1. Go to https://vercel.com
2. Import GitHub repo
3. Configure:
   - **Root Directory**: `apps/web`
   - **Framework**: Next.js
4. Add environment variables
5. Deploy

### Step 6: Run Migrations

```bash
# In Render shell for flowbit-api
cd apps/api
npx prisma migrate deploy
npx ts-node prisma/seed.ts
```

### Step 7: Verify

Run the verification script:

```powershell
.\verify-deployment.ps1
```

Or manually test:
- Frontend: https://flowbit.vercel.app
- Backend: https://flowbit-api.onrender.com/health
- Vanna: https://flowbit-vanna.onrender.com/status

## ✅ Done!

Your Flowbit app is now live in production! 🎉

