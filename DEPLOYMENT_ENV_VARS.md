# Deployment Environment Variables Guide

This document lists all required environment variables for deploying the Flowbit project.

## Backend API (Vercel Serverless)

Deploy the `apps/api` directory to Vercel as a serverless function.

### Required Environment Variables:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
# PostgreSQL connection string from your database provider (e.g., Supabase, Neon, Railway)

VANNA_API_BASE_URL=https://your-vanna-service.onrender.com
# URL of the deployed Vanna service on Render

VANNA_API_KEY=your-optional-api-key
# Optional: API key for Vanna service authentication

ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
# Comma-separated list of allowed CORS origins

PORT=3001
# Optional: Port number (Vercel sets this automatically)
```

### Vercel Deployment Steps:

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to `apps/api`: `cd apps/api`
3. Run `vercel` and follow prompts
4. Set environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables listed above
5. Deploy: `vercel --prod`

---

## Frontend Web (Vercel)

Deploy the `apps/web` directory to Vercel.

### Required Environment Variables:

```bash
NEXT_PUBLIC_API_URL=https://your-api.vercel.app
# URL of the deployed backend API

NEXT_PUBLIC_API_BASE=https://your-api.vercel.app
# Alternative name (both work)
```

### Vercel Deployment Steps:

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to `apps/web`: `cd apps/web`
3. Run `vercel` and follow prompts
4. Set environment variables in Vercel dashboard
5. Deploy: `vercel --prod`

---

## Vanna AI Service (Render)

Deploy the `services/vanna` directory to Render as a Web Service.

### Required Environment Variables:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
# Same PostgreSQL connection string as backend API

GROQ_API_KEY=your-groq-api-key
# Get from https://console.groq.com/

VANNA_API_KEY=your-optional-api-key
# Optional: API key for service authentication

PORT=8000
# Render sets this automatically, but you can specify
```

### Render Deployment Steps:

1. Go to https://render.com and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `flowbit-vanna`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `services/vanna`
5. Add environment variables in Render dashboard
6. Deploy

### Alternative: Using render.yaml

The `services/vanna/render.yaml` file is already configured. You can:
1. Push your code to GitHub
2. In Render, select "New from Render Blueprint"
3. Connect your repository
4. Render will auto-detect `render.yaml` and configure the service

---

## Database Setup

### Option 1: Supabase (Recommended for Free Tier)

1. Go to https://supabase.com
2. Create a new project
3. Copy the connection string from Settings → Database
4. Use this `DATABASE_URL` in both backend API and Vanna service

### Option 2: Neon (Serverless Postgres)

1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string
4. Use this `DATABASE_URL` in both backend API and Vanna service

### Option 3: Railway

1. Go to https://railway.app
2. Create a new PostgreSQL database
3. Copy the connection string
4. Use this `DATABASE_URL` in both backend API and Vanna service

### After Database Setup:

1. Run Prisma migrations:
   ```bash
   cd apps/api
   npx prisma db push
   ```

2. Seed the database:
   ```bash
   npm run prisma:seed
   ```

---

## Quick Deployment Checklist

- [ ] Database created and `DATABASE_URL` obtained
- [ ] Groq API key obtained from https://console.groq.com/
- [ ] Backend API deployed to Vercel with all env vars
- [ ] Vanna service deployed to Render with all env vars
- [ ] Frontend deployed to Vercel with `NEXT_PUBLIC_API_URL` set
- [ ] Database seeded with test data
- [ ] All services health-checked and working

---

## Testing Deployed Services

### Backend API Health Check:
```bash
curl https://your-api.vercel.app/health
```

### Vanna Service Health Check:
```bash
curl https://your-vanna-service.onrender.com/health
```

### Frontend:
Visit `https://your-frontend.vercel.app` in your browser

---

## Troubleshooting

### Backend API Issues:
- Check Vercel function logs in dashboard
- Verify `DATABASE_URL` is correct
- Ensure Prisma client is generated: `npx prisma generate`

### Vanna Service Issues:
- Check Render service logs
- Verify `GROQ_API_KEY` is valid
- Test locally: `python -m uvicorn src.main:app --reload`

### Frontend Issues:
- Check browser console for API errors
- Verify `NEXT_PUBLIC_API_URL` points to correct backend
- Check Vercel build logs for compilation errors







