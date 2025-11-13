# Setup Options

## Option 1: Docker Compose (Recommended) ✅

**Best for**: Most users, easiest setup, no local PostgreSQL installation needed

### Advantages
- ✅ No need to install PostgreSQL locally
- ✅ No need to modify system files (pg_hba.conf)
- ✅ Isolated environment
- ✅ Easy to reset/cleanup
- ✅ Works on Windows, Mac, Linux

### Setup
```powershell
# Run automated setup
.\setup-windows.ps1

# Or manual setup
docker compose up -d
npm install
cd apps/api && npx prisma generate && npx prisma migrate dev
npx ts-node ..\..\prisma\seed.ts
```

### Database Credentials
- Host: localhost
- Port: 5432
- User: flowbit_user
- Password: flowbit_pass
- Database: flowbit_db

---

## Option 2: Local PostgreSQL Installation

**Best for**: Users who already have PostgreSQL installed and prefer local setup

### Advantages
- ✅ Uses existing PostgreSQL installation
- ✅ No Docker required
- ✅ Direct database access

### Disadvantages
- ⚠️ Requires Administrator privileges
- ⚠️ Modifies PostgreSQL configuration files
- ⚠️ More complex setup
- ⚠️ Requires PostgreSQL installation

### Setup
```powershell
# Run setup script (requires Admin)
.\setup-local-postgres.ps1
```

### Database Credentials (after setup)
- Host: localhost
- Port: 5432
- User: postgres
- Password: admin123
- Database: flowbit_db

---

## Comparison

| Feature | Docker Compose | Local PostgreSQL |
|---------|---------------|------------------|
| Setup Complexity | ⭐ Easy | ⭐⭐⭐ Complex |
| Admin Required | ❌ No | ✅ Yes |
| System Modifications | ❌ No | ✅ Yes |
| Isolation | ✅ Yes | ❌ No |
| Reset/Cleanup | ✅ Easy | ⚠️ Manual |
| Performance | ✅ Good | ✅ Good |

## Recommendation

**Use Docker Compose** unless you have a specific reason to use local PostgreSQL.

---

## Quick Start

### Docker Compose (Recommended)
```powershell
.\setup-windows.ps1
.\start-services.ps1
```

### Local PostgreSQL
```powershell
# Run as Administrator
.\setup-local-postgres.ps1
.\start-services.ps1
```

---

For more details, see [README.md](./README.md) or [QUICK_START.md](./QUICK_START.md)

