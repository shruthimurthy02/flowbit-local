# Seed Database Script
# Run this from project root

$ErrorActionPreference = "Stop"

Write-Host "=== Seeding Database ===" -ForegroundColor Cyan

# Verify data file exists
$dataFile = "data\Analytics_Test_Data.json"
if (-not (Test-Path $dataFile)) {
    Write-Host "❌ Data file not found: $dataFile" -ForegroundColor Red
    Write-Host "Please ensure data/Analytics_Test_Data.json exists in project root" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Data file found: $dataFile" -ForegroundColor Green

# Get absolute path to data file
$absoluteDataPath = (Resolve-Path $dataFile).Path
Write-Host "Absolute path: $absoluteDataPath" -ForegroundColor Gray

# Update seed script to use absolute path (temporary fix)
$seedScript = "prisma\seed.ts"
if (Test-Path $seedScript) {
    Write-Host "`nRunning seed script..." -ForegroundColor Yellow
    
    # Set working directory to apps/api for Prisma
    Push-Location apps\api
    
    # Set DATABASE_URL if not in .env
    if (-not $env:DATABASE_URL) {
        $env:DATABASE_URL = "postgresql://postgres:admin123@localhost:5432/flowbit_db?schema=public"
    }
    
    # Run seed with explicit data path
    $seedContent = Get-Content "..\..\prisma\seed.ts" -Raw
    # Temporarily modify to use absolute path
    $modifiedSeed = $seedContent -replace 'path\.resolve\(.*\)', "`"$absoluteDataPath`""
    
    # Create temp seed file with absolute path
    $tempSeed = "prisma\seed-temp.ts"
    $seedContent | ForEach-Object {
        $_ -replace 'const possiblePaths = \[.*?\];', "const possiblePaths = [`"$absoluteDataPath`"];"
    } | Set-Content $tempSeed
    
    # Actually, let's just run it and let it find the file
    try {
        # Change to project root to run seed
        Pop-Location
        Set-Location ..
        
        # Run seed from project root
        npx ts-node prisma/seed.ts
    } catch {
        Write-Host "❌ Seed failed: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    Pop-Location
} else {
    Write-Host "❌ Seed script not found: $seedScript" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Database seeding complete!" -ForegroundColor Green

# Verify data
Write-Host "`nVerifying database..." -ForegroundColor Yellow
docker exec flowbit_postgres psql -U postgres -d flowbit_db -c 'SELECT COUNT(*) as vendors FROM vendors; SELECT COUNT(*) as invoices FROM invoices; SELECT COUNT(*) as customers FROM customers;' 2>&1

