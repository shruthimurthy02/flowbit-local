# Alternative setup script for local PostgreSQL installation
# This script modifies pg_hba.conf to reset PostgreSQL password
# WARNING: Requires Administrator privileges
# Use setup-windows.ps1 (Docker) instead if possible - it's simpler and safer

#Requires -RunAsAdministrator

$ErrorActionPreference = "Stop"

Write-Host "=== Flowbit Setup with Local PostgreSQL ===" -ForegroundColor Cyan
Write-Host "WARNING: This script modifies PostgreSQL configuration files." -ForegroundColor Yellow
Write-Host "Make sure you have administrator privileges." -ForegroundColor Yellow
Write-Host ""

# Step 1: Find PostgreSQL service
Write-Host "Step 1: Finding PostgreSQL service..." -ForegroundColor Cyan
$pgService = Get-Service | Where-Object { $_.Name -match "postgres" -or $_.DisplayName -match "postgres" } | Select-Object -First 1

if (-not $pgService) {
    Write-Host "ERROR: PostgreSQL service not found." -ForegroundColor Red
    Write-Host "Please install PostgreSQL or use Docker Compose instead (setup-windows.ps1)" -ForegroundColor Yellow
    exit 1
}

$pgServiceName = $pgService.Name
Write-Host "Found PostgreSQL service: $pgServiceName" -ForegroundColor Green
Write-Host ""

# Step 2: Find pg_hba.conf
Write-Host "Step 2: Finding pg_hba.conf..." -ForegroundColor Cyan
$possiblePaths = @(
    "$env:ProgramFiles\PostgreSQL\16\data\pg_hba.conf",
    "$env:ProgramFiles\PostgreSQL\15\data\pg_hba.conf",
    "$env:ProgramFiles\PostgreSQL\14\data\pg_hba.conf",
    "$env:ProgramFiles\PostgreSQL\13\data\pg_hba.conf",
    "C:\Program Files\PostgreSQL\16\data\pg_hba.conf",
    "C:\Program Files\PostgreSQL\15\data\pg_hba.conf"
)

$pg_hba = $possiblePaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $pg_hba) {
    Write-Host "ERROR: pg_hba.conf not found in common paths." -ForegroundColor Red
    Write-Host "Please find it manually and update the script, or use Docker Compose." -ForegroundColor Yellow
    exit 1
}

Write-Host "Found pg_hba.conf at: $pg_hba" -ForegroundColor Green
Write-Host ""

# Step 3: Backup and modify pg_hba.conf
Write-Host "Step 3: Backing up and modifying pg_hba.conf..." -ForegroundColor Cyan
$backup = "${pg_hba}.backup.$((Get-Date).ToString('yyyyMMddHHmmss'))"
Copy-Item -Path $pg_hba -Destination $backup -Force
Write-Host "Backup created: $backup" -ForegroundColor Green

$pgtext = Get-Content $pg_hba -Raw
$pgtext2 = $pgtext -replace 'host\s+all\s+all\s+127\.0\.0\.1\/32\s+\S+','host all all 127.0.0.1/32 trust'
Set-Content -Path $pg_hba -Value $pgtext2 -Force -Encoding UTF8
Write-Host "Modified pg_hba.conf to trust for localhost (temporary)" -ForegroundColor Green
Write-Host ""

# Step 4: Restart PostgreSQL
Write-Host "Step 4: Restarting PostgreSQL service..." -ForegroundColor Cyan
Stop-Service -Name $pgServiceName -Force
Start-Sleep -Seconds 3
Start-Service -Name $pgServiceName
Start-Sleep -Seconds 5
Write-Host "PostgreSQL service restarted" -ForegroundColor Green
Write-Host ""

# Step 5: Find psql
Write-Host "Step 5: Finding psql executable..." -ForegroundColor Cyan
$psqlPaths = @(
    "$env:ProgramFiles\PostgreSQL\16\bin\psql.exe",
    "$env:ProgramFiles\PostgreSQL\15\bin\psql.exe",
    "$env:ProgramFiles\PostgreSQL\14\bin\psql.exe",
    "$env:ProgramFiles\PostgreSQL\13\bin\psql.exe"
)

$psql = $psqlPaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $psql) {
    $psql = (Get-Command psql -ErrorAction SilentlyContinue).Source
}

if (-not $psql) {
    Write-Host "ERROR: psql not found. Please install PostgreSQL client tools." -ForegroundColor Red
    # Restore backup
    Set-Content -Path $pg_hba -Value (Get-Content $backup -Raw) -Force -Encoding UTF8
    exit 1
}

Write-Host "Using psql: $psql" -ForegroundColor Green
Write-Host ""

# Step 6: Set password and create database
Write-Host "Step 6: Setting PostgreSQL password and creating database..." -ForegroundColor Cyan
$newPass = "admin123"

& $psql -U postgres -c "ALTER USER postgres WITH PASSWORD '$newPass';" 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Password change may have failed. Continuing..." -ForegroundColor Yellow
}

& $psql -U postgres -c "DROP DATABASE IF EXISTS flowbit_db;" 2>&1 | Out-Null
& $psql -U postgres -c "CREATE DATABASE flowbit_db;" 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create database." -ForegroundColor Red
    # Restore backup
    Set-Content -Path $pg_hba -Value (Get-Content $backup -Raw) -Force -Encoding UTF8
    exit 1
}

Write-Host "Database created successfully" -ForegroundColor Green
Write-Host ""

# Step 7: Restore pg_hba.conf
Write-Host "Step 7: Restoring pg_hba.conf..." -ForegroundColor Cyan
Set-Content -Path $pg_hba -Value (Get-Content $backup -Raw) -Force -Encoding UTF8

# Restart PostgreSQL to apply changes
Stop-Service -Name $pgServiceName -Force
Start-Sleep -Seconds 2
Start-Service -Name $pgServiceName
Start-Sleep -Seconds 5

Write-Host "pg_hba.conf restored and PostgreSQL restarted" -ForegroundColor Green
Write-Host ""

# Step 8: Update .env files
Write-Host "Step 8: Updating environment files..." -ForegroundColor Cyan
$repoRoot = (Resolve-Path ".").Path

# Update root .env
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    $envContent = $envContent -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"postgresql://postgres:admin123@localhost:5432/flowbit_db?schema=public`""
    Set-Content -Path ".env" -Value $envContent -Force
} else {
    @"
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/flowbit_db?schema=public"
API_PORT=3001
NODE_ENV=development
NEXT_PUBLIC_API_BASE=/api
NEXT_PUBLIC_API_URL=http://localhost:3001
VANNA_API_BASE_URL=http://127.0.0.1:8000
VANNA_API_KEY=
GROQ_API_KEY=
ALLOWED_ORIGINS=http://localhost:3000
"@ | Out-File -FilePath ".env" -Encoding UTF8
}

# Update apps/api/.env
$apiEnv = Join-Path $repoRoot "apps\api\.env"
Copy-Item ".env" $apiEnv -Force

Write-Host "Environment files updated" -ForegroundColor Green
Write-Host ""

# Step 9: Run Prisma setup
Write-Host "Step 9: Setting up Prisma..." -ForegroundColor Cyan
Push-Location apps\api

npm install
npx prisma generate
npx prisma migrate dev --name init

if (Test-Path "..\..\prisma\seed.ts") {
    npx ts-node ..\..\prisma\seed.ts
}

Pop-Location

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Database credentials:" -ForegroundColor Cyan
Write-Host "  Username: postgres" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host "  Database: flowbit_db" -ForegroundColor White
Write-Host ""
Write-Host "Next: Run start-services.ps1 or start services manually" -ForegroundColor Cyan
Write-Host ""

