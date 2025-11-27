# Complete Setup Script for Flowbit Monorepo
# Run this from the repository root: C:\Projects\flowbit-intern-assignment

Write-Host "========================================"
Write-Host "FLOWBIT COMPLETE SETUP SCRIPT"
Write-Host "========================================"

# STEP 1: Ensure Node 20 is active
Write-Host "`n[STEP 1] Checking Node version..."
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node -v
    Write-Host "Current Node: $nodeVersion"
    if (-not $nodeVersion.StartsWith("v20")) {
        Write-Host "Node 20 required. Please run: nvm use 20"
        exit 1
    }
} else {
    Write-Host "Node.js not found in PATH."
    Write-Host "Please ensure NVM is set up and run: nvm use 20"
    exit 1
}

# STEP 2: Create environment files
Write-Host "`n[STEP 2] Creating environment files..."

# apps/api/.env
$apiEnv = @"
DATABASE_URL=postgresql://admin:admin@localhost:5432/flowbit
PORT=3001
VANNA_API_BASE_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
"@
$apiEnvPath = "apps/api/.env"
Set-Content -Path $apiEnvPath -Value $apiEnv -Encoding UTF8
Write-Host "Created $apiEnvPath"

# apps/web/.env.local
$webEnv = @"
NEXT_PUBLIC_API_BASE=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@
$webEnvPath = "apps/web/.env.local"
Set-Content -Path $webEnvPath -Value $webEnv -Encoding UTF8
Write-Host "Created $webEnvPath"

# services/vanna/.env
$vannaEnv = @"
DATABASE_URL=postgresql+psycopg://admin:admin@localhost:5432/flowbit
GROQ_API_KEY=REPLACE_ME
PORT=8000
"@
$vannaEnvPath = "services/vanna/.env"
Set-Content -Path $vannaEnvPath -Value $vannaEnv -Encoding UTF8
Write-Host "Created $vannaEnvPath"
Write-Host "IMPORTANT: Edit services/vanna/.env and set GROQ_API_KEY"

# STEP 3: Start PostgreSQL
Write-Host "`n[STEP 3] Starting PostgreSQL container..."

$containerExists = docker ps -a --filter "name=flowbit-db" --format "{{.Names}}" 2>$null
if ($containerExists -eq "flowbit-db") {
    docker start flowbit-db | Out-Null
    Write-Host "Started existing container 'flowbit-db'"
} else {
    docker run --name flowbit-db -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=flowbit -p 5432:5432 -d postgres | Out-Null
    Write-Host "Created and started new container 'flowbit-db'"
    Start-Sleep -Seconds 3
}

# STEP 4: Setup database schema
Write-Host "`n[STEP 4] Setting up database schema..."
Set-Location apps/api

npm install
if ($LASTEXITCODE -ne 0) { Write-Host "npm install failed"; exit 1 }
Write-Host "Dependencies installed"

npx prisma generate
if ($LASTEXITCODE -ne 0) { Write-Host "prisma generate failed"; exit 1 }
Write-Host "Prisma client generated"

npx prisma db push
if ($LASTEXITCODE -ne 0) { Write-Host "prisma db push failed"; exit 1 }
Write-Host "Database schema pushed"

npm run prisma:seed
if ($LASTEXITCODE -ne 0) { Write-Host "Database seed failed"; exit 1 }
Write-Host "Database seeded"

Set-Location ../..

# STEP 5: Install Vanna dependencies
Write-Host "`n[STEP 5] Installing Vanna dependencies..."
Set-Location services/vanna

if (Get-Command python -ErrorAction SilentlyContinue) {
    python -m pip install -r requirements.txt
    Write-Host "Vanna dependencies installed"
} else {
    Write-Host "Python not found. Please install Python."
}

Set-Location ../..

# STEP 6: Install frontend dependencies
Write-Host "`n[STEP 6] Installing frontend dependencies..."
Set-Location apps/web

Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

npm install
if ($LASTEXITCODE -ne 0) { Write-Host "Frontend npm install failed"; exit 1 }
Write-Host "Frontend dependencies installed"

Set-Location ../..

# FINAL SUMMARY
Write-Host "`n========================================"
Write-Host "SETUP COMPLETE!"
Write-Host "========================================"
Write-Host "`nStart services:"
Write-Host "Backend:   cd apps/api ; npm run dev"
Write-Host "Vanna:     cd services/vanna ; python -m uvicorn src.main:app --reload --port 8000"
Write-Host "Frontend:  cd apps/web ; npm run dev"
Write-Host "`nSet your GROQ_API_KEY in services/vanna/.env"
Write-Host "========================================"






