# Flowbit Final Setup Instructions

## ✅ Current Status

### Completed:
1. ✅ Docker containers running (PostgreSQL + Adminer)
2. ✅ Prisma schema migrated (tables created)
3. ✅ Environment files created
4. ✅ Backend API code ready
5. ✅ Frontend code ready
6. ✅ Vanna service code ready

### Remaining:
1. ⚠️ Seed database (data file path needs verification)
2. ⚠️ Start services and test

## 🚀 Quick Setup Commands

### 1. Verify Database is Running

```powershell
docker ps
# Should show flowbit_postgres and flowbit_adminer
```

### 2. Verify Environment Files

```powershell
# Check API env file
Get-Content apps\api\.env

# Check Web env file
Get-Content apps\web\.env.local
```

### 3. Seed Database

**First, verify data file exists:**
```powershell
Test-Path "data\Analytics_Test_Data.json"
```

**If file exists, run seed:**
```powershell
cd apps\api
npx ts-node prisma/seed.ts
```

**If file doesn't exist, you need to:**
1. Create `data` directory in project root
2. Place `Analytics_Test_Data.json` in that directory
3. Or update seed script to point to correct location

### 4. Start Backend API

```powershell
cd apps\api
npm run dev
```

**Verify:** http://localhost:3001/health

### 5. Start Vanna Service

```powershell
cd services\vanna

# Create venv if not exists
python -m venv .venv

# Activate (Windows)
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start service
uvicorn app:app --reload --port 8000
```

**Verify:** http://localhost:8000/health

### 6. Start Frontend

```powershell
cd apps\web
npm install
npm run dev
```

**Verify:** http://localhost:3000

## 🔍 Verification Steps

### Check Database Tables

```powershell
docker exec flowbit_postgres psql -U postgres -d flowbit_db -c "\dt"
```

### Check Data Seeded

```powershell
docker exec flowbit_postgres psql -U postgres -d flowbit_db -c 'SELECT COUNT(*) FROM "Vendor";'
docker exec flowbit_postgres psql -U postgres -d flowbit_db -c 'SELECT COUNT(*) FROM "Invoice";'
```

### Test API Endpoints

```powershell
# Health check
curl http://localhost:3001/health

# Stats
curl http://localhost:3001/stats

# Invoices
curl http://localhost:3001/invoices
```

### Test Vanna Service

```powershell
# Health check
curl http://localhost:8000/health

# Query
curl -X POST http://localhost:8000/query -H "Content-Type: application/json" -d '{"query": "top 5 vendors"}'
```

## 🐛 Troubleshooting

### Issue: Data file not found

**Solution:**
1. Check if `data/Analytics_Test_Data.json` exists
2. If not, create the file or update seed script path
3. Run seed from project root: `npx ts-node prisma/seed.ts`

### Issue: Database connection fails

**Solution:**
1. Verify Docker container is running: `docker ps`
2. Check DATABASE_URL in `apps/api/.env`
3. Test connection: `docker exec flowbit_postgres psql -U postgres -c "SELECT 1;"`

### Issue: Port already in use

**Solution:**
```powershell
# Find process using port
netstat -ano | findstr :3001

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Issue: Prisma migrate fails

**Solution:**
1. Check DATABASE_URL is correct
2. Verify database is accessible
3. Try: `npx prisma migrate deploy` instead of `migrate dev`

## 📝 Next Steps

1. **Verify data file location** and seed database
2. **Start all services** (backend, frontend, vanna)
3. **Test endpoints** using curl or Postman
4. **Check frontend** displays data correctly
5. **Test chat interface** with sample queries

## 🎯 Expected Results

After setup:
- ✅ Database has Vendor, Customer, Invoice, LineItem, Payment tables
- ✅ Data is seeded (vendors, customers, invoices)
- ✅ Backend API responds on port 3001
- ✅ Vanna service responds on port 8000
- ✅ Frontend loads on port 3000
- ✅ Dashboard shows stats and charts
- ✅ Chat interface works with Vanna

## 📚 Documentation

- [README.md](./README.md) - Full documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [QUICK_START.md](./QUICK_START.md) - Quick start guide

## 💡 Tips

- Use Adminer to inspect database: http://localhost:8080
- Check logs in terminal for errors
- Use browser DevTools for frontend debugging
- Test API with Postman or curl

