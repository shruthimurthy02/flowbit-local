# Flowbit Final Setup Instructions

## ✅ Issues Fixed

### 1. Prisma EPERM Error
- **Status:** ✅ RESOLVED
- **Solution:** Generated Prisma Client with `engine=none` mode (avoids file locking)
- **Note:** This works around OneDrive file locking issues

### 2. Schema Synchronization
- **Status:** ✅ FIXED
- **Issue:** Two different schema files existed
- **Solution:** Updated `apps/api/prisma/schema.prisma` to match requirements (auto-increment Int IDs)
- **Result:** Schema now matches backend code

### 3. Database Setup
- **Status:** ✅ READY
- **Tables:** Created successfully
- **Migrations:** Applied

## 🚀 Complete Setup Steps

### Step 1: Ensure Docker is Running

```powershell
# Check Docker containers
docker ps

# If not running, start them
docker start flowbit_postgres flowbit_adminer

# Wait a few seconds for PostgreSQL to be ready
Start-Sleep -Seconds 5
```

### Step 2: Verify Database Connection

```powershell
# Test connection
docker exec flowbit_postgres psql -U postgres -d flowbit_db -c "SELECT 1;"

# Check tables
docker exec flowbit_postgres psql -U postgres -d flowbit_db -c "\dt"
```

### Step 3: Seed Database

```powershell
# Navigate to apps/api
cd apps\api

# Run seed script
npx ts-node prisma/seed.ts
```

**Expected Output:**
```
✅ Found data file: C:\...\data\Analytics_Test_Data.json
🌱 Starting database seed...
🧹 Clearing existing data...
📦 Seeding vendors...
✅ Seeded 3 vendors
👥 Seeding customers...
✅ Seeded 3 customers
📄 Seeding invoices...
✅ Seeded 5 invoices
✅ Seeded X line items
✅ Seeded X payments
🎉 Database seed completed successfully!
```

### Step 4: Verify Data

```powershell
# Check data was seeded
docker exec flowbit_postgres psql -U postgres -d flowbit_db -c 'SELECT COUNT(*) FROM vendors;'
docker exec flowbit_postgres psql -U postgres -d flowbit_db -c 'SELECT COUNT(*) FROM invoices;'
```

### Step 5: Start Backend API

```powershell
# In apps/api directory
npm run dev
```

**Expected Output:**
```
✅ API running at http://localhost:3001
```

### Step 6: Test API Endpoints

```powershell
# Health check
curl http://localhost:3001/health

# Stats (should return data)
curl http://localhost:3001/stats

# Invoices
curl http://localhost:3001/invoices

# Top Vendors
curl http://localhost:3001/vendors/top10

# Category Spend
curl http://localhost:3001/category-spend

# Cash Outflow
curl http://localhost:3001/cash-outflow
```

### Step 7: Start Vanna Service

```powershell
# Navigate to services/vanna
cd services\vanna

# Activate virtual environment
.venv\Scripts\Activate.ps1

# Start service
uvicorn app:app --reload --port 8000
```

### Step 8: Start Frontend

```powershell
# Navigate to apps/web
cd apps\web

# Start dev server
npm run dev
```

### Step 9: Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Vanna Service:** http://localhost:8000
- **Adminer:** http://localhost:8080

## 🐛 Troubleshooting

### Database Connection Issues

**Problem:** Can't connect to database

**Solution:**
1. Verify Docker container is running: `docker ps`
2. Check DATABASE_URL in `apps/api/.env`
3. Test connection: `docker exec flowbit_postgres psql -U postgres -c "SELECT 1;"`

### Prisma EPERM Error

**Problem:** EPERM error when generating Prisma Client

**Solution:**
1. Stop all Node processes
2. Close IDEs/editors
3. Delete `.prisma` folders
4. Generate with `engine=none`: `npx prisma generate`
5. If issue persists, move project outside OneDrive

### Seed Script Issues

**Problem:** Seed script can't find data file

**Solution:**
1. Verify file exists: `Test-Path "data\Analytics_Test_Data.json"`
2. Run seed from `apps/api` directory
3. Check file path in seed script output

### Schema Mismatch

**Problem:** Type errors in seed script

**Solution:**
1. Ensure `apps/api/prisma/schema.prisma` matches requirements
2. Regenerate Prisma Client: `npx prisma generate`
3. Check schema uses auto-increment Int IDs

## ✅ Verification Checklist

- [ ] Docker containers running
- [ ] Database tables created
- [ ] Prisma Client generated
- [ ] Database seeded with data
- [ ] Backend API running
- [ ] API endpoints return data
- [ ] Vanna service running
- [ ] Frontend running
- [ ] Dashboard displays data

## 🎯 Success Criteria

Setup is complete when:
1. ✅ Database is seeded with data
2. ✅ Backend API returns data (not empty)
3. ✅ All endpoints work correctly
4. ✅ Frontend displays charts and data
5. ✅ Chat interface works

## 📝 Quick Reference

### Service URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Vanna: http://localhost:8000
- Adminer: http://localhost:8080

### Database Credentials
- Host: localhost
- Port: 5432
- User: postgres
- Password: admin123
- Database: flowbit_db

### Key Files
- Schema: `apps/api/prisma/schema.prisma`
- Seed: `apps/api/prisma/seed.ts`
- Backend: `apps/api/src/index.ts`
- Data: `data/Analytics_Test_Data.json`

## 🚀 Next Steps

After setup is complete:
1. Test all API endpoints
2. Verify frontend displays data
3. Test chat interface
4. Prepare for deployment
5. Deploy to production

Good luck! 🎉

