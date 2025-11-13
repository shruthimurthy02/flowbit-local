# Flowbit Deployment Verification Script
# Run this after deploying to production

param(
    [string]$BackendUrl = "https://flowbit-api.onrender.com",
    [string]$VannaUrl = "https://flowbit-vanna.onrender.com",
    [string]$FrontendUrl = "https://flowbit.vercel.app"
)

$ErrorActionPreference = "Continue"

Write-Host "=== Flowbit Deployment Verification ===" -ForegroundColor Cyan
Write-Host "Backend: $BackendUrl" -ForegroundColor Gray
Write-Host "Vanna: $VannaUrl" -ForegroundColor Gray
Write-Host "Frontend: $FrontendUrl" -ForegroundColor Gray

$allPassed = $true

# Test Backend Health
Write-Host "`n[1/7] Testing Backend Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BackendUrl/health" -TimeoutSec 10
    if ($health.status -eq "ok") {
        Write-Host "✅ Backend health check passed" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend health check failed: Unexpected response" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "❌ Backend health check failed: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test Backend Stats
Write-Host "`n[2/7] Testing Backend Stats Endpoint..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$BackendUrl/stats" -TimeoutSec 10
    if ($stats.totalSpend -ge 0) {
        Write-Host "✅ Stats endpoint: Total spend = $($stats.totalSpend)" -ForegroundColor Green
    } else {
        Write-Host "⚠ Stats endpoint returned unexpected data" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Stats endpoint failed: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test Backend Invoices
Write-Host "`n[3/7] Testing Backend Invoices Endpoint..." -ForegroundColor Yellow
try {
    $invoices = Invoke-RestMethod -Uri "$BackendUrl/invoices?page=1&per_page=5" -TimeoutSec 10
    if ($invoices.invoices) {
        Write-Host "✅ Invoices endpoint: $($invoices.invoices.Count) invoices returned" -ForegroundColor Green
    } else {
        Write-Host "⚠ Invoices endpoint returned unexpected data" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Invoices endpoint failed: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test Vanna Health
Write-Host "`n[4/7] Testing Vanna Service Health..." -ForegroundColor Yellow
try {
    $vanna = Invoke-RestMethod -Uri "$VannaUrl/status" -TimeoutSec 10
    if ($vanna.status -eq "ok") {
        Write-Host "✅ Vanna status check passed" -ForegroundColor Green
    } else {
        Write-Host "❌ Vanna status check failed: Unexpected response" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "❌ Vanna status check failed: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test Chat Endpoint
Write-Host "`n[5/7] Testing Chat Endpoint..." -ForegroundColor Yellow
try {
    $chatBody = @{question="show top 5 vendors by spend"} | ConvertTo-Json
    $chat = Invoke-RestMethod -Uri "$BackendUrl/chat-with-data" -Method POST -Body $chatBody -ContentType "application/json" -TimeoutSec 30
    if ($chat.sql -or $chat.results) {
        Write-Host "✅ Chat endpoint: SQL generated and results returned" -ForegroundColor Green
    } else {
        Write-Host "⚠ Chat endpoint returned unexpected data" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Chat endpoint failed: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test Frontend
Write-Host "`n[6/7] Testing Frontend..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri $FrontendUrl -UseBasicParsing -TimeoutSec 10
    if ($frontend.StatusCode -eq 200) {
        Write-Host "✅ Frontend loads: Status $($frontend.StatusCode)" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend returned status: $($frontend.StatusCode)" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "❌ Frontend failed: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test Additional Endpoints
Write-Host "`n[7/7] Testing Additional Endpoints..." -ForegroundColor Yellow
$endpoints = @(
    "/vendors/top10",
    "/category-spend",
    "/cash-outflow",
    "/invoice-trends"
)

foreach ($endpoint in $endpoints) {
    try {
        $result = Invoke-RestMethod -Uri "$BackendUrl$endpoint" -TimeoutSec 10
        Write-Host "✅ $endpoint" -ForegroundColor Green
    } catch {
        Write-Host "❌ $endpoint failed: $_" -ForegroundColor Red
        $allPassed = $false
    }
}

# Summary
Write-Host "`n=== Verification Summary ===" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "✅ All checks passed!" -ForegroundColor Green
    Write-Host "`nYour Flowbit application is live and working!" -ForegroundColor Green
} else {
    Write-Host "❌ Some checks failed. Please review the errors above." -ForegroundColor Red
}

Write-Host "`nDeployment URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: $FrontendUrl" -ForegroundColor White
Write-Host "  Backend: $BackendUrl" -ForegroundColor White
Write-Host "  Vanna: $VannaUrl" -ForegroundColor White

if ($allPassed) { exit 0 } else { exit 1 }

