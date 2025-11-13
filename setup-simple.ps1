# Simple Flowbit Setup Script (Uses Docker Compose)
$ErrorActionPreference = "Stop"

Write-Host "=== Flowbit Simple Setup (Docker) ===" -ForegroundColor Cyan

# Step 1: Verify Docker
Write-Host "`n[1/7] Checking Docker..." -ForegroundColor Yellow
docker ps | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "Docker is running" -ForegroundColor Green

# Step 2: Start Docker Compose
Write-Host "`n[2/7] Starting Docker Compose..." -ForegroundColor Yellow
docker compose up -d
Start-Sleep -Seconds 5
Write-Host "Docker Compose started" -ForegroundColor Green

# Step 3: Check .env file
Write-Host "`n[3/7] Checking .env file..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    @"
DATABASE_URL="postgresql://flowbit_user:flowbit_pass@localhost:5432/flowbit_db?schema=public"
API_PORT=3001
NODE_ENV=development
NEXT_PUBLIC_API_BASE=/api
NEXT_PUBLIC_API_URL=http://localhost:3001
VANNA_API_BASE_URL=http://localhost:8000
GROQ_API_KEY=
ALLOWED_ORIGINS=http://localhost:3000
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "Created .env file" -ForegroundColor Green
} else {
    Write-Host ".env file exists" -ForegroundColor Green
}

# Step 4: Install dependencies
Write-Host "`n[4/7] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "Dependencies installed" -ForegroundColor Green

# Step 5: Setup Prisma
Write-Host "`n[5/7] Setting up Prisma..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

$migrationsDir = "prisma\migrations"
if (-not (Test-Path $migrationsDir) -or (Get-ChildItem $migrationsDir -ErrorAction SilentlyContinue).Count -eq 0) {
    Write-Host "Creating initial migration..." -ForegroundColor Gray
    npx prisma migrate dev --name init
} else {
    Write-Host "Applying migrations..." -ForegroundColor Gray
    npx prisma migrate deploy
    if ($LASTEXITCODE -ne 0) {
        npx prisma migrate dev --name init
    }
}
Write-Host "Prisma setup complete" -ForegroundColor Green

# Step 6: Seed database
Write-Host "`n[6/7] Seeding database..." -ForegroundColor Yellow
if (Test-Path "prisma\seed.ts") {
    npx ts-node prisma/seed.ts
    Write-Host "Seed completed" -ForegroundColor Green
} else {
    Write-Host "No seed script found" -ForegroundColor Yellow
}

# Step 7: Install service dependencies
Write-Host "`n[7/7] Installing service dependencies..." -ForegroundColor Yellow

Write-Host "Backend..." -ForegroundColor Gray
Set-Location apps\api
npm install
Set-Location ..\..

Write-Host "Frontend..." -ForegroundColor Gray
Set-Location apps\web
npm install
Set-Location ..\..

Write-Host "Vanna service..." -ForegroundColor Gray
Set-Location services\vanna
if (-not (Test-Path ".venv")) {
    python -m venv .venv
}
if (Test-Path ".venv\Scripts\pip.exe") {
    & ".venv\Scripts\pip.exe" install -r requirements.txt -q
}
Set-Location ..\..

Write-Host "All dependencies installed" -ForegroundColor Green

# Summary
Write-Host "`n=== Setup Complete! ===" -ForegroundColor Green
Write-Host "`nTo start services:" -ForegroundColor Cyan
Write-Host "1. Backend:   cd apps/api && npm run dev"
Write-Host "2. Frontend:  cd apps/web && npm run dev"
Write-Host "3. Vanna:     cd services/vanna && .venv\Scripts\Activate.ps1 && uvicorn app:app --reload --port 8000"
