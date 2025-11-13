# Flowbit Setup Script for Windows
# Uses Docker Compose for PostgreSQL (recommended) or local PostgreSQL

$ErrorActionPreference = "Stop"

Write-Host "=== Flowbit Setup Script ===" -ForegroundColor Cyan
Write-Host "Working directory: $(Get-Location)" -ForegroundColor Gray

# Step 1: Check if Docker is available and running
Write-Host "`n[1/8] Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
    
    $dockerRunning = docker ps 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker not found. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

# Step 2: Start Docker Compose services
Write-Host "`n[2/8] Starting Docker Compose services..." -ForegroundColor Yellow
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to start Docker Compose services" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker Compose services started" -ForegroundColor Green

# Wait for PostgreSQL to be ready
Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Step 3: Verify PostgreSQL connection
Write-Host "`n[3/8] Verifying PostgreSQL connection..." -ForegroundColor Yellow
$maxRetries = 10
$retryCount = 0
$connected = $false

while ($retryCount -lt $maxRetries -and -not $connected) {
    try {
        $result = docker exec flowbit_postgres psql -U flowbit_user -d flowbit_db -c "SELECT 1;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            $connected = $true
            Write-Host "✓ PostgreSQL is ready" -ForegroundColor Green
        } else {
            $retryCount++
            Write-Host "  Retrying... ($retryCount/$maxRetries)" -ForegroundColor Gray
            Start-Sleep -Seconds 2
        }
    } catch {
        $retryCount++
        Write-Host "  Retrying... ($retryCount/$maxRetries)" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $connected) {
    Write-Host "✗ PostgreSQL is not ready. Please check Docker logs: docker compose logs postgres" -ForegroundColor Red
    exit 1
}

# Step 4: Create/Update .env file
Write-Host "`n[4/8] Creating/updating .env file..." -ForegroundColor Yellow
$repoRoot = (Get-Location).Path
$envFile = Join-Path $repoRoot ".env"

$envContent = @"
# Database (Docker Compose)
DATABASE_URL="postgresql://flowbit_user:flowbit_pass@localhost:5432/flowbit_db?schema=public"

# API
API_PORT=3001
NODE_ENV=development

# Frontend
NEXT_PUBLIC_API_BASE=/api
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_VANNA_API_URL=http://localhost:8000

# Vanna Service
VANNA_API_BASE_URL=http://localhost:8000
VANNA_API_KEY=
GROQ_API_KEY=

# CORS
ALLOWED_ORIGINS=http://localhost:3000
"@

if (Test-Path $envFile) {
    Write-Host "✓ .env file already exists (keeping existing)" -ForegroundColor Green
} else {
    $envContent | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "✓ Created .env file" -ForegroundColor Green
}

# Step 5: Install dependencies
Write-Host "`n[5/8] Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Root dependencies installed" -ForegroundColor Green

# Step 6: Generate Prisma Client and run migrations
Write-Host "`n[6/8] Setting up Prisma..." -ForegroundColor Yellow

# Generate Prisma Client
Write-Host "  Generating Prisma Client..." -ForegroundColor Gray
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Prisma Client generated" -ForegroundColor Green

# Run migrations
Write-Host "  Running Prisma migrations..." -ForegroundColor Gray
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Trying migrate dev..." -ForegroundColor Gray
    npx prisma migrate dev --name init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to run migrations" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Migrations applied" -ForegroundColor Green

# Step 7: Seed database
Write-Host "`n[7/8] Seeding database..." -ForegroundColor Yellow
if (Test-Path "prisma\seed.ts") {
    npx ts-node prisma/seed.ts
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database seeded successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠ Seed script had errors (check output above)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ No seed script found (prisma/seed.ts)" -ForegroundColor Yellow
}

# Step 8: Install service dependencies
Write-Host "`n[8/8] Installing service dependencies..." -ForegroundColor Yellow

# Backend dependencies
Write-Host "  Installing backend dependencies..." -ForegroundColor Gray
Push-Location apps\api
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green

# Frontend dependencies
Write-Host "  Installing frontend dependencies..." -ForegroundColor Gray
Push-Location apps\web
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green

# Vanna service dependencies
Write-Host "  Setting up Vanna service..." -ForegroundColor Gray
Push-Location services\vanna
if (Test-Path "requirements.txt") {
    if (-not (Test-Path ".venv")) {
        python -m venv .venv
    }
    & ".venv\Scripts\Activate.ps1"
    pip install --upgrade pip
    pip install -r requirements.txt
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Vanna service dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "⚠ Vanna service dependencies had errors" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ No requirements.txt found for Vanna service" -ForegroundColor Yellow
}
Pop-Location

# Final summary
Write-Host "`n=== Setup Complete! ===" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Start backend API:" -ForegroundColor White
Write-Host "   cd apps/api" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "`n2. Start frontend:" -ForegroundColor White
Write-Host "   cd apps/web" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "`n3. Start Vanna service:" -ForegroundColor White
Write-Host "   cd services/vanna" -ForegroundColor Gray
Write-Host "   .venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "   uvicorn app:app --reload --port 8000" -ForegroundColor Gray
Write-Host "`n4. Access the application:" -ForegroundColor White
Write-Host "   Dashboard: http://localhost:3000/dashboard" -ForegroundColor Gray
Write-Host "   Chat: http://localhost:3000/chat-with-data" -ForegroundColor Gray
Write-Host "   API: http://localhost:3001" -ForegroundColor Gray
Write-Host "   Adminer: http://localhost:8080" -ForegroundColor Gray
Write-Host "`nDatabase credentials:" -ForegroundColor White
Write-Host "   System: PostgreSQL" -ForegroundColor Gray
Write-Host "   Server: postgres (or localhost)" -ForegroundColor Gray
Write-Host "   Username: flowbit_user" -ForegroundColor Gray
Write-Host "   Password: flowbit_pass" -ForegroundColor Gray
Write-Host "   Database: flowbit_db" -ForegroundColor Gray
