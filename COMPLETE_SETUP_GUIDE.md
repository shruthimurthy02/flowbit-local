# Flowbit Complete Setup Guide

## 🎯 Overview

This guide covers the complete setup of Flowbit, from local development to production deployment.

## 📋 Table of Contents

1. [Move Project Outside OneDrive](#step-1-move-project-outside-onedrive)
2. [Local Development Setup](#step-2-local-development-setup)
3. [Database Setup](#step-3-database-setup)
4. [Running Services](#step-4-running-services)
5. [Production Deployment](#step-5-production-deployment)
6. [Verification](#step-6-verification)

---

## Step 1: Move Project Outside OneDrive

### Why?
OneDrive file locking causes Prisma EPERM errors when generating the Prisma Client. Moving the project outside OneDrive resolves this.

### How to Move

**Option A: Use the Script (Recommended)**
```powershell
# Run from current project location
.\move-project-outside-onedrive.ps1
```

**Option B: Manual Move**
```powershell
# Create target directory
mkdir C:\Users\shrut\flowbit-local

# Copy project (exclude large folders)
robocopy "C:\Users\shrut\OneDrive\Desktop\flowbit-intern-assignment" "C:\Users\shrut\flowbit-local" /E /XD node_modules .next .venv __pycache__ .prisma dist build

# Open in VS Code
code C:\Users\shrut\flowbit-local
```

### After Moving

1. **Close all terminals and VS Code instances**
2. **Open the new location in VS Code:**
   ```powershell
   code C:\Users\shrut\flowbit-local
   ```
3. **Verify Docker is still running:**
   ```powershell
   docker ps
   ```

---

## Step 2: Local Development Setup

### 2.1 Install Dependencies

```powershell
# Root dependencies
cd C:\Users\shrut\flowbit-local
npm install

# Backend dependencies
cd apps\api
npm install

# Frontend dependencies
cd ..\web
npm install
```

### 2.2 Setup Environment Files

**Create `apps/api/.env`:**
```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/flowbit_db?schema=public"
VANNA_API_BASE_URL=http://localhost:8000
VANNA_API_KEY=
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

**Create `apps/web/.env.local`:**
```env
NEXT_PUBLIC_API_BASE=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Step 3: Database Setup

### 3.1 Start Docker Services

```powershell
# Start PostgreSQL and Adminer
docker compose up -d

# Verify containers are running
docker ps
```

**Expected output:**
```
CONTAINER ID   IMAGE                STATUS
...            postgres:15-alpine   Up
...            adminer:latest       Up
```

### 3.2 Generate Prisma Client

```powershell
cd apps\api
npx prisma generate
```

**Expected output:**
```
✔ Generated Prisma Client (v6.19.0)
```

### 3.3 Apply Migrations

```powershell
npx prisma migrate deploy
```

**If no migrations exist:**
```powershell
npx prisma migrate dev --name init
```

### 3.4 Seed Database

```powershell
npx ts-node prisma/seed.ts
```

**Expected output:**
```
✅ Found data file: C:\...\data\Analytics_Test_Data.json
🌱 Starting database seed...
📦 Seeding vendors...
✅ Seeded 3 vendors
👥 Seeding customers...
✅ Seeded 3 customers
📄 Seeding invoices...
✅ Seeded 5 invoices
✅ Seeded 7 line items
✅ Seeded 3 payments
🎉 Database seed completed successfully!
```

### 3.5 Verify Database

**Using Adminer:**
1. Open http://localhost:8080
2. Login:
   - System: PostgreSQL
   - Server: flowbit_postgres (or localhost)
   - Username: postgres
   - Password: admin123
   - Database: flowbit_db
3. Check tables: Vendor, Customer, Invoice, LineItem, Payment

**Using Command Line:**
```powershell
docker exec flowbit_postgres psql -U postgres -d flowbit_db -c "SELECT COUNT(*) FROM \"Vendor\";"
```

---

## Step 4: Running Services

### 4.1 Start Backend API

**Terminal 1:**
```powershell
cd C:\Users\shrut\flowbit-local\apps\api
npm run dev
```

**Expected output:**
```
✅ API running at http://localhost:3001
```

**Verify:**
```powershell
curl http://localhost:3001/health
curl http://localhost:3001/stats
```

### 4.2 Start Vanna AI Service

**Terminal 2:**
```powershell
cd C:\Users\shrut\flowbit-local\services\vanna

# Create virtual environment if not exists
python -m venv .venv

# Activate (Windows)
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start service
uvicorn app:app --reload --port 8000
```

**Expected output:**
```
Uvicorn running on http://127.0.0.1:8000
```

**Verify:**
- Visit http://localhost:8000/docs (Swagger UI)
- Visit http://localhost:8000/health

### 4.3 Start Frontend

**Terminal 3:**
```powershell
cd C:\Users\shrut\flowbit-local\apps\web
npm run dev
```

**Expected output:**
```
Ready on http://localhost:3000
```

**Verify:**
- Visit http://localhost:3000
- Dashboard should load with data
- Charts should render

---

## Step 5: Production Deployment

### 5.1 Prepare Repository

```powershell
# Initialize Git (if not already)
git init
git add .
git commit -m "Flowbit production ready"

# Push to GitHub
git remote add origin https://github.com/<your-username>/flowbit-assignment.git
git branch -M main
git push -u origin main
```

### 5.2 Deploy PostgreSQL Database

**Option A: Render PostgreSQL**
1. Go to https://render.com
2. Click "New +" → "PostgreSQL"
3. Configure and create
4. Copy connection string

**Option B: Neon PostgreSQL**
1. Go to https://neon.tech
2. Create project
3. Copy connection string

### 5.3 Deploy Backend API (Render)

1. **Create Web Service:**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect GitHub repository

2. **Configure:**
   - Name: `flowbit-api`
   - Root Directory: `apps/api`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Environment Variables:**
   ```
   DATABASE_URL=<your-postgres-connection-string>
   VANNA_API_BASE_URL=https://flowbit-vanna.onrender.com
   PORT=3001
   NODE_ENV=production
   ALLOWED_ORIGINS=https://flowbit.vercel.app
   ```

4. **Deploy and Note URL:** `https://flowbit-api.onrender.com`

### 5.4 Deploy Vanna Service (Render)

1. **Create Web Service:**
   - Same repository
   - Root Directory: `services/vanna`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

2. **Environment Variables:**
   ```
   DATABASE_URL=<your-postgres-connection-string>
   GROQ_API_KEY=<your-groq-key>
   PORT=8000
   ```

3. **Deploy and Note URL:** `https://flowbit-vanna.onrender.com`

### 5.5 Deploy Frontend (Vercel)

1. **Go to Vercel:**
   - https://vercel.com
   - Sign in with GitHub

2. **Import Project:**
   - Add New → Project
   - Select repository
   - Framework: Next.js
   - Root Directory: `apps/web`

3. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_BASE=https://flowbit-api.onrender.com
   NEXT_PUBLIC_API_URL=https://flowbit-api.onrender.com
   ```

4. **Deploy and Note URL:** `https://flowbit.vercel.app`

### 5.6 Run Database Migrations in Production

```powershell
# Set production DATABASE_URL
$env:DATABASE_URL="<your-production-database-url>"

# Run migrations
cd apps\api
npx prisma migrate deploy

# Seed database (optional)
npx ts-node prisma/seed.ts
```

---

## Step 6: Verification

### Local Verification

- [ ] Backend API: http://localhost:3001/health
- [ ] Vanna Service: http://localhost:8000/health
- [ ] Frontend: http://localhost:3000
- [ ] Dashboard displays data
- [ ] Charts render correctly
- [ ] Chat interface works

### Production Verification

- [ ] Frontend: https://flowbit.vercel.app
- [ ] Backend: https://flowbit-api.onrender.com/health
- [ ] Vanna: https://flowbit-vanna.onrender.com/health
- [ ] API endpoints return data
- [ ] CORS configured correctly
- [ ] Database connected

---

## 🐛 Troubleshooting

### Prisma EPERM Error

**Solution:**
1. Move project outside OneDrive (see Step 1)
2. Close all IDEs and terminals
3. Delete `.prisma` folders
4. Regenerate: `npx prisma generate`

### Database Connection Issues

**Solution:**
1. Verify Docker is running: `docker ps`
2. Check DATABASE_URL in `.env`
3. Test connection: `docker exec flowbit_postgres psql -U postgres -c "SELECT 1;"`

### Build Failures

**Solution:**
1. Check build logs
2. Verify all dependencies installed
3. Check Node.js version (18+)
4. Verify environment variables

### CORS Errors

**Solution:**
1. Update `ALLOWED_ORIGINS` in backend
2. Include protocol (https://) in URLs
3. Check browser console for errors

---

## 📚 Additional Resources

- [README.md](./README.md) - Project overview
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [SETUP_SUCCESS.md](./SETUP_SUCCESS.md) - Setup status

---

## ✅ Final Checklist

### Local Development
- [ ] Project moved outside OneDrive
- [ ] Dependencies installed
- [ ] Database seeded
- [ ] All services running
- [ ] Frontend displays data

### Production Deployment
- [ ] Code pushed to GitHub
- [ ] Database deployed
- [ ] Backend deployed
- [ ] Vanna service deployed
- [ ] Frontend deployed
- [ ] All services verified

---

## 🎉 Success!

Once all steps are complete, your Flowbit application is fully set up and deployed!

Good luck! 🚀
