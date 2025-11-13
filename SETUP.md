# Flowbit Setup Instructions

## Quick Start

### 1. Start Docker Services

```powershell
docker compose up -d
```

Wait 5-10 seconds for PostgreSQL to be ready.

### 2. Set Environment Variables

The `.env` file should contain:

```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/flowbit_db?schema=public"
```

If the `.env` file has placeholder values, update it manually or set the environment variable:

```powershell
$env:DATABASE_URL="postgresql://postgres:admin123@localhost:5432/flowbit_db?schema=public"
```

### 3. Install Dependencies

```powershell
npm install
cd apps/api
npm install
cd ../web
npm install
cd ../..
```

### 4. Setup Database

```powershell
# Generate Prisma Client
npx prisma generate

# Create migrations
npx prisma migrate dev --name init

# Seed database
$env:DATABASE_URL="postgresql://postgres:admin123@localhost:5432/flowbit_db?schema=public"
npx ts-node prisma/seed.ts
```

### 5. Start Services

**Terminal 1 - Backend:**
```powershell
cd apps/api
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd apps/web
npm run dev
```

**Terminal 3 - Vanna Service:**
```powershell
cd services/vanna
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

### 6. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Vanna Service: http://localhost:8000
- Adminer (Database UI): http://localhost:8080

## Troubleshooting

### Database Connection Issues

If you get authentication errors:

1. Verify Docker containers are running:
   ```powershell
   docker compose ps
   ```

2. Test database connection:
   ```powershell
   docker exec flowbit_postgres psql -U postgres -c "SELECT 1;"
   ```

3. Verify database exists:
   ```powershell
   docker exec flowbit_postgres psql -U postgres -c "\l" | Select-String "flowbit_db"
   ```

### Seed Script Issues

If the seed script can't find the data file:

1. Verify data file exists:
   ```powershell
   Test-Path "data\Analytics_Test_Data.json"
   ```

2. Run seed from project root:
   ```powershell
   $env:DATABASE_URL="postgresql://postgres:admin123@localhost:5432/flowbit_db?schema=public"
   npx ts-node prisma/seed.ts
   ```

### Migration Issues

If migrations fail:

1. Reset database (WARNING: deletes all data):
   ```powershell
   $env:DATABASE_URL="postgresql://postgres:admin123@localhost:5432/flowbit_db?schema=public"
   npx prisma migrate reset --force
   ```

2. Re-run migrations:
   ```powershell
   npx prisma migrate dev --name init
   ```

## Verify Setup

### Test API Endpoints

```powershell
# Stats
curl http://localhost:3001/stats

# Invoices
curl http://localhost:3001/invoices

# Health check
curl http://localhost:3001/health
```

### Test Vanna Service

```powershell
curl http://localhost:8000/health
```

### Verify Database

1. Open Adminer: http://localhost:8080
2. Login:
   - System: PostgreSQL
   - Server: postgres
   - Username: postgres
   - Password: admin123
   - Database: flowbit_db
3. Check tables: Vendor, Customer, Invoice, LineItem, Payment

## Next Steps

1. Access dashboard at http://localhost:3000/dashboard
2. Test chat interface at http://localhost:3000/chat-with-data
3. Review API documentation in `README.md`
4. See deployment instructions in `DEPLOYMENT.md`

