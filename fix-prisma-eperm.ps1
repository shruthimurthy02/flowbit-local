# Fix Prisma EPERM Issue on Windows + OneDrive
# Run this script from project root

Write-Host "=== Fixing Prisma EPERM Issue ===" -ForegroundColor Cyan

# Step 1: Stop all Node processes
Write-Host "`n[1/5] Stopping Node processes..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -like "*node*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ Node processes stopped" -ForegroundColor Green

# Step 2: Clean Prisma folders
Write-Host "`n[2/5] Cleaning Prisma folders..." -ForegroundColor Yellow
Remove-Item "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "apps\api\node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "apps\api\node_modules\@prisma\client" -Recurse -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ Prisma folders cleaned" -ForegroundColor Green

# Step 3: Verify data file exists
Write-Host "`n[3/5] Checking data file..." -ForegroundColor Yellow
$dataFile = "data\Analytics_Test_Data.json"
if (Test-Path $dataFile) {
    Write-Host "✅ Data file found: $dataFile" -ForegroundColor Green
} else {
    Write-Host "❌ Data file not found: $dataFile" -ForegroundColor Red
    Write-Host "Please ensure data/Analytics_Test_Data.json exists in project root" -ForegroundColor Yellow
    exit 1
}

# Step 4: Generate Prisma Client
Write-Host "`n[4/5] Generating Prisma Client..." -ForegroundColor Yellow
Push-Location apps\api
try {
    npx prisma generate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Prisma Client generated successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Prisma Client generation failed" -ForegroundColor Red
        Write-Host "`nIf EPERM error persists, try:" -ForegroundColor Yellow
        Write-Host "1. Close all IDEs and editors" -ForegroundColor Yellow
        Write-Host "2. Close OneDrive sync temporarily" -ForegroundColor Yellow
        Write-Host "3. Move project outside OneDrive (see move-project.ps1)" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}

# Step 5: Seed database
Write-Host "`n[5/5] Seeding database..." -ForegroundColor Yellow
Push-Location apps\api
try {
    npx ts-node prisma/seed.ts
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database seeded successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Database seed failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}

Write-Host "`n=== Fix Complete! ===" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Start backend: cd apps\api && npm run dev" -ForegroundColor White
Write-Host "2. Test API: curl http://localhost:3001/stats" -ForegroundColor White
Write-Host "3. Start frontend: cd apps\web && npm run dev" -ForegroundColor White

