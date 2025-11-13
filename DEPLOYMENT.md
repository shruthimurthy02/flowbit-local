# Flowbit Deployment Guide

## 🚀 Production Deployment

This guide covers deploying Flowbit to Vercel (Frontend), Render (Backend + Vanna), and setting up PostgreSQL.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Render account (free tier works)
- PostgreSQL database (Render, Neon, or Supabase)

## 📋 Deployment Steps

### Step 1: Prepare Repository

1. **Initialize Git (if not already):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Flowbit production ready"
   ```

2. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/<your-username>/flowbit-assignment.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Set Up PostgreSQL Database

#### Option A: Render PostgreSQL (Recommended)

1. Go to https://render.com
2. Click "New +" → "PostgreSQL"
3. Configure:
   - Name: `flowbit-db`
   - Database: `flowbit_db`
   - User: `flowbit_user` (or use default)
   - Region: Choose closest to you
4. Click "Create Database"
5. Copy the **Internal Database URL** (for Render services)
6. Copy the **External Database URL** (for local development)

#### Option B: Neon PostgreSQL

1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string
4. Use it in your environment variables

### Step 3: Deploy Backend API (Render)

1. **Go to Render Dashboard:**
   - https://render.com/dashboard

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service:**
   - **Name:** `flowbit-api`
   - **Root Directory:** `apps/api`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (or paid for better performance)

4. **Environment Variables:**
   ```
   DATABASE_URL=postgresql://user:password@host:5432/flowbit_db?schema=public
   VANNA_API_BASE_URL=https://flowbit-vanna.onrender.com
   VANNA_API_KEY=
   PORT=3001
   NODE_ENV=production
   ALLOWED_ORIGINS=https://flowbit.vercel.app
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the URL: `https://flowbit-api.onrender.com`

6. **Run Database Migrations:**
   ```bash
   # In Render shell or locally with production DATABASE_URL
   cd apps/api
   npx prisma migrate deploy
   npx ts-node prisma/seed.ts
   ```

### Step 4: Deploy Vanna AI Service (Render)

1. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Select the same GitHub repository

2. **Configure Service:**
   - **Name:** `flowbit-vanna`
   - **Root Directory:** `services/vanna`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free (or paid)

3. **Environment Variables:**
   ```
   DATABASE_URL=postgresql+psycopg://user:password@host:5432/flowbit_db
   GROQ_API_KEY=your_groq_api_key_here
   PORT=8000
   VANNA_MAX_ROWS=200
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment
   - Note the URL: `https://flowbit-vanna.onrender.com`

### Step 5: Deploy Frontend (Vercel)

1. **Go to Vercel:**
   - https://vercel.com
   - Sign in with GitHub

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Project:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

4. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_BASE=https://flowbit-api.onrender.com
   NEXT_PUBLIC_API_URL=https://flowbit-api.onrender.com
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment
   - Note the URL: `https://flowbit.vercel.app` (or custom domain)

### Step 6: Update CORS Settings

1. **Update Backend CORS:**
   - In Render dashboard for `flowbit-api`
   - Update `ALLOWED_ORIGINS` to include your Vercel URL
   - Redeploy if needed

2. **Update Vanna CORS:**
   - Vanna service already allows all origins (update for production security)

### Step 7: Verify Deployment

1. **Test Frontend:**
   - Visit https://flowbit.vercel.app
   - Check browser console for errors
   - Verify API calls go to Render backend

2. **Test Backend:**
   - Visit https://flowbit-api.onrender.com/health
   - Should return: `{"status":"ok"}`

3. **Test Vanna:**
   - Visit https://flowbit-vanna.onrender.com/health
   - Should return: `{"status":"ok"}`

4. **Test Endpoints:**
   - https://flowbit-api.onrender.com/stats
   - https://flowbit-api.onrender.com/invoices
   - https://flowbit-api.onrender.com/vendors/top10

## 🔒 Security Checklist

- [ ] Use strong database passwords
- [ ] Enable HTTPS everywhere
- [ ] Set up CORS properly (specific origins, not *)
- [ ] Use environment variables for secrets
- [ ] Enable database backups
- [ ] Set up rate limiting
- [ ] Enable authentication (if needed)
- [ ] Regular security updates

## 📊 Monitoring

### Recommended Tools

- **Vercel Analytics** (Frontend)
- **Render Metrics** (Backend/Vanna)
- **Sentry** (Error tracking)
- **PostgreSQL Monitoring** (Database)

## 🐛 Troubleshooting

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check firewall rules
- Ensure database is accessible from deployment platform
- Test connection from Render shell

### CORS Errors

- Update `ALLOWED_ORIGINS` in backend
- Include protocol (https://) in URLs
- Check browser console for specific errors

### Build Failures

- Check build logs in Vercel/Render
- Verify all dependencies are in package.json
- Check Node.js version compatibility
- Verify environment variables are set

### Migration Issues

- Run migrations manually in Render shell
- Verify DATABASE_URL is set correctly
- Check database permissions
- Review migration logs

## 📝 Environment Variables Reference

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_BASE=https://flowbit-api.onrender.com
NEXT_PUBLIC_API_URL=https://flowbit-api.onrender.com
```

### Backend (Render)
```env
DATABASE_URL=postgresql://user:password@host:5432/flowbit_db?schema=public
VANNA_API_BASE_URL=https://flowbit-vanna.onrender.com
VANNA_API_KEY=
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://flowbit.vercel.app
```

### Vanna Service (Render)
```env
DATABASE_URL=postgresql+psycopg://user:password@host:5432/flowbit_db
GROQ_API_KEY=your_groq_api_key
PORT=8000
VANNA_MAX_ROWS=200
```

## 🎯 Production URLs

After deployment, you should have:
- **Frontend:** https://flowbit.vercel.app
- **Backend API:** https://flowbit-api.onrender.com
- **Vanna Service:** https://flowbit-vanna.onrender.com
- **Database:** Your PostgreSQL instance

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## 🎉 Success!

Once all services are deployed and verified, your Flowbit application is live in production!

Good luck with your deployment! 🚀
