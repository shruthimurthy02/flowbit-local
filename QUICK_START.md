# Flowbit Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Move Project (Fix EPERM)

```powershell
# Run the move script
.\move-project-outside-onedrive.ps1

# Or manually:
mkdir C:\Users\shrut\flowbit-local
robocopy "C:\Users\shrut\OneDrive\Desktop\flowbit-intern-assignment" "C:\Users\shrut\flowbit-local" /E /XD node_modules .next .venv
code C:\Users\shrut\flowbit-local
```

### Step 2: Quick Setup

```powershell
# Run automated setup
cd C:\Users\shrut\flowbit-local
.\setup-local.ps1
```

### Step 3: Start Services

**Terminal 1 - Backend:**
```powershell
cd apps\api
npm run dev
```

**Terminal 2 - Vanna:**
```powershell
cd services\vanna
.venv\Scripts\Activate.ps1
uvicorn app:app --reload --port 8000
```

**Terminal 3 - Frontend:**
```powershell
cd apps\web
npm run dev
```

### Step 4: Access

- **Dashboard:** http://localhost:3000
- **API:** http://localhost:3001
- **Vanna:** http://localhost:8000
- **Adminer:** http://localhost:8080

## ✅ That's It!

Your Flowbit application is now running locally!

For detailed setup, see [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)

For deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md)
