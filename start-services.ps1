# Start all Flowbit services
# Run from repository root

$ErrorActionPreference = "Stop"

Write-Host "=== Starting Flowbit Services ===" -ForegroundColor Cyan
Write-Host ""

$repoRoot = (Resolve-Path ".").Path

# Start Docker Compose if not running
Write-Host "Starting Docker Compose services..." -ForegroundColor Cyan
docker compose up -d
Start-Sleep -Seconds 3

# Start Backend API
Write-Host "Starting Backend API (Terminal 1)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$repoRoot\apps\api'; Write-Host 'Backend API - Terminal 1' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 2

# Start Frontend
Write-Host "Starting Frontend (Terminal 2)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$repoRoot\apps\web'; Write-Host 'Frontend - Terminal 2' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 2

# Start Vanna Service
Write-Host "Starting Vanna Service (Terminal 3)..." -ForegroundColor Cyan
$vannaScript = @"
cd '$repoRoot\services\vanna'
Write-Host 'Vanna AI Service - Terminal 3' -ForegroundColor Green
if (Test-Path '.venv\Scripts\Activate.ps1') {
    .\.venv\Scripts\Activate.ps1
    uvicorn app:app --reload --port 8000
} else {
    Write-Host 'ERROR: Virtual environment not found. Run setup-windows.ps1 first.' -ForegroundColor Red
    pause
}
"@

$tempScript = [System.IO.Path]::GetTempFileName() + ".ps1"
$vannaScript | Out-File -FilePath $tempScript -Encoding UTF8
Start-Process powershell -ArgumentList "-NoExit", "-File", $tempScript

Write-Host ""
Write-Host "=== All Services Starting ===" -ForegroundColor Green
Write-Host ""
Write-Host "Services will open in separate PowerShell windows." -ForegroundColor Yellow
Write-Host ""
Write-Host "Access the application:" -ForegroundColor Cyan
Write-Host "  Dashboard: http://localhost:3000/dashboard" -ForegroundColor White
Write-Host "  Chat: http://localhost:3000/chat-with-data" -ForegroundColor White
Write-Host "  API: http://localhost:3001" -ForegroundColor White
Write-Host "  Vanna: http://localhost:8000" -ForegroundColor White
Write-Host "  Adminer: http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit (services will continue running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

