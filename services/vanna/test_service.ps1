# Test Vanna Service
# Run this after starting the service

Write-Host "=== Testing Vanna Service ===" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n[1/3] Testing health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/health" -Method GET -UseBasicParsing
    $health = $response.Content | ConvertFrom-Json
    Write-Host "✅ Health check passed: $($health.status)" -ForegroundColor Green
    Write-Host "   Message: $($health.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Root endpoint
Write-Host "`n[2/3] Testing root endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/" -Method GET -UseBasicParsing
    $root = $response.Content | ConvertFrom-Json
    Write-Host "✅ Root endpoint passed: $($root.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Root endpoint failed: $_" -ForegroundColor Red
}

# Test 3: Chat endpoint
Write-Host "`n[3/3] Testing chat endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        question = "top vendors"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/chat" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    $chat = $response.Content | ConvertFrom-Json
    Write-Host "✅ Chat endpoint passed" -ForegroundColor Green
    Write-Host "   SQL: $($chat.sql.Substring(0, [Math]::Min(50, $chat.sql.Length)))..." -ForegroundColor Gray
    Write-Host "   Results: $($chat.results.Count) rows" -ForegroundColor Gray
    if ($chat.results.Count -gt 0) {
        Write-Host "   First result: $($chat.results[0] | ConvertTo-Json -Compress)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Chat endpoint failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Error details: $responseBody" -ForegroundColor Red
    }
}

# Test 4: Query endpoint
Write-Host "`n[4/4] Testing query endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        query = "top 5 vendors by spend"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/query" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    $query = $response.Content | ConvertFrom-Json
    Write-Host "✅ Query endpoint passed" -ForegroundColor Green
    Write-Host "   SQL: $($query.sql.Substring(0, [Math]::Min(50, $query.sql.Length)))..." -ForegroundColor Gray
    Write-Host "   Results: $($query.results.Count) rows" -ForegroundColor Gray
} catch {
    Write-Host "❌ Query endpoint failed: $_" -ForegroundColor Red
}

Write-Host "`n=== Testing Complete ===" -ForegroundColor Cyan
Write-Host "`nService is running at: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Swagger UI: http://127.0.0.1:8000/docs" -ForegroundColor Green

