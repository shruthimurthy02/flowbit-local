# Complete Local Setup Script for Flowbit
# Run this AFTER moving project outside OneDrive

$ErrorActionPreference = "Stop"

Write-Host "=== Flowbit Local Setup ===" -ForegroundColor Cyan

# Step 1: Install root dependencies
Write-Host "`n[1/6] Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Root dependencies installed" -ForegroundColor Green

# Step 2: Install backend dependencies
Write-Host "`n[2/6] Installing backend dependencies..." -ForegroundColor Yellow
Push-Location apps\api
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green

# Step 3: Generate Prisma Client
Write-Host "`n[3/6] Generating Prisma Client..." -ForegroundColor Yellow
Push-Location apps\api
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "✅ Prisma Client generated" -ForegroundColor Green

# Step 4: Apply migrations
Write-Host "`n[4/6] Applying database migrations..." -ForegroundColor Yellow
Push-Location apps\api
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "Trying migrate dev..." -ForegroundColor Gray
    npx prisma migrate dev --name init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to apply migrations" -ForegroundColor Red
        Pop-Location
        exit 1
    }
}
Pop-Location
Write-Host "✅ Migrations applied" -ForegroundColor Green

# Step 5: Seed database
Write-Host "`n[5/6] Seeding database..." -ForegroundColor Yellow
Push-Location apps\api
npx ts-node prisma/seed.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to seed database" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "✅ Database seeded" -ForegroundColor Green

# Step 6: Install frontend dependencies
Write-Host "`n[6/6] Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location apps\web
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green

Write-Host "`n=== Setup Complete! ===" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Start backend:   cd apps\api && npm run dev" -ForegroundColor White
Write-Host "2. Start Vanna:     cd services\vanna && .venv\Scripts\Activate.ps1 && uvicorn app:app --reload --port 8000" -ForegroundColor White
Write-Host "3. Start frontend:  cd apps\web && npm run dev" -ForegroundColor White
Write-Host "`nAccess:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "  Vanna:    http://localhost:8000" -ForegroundColor White
Write-Host "  Adminer:  http://localhost:8080" -ForegroundColor White

