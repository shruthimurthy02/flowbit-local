# Move Flowbit Project Outside OneDrive to Fix EPERM Issues
# Run this script from the current project location

$ErrorActionPreference = "Stop"

$sourcePath = "C:\Users\shrut\OneDrive\Desktop\flowbit-intern-assignment"
$targetPath = "C:\Users\shrut\flowbit-local"

Write-Host "=== Moving Project Outside OneDrive ===" -ForegroundColor Cyan
Write-Host "Source: $sourcePath" -ForegroundColor Yellow
Write-Host "Target: $targetPath" -ForegroundColor Yellow

# Check if source exists
if (-not (Test-Path $sourcePath)) {
    Write-Host "❌ Source path does not exist: $sourcePath" -ForegroundColor Red
    exit 1
}

# Create target directory
if (Test-Path $targetPath) {
    Write-Host "⚠ Destination already exists: $targetPath" -ForegroundColor Yellow
    $response = Read-Host "Do you want to overwrite? (y/n)"
    if ($response -ne "y") {
        Write-Host "Aborted" -ForegroundColor Yellow
        exit 0
    }
    Remove-Item $targetPath -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "`n[1/3] Creating destination directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
Write-Host "✅ Destination directory created" -ForegroundColor Green

# Copy project files (exclude node_modules, .next, etc. to speed up)
Write-Host "`n[2/3] Copying project files..." -ForegroundColor Yellow
robocopy $sourcePath $targetPath /E /XD node_modules .next .venv __pycache__ .prisma dist build /XF *.log .env.local 2>&1 | Out-Null
Write-Host "✅ Files copied" -ForegroundColor Green

# Create .gitignore if it doesn't exist
Write-Host "`n[3/3] Setting up project..." -ForegroundColor Yellow
if (-not (Test-Path "$targetPath\.gitignore")) {
    @"
node_modules/
.next/
.venv/
__pycache__/
dist/
build/
.env
.env.local
.env*.local
*.log
.DS_Store
.prisma/
"@ | Out-File -FilePath "$targetPath\.gitignore" -Encoding UTF8
}

Write-Host "✅ Project setup complete" -ForegroundColor Green

Write-Host "`n=== Move Complete! ===" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Open new project in VS Code:" -ForegroundColor White
Write-Host "   code $targetPath" -ForegroundColor Gray
Write-Host "`n2. Install dependencies:" -ForegroundColor White
Write-Host "   cd $targetPath" -ForegroundColor Gray
Write-Host "   npm install" -ForegroundColor Gray
Write-Host "   cd apps\api && npm install" -ForegroundColor Gray
Write-Host "   cd ..\web && npm install" -ForegroundColor Gray
Write-Host "`n3. Generate Prisma Client:" -ForegroundColor White
Write-Host "   cd apps\api" -ForegroundColor Gray
Write-Host "   npx prisma generate" -ForegroundColor Gray
Write-Host "`n4. Run migrations and seed:" -ForegroundColor White
Write-Host "   npx prisma migrate deploy" -ForegroundColor Gray
Write-Host "   npx ts-node prisma/seed.ts" -ForegroundColor Gray
Write-Host "`n5. Start services and test!" -ForegroundColor White

Write-Host "`n⚠ Note: Original project is still in OneDrive" -ForegroundColor Yellow
Write-Host "You can delete it after verifying the new location works" -ForegroundColor Yellow
