# Flowbit Complete Setup Script
# Run this script from the project root directory

$ErrorActionPreference = "Stop"

Write-Host "=== Flowbit Setup Script ===" -ForegroundColor Cyan
Write-Host "Working directory: $(Get-Location)" -ForegroundColor Gray

# Step 1: Verify Docker is running
Write-Host "`n[1/8] Checking Docker..." -ForegroundColor Yellow
docker ps | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "Docker is running" -ForegroundColor Green

# Step 2: Start Docker Compose
Write-Host "`n[2/8] Starting Docker Compose..." -ForegroundColor Yellow
docker compose up -d
Start-Sleep -Seconds 5
Write-Host "Docker Compose started" -ForegroundColor Green

# Step 3: Verify data file exists
Write-Host "`n[3/8] Checking data file..." -ForegroundColor Yellow
if (-not (Test-Path "data\Analytics_Test_Data.json")) {
    Write-Host "ERROR: data\Analytics_Test_Data.json not found!" -ForegroundColor Red
    exit 1
}
Write-Host "Data file found" -ForegroundColor Green

# Step 4: Set DATABASE_URL environment variable
$env:DATABASE_URL = "postgresql://postgres:admin123@localhost:5432/flowbit_db?schema=public"
Write-Host "`n[4/8] DATABASE_URL set" -ForegroundColor Green

# Step 5: Install dependencies
Write-Host "`n[5/8] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install root dependencies" -ForegroundColor Red
    exit 1
}

Push-Location apps\api
npm install
Pop-Location

Push-Location apps\web
npm install
Pop-Location

Write-Host "Dependencies installed" -ForegroundColor Green

# Step 6: Setup Prisma
Write-Host "`n[6/8] Setting up Prisma..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

# Wait a bit more for database to be fully ready
Start-Sleep -Seconds 3

# Create migration
Write-Host "Creating database migration..." -ForegroundColor Gray
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "Trying migrate dev..." -ForegroundColor Gray
    npx prisma migrate dev --name init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Migration failed. Please check database connection." -ForegroundColor Red
        exit 1
    }
}
Write-Host "Prisma setup complete" -ForegroundColor Green

# Step 7: Seed database
Write-Host "`n[7/8] Seeding database..." -ForegroundColor Yellow
npx ts-node prisma/seed.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "Seed failed. Check error messages above." -ForegroundColor Red
    exit 1
}
Write-Host "Database seeded" -ForegroundColor Green

# Step 8: Setup Vanna service
Write-Host "`n[8/8] Setting up Vanna service..." -ForegroundColor Yellow
Push-Location services\vanna
if (-not (Test-Path ".venv")) {
    python -m venv .venv
}
if (Test-Path ".venv\Scripts\pip.exe") {
    & ".venv\Scripts\pip.exe" install -r requirements.txt -q
    Write-Host "Vanna dependencies installed" -ForegroundColor Green
} else {
    Write-Host "Python venv not set up. Please install manually." -ForegroundColor Yellow
}
Pop-Location

Write-Host "`n=== Setup Complete! ===" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Backend:   cd apps/api && npm run dev"
Write-Host "2. Frontend:  cd apps/web && npm run dev"
Write-Host "3. Vanna:     cd services/vanna && .venv\Scripts\Activate.ps1 && uvicorn app:app --reload --port 8000"
Write-Host "`nAccess:" -ForegroundColor Cyan
Write-Host "  Dashboard: http://localhost:3000/dashboard"
Write-Host "  API:       http://localhost:3001"
Write-Host "  Adminer:   http://localhost:8080"
