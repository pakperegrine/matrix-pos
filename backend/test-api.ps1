# Test Backend API

Write-Host "Starting backend server..." -ForegroundColor Green

# Start backend in background job
$backendJob = Start-Job -ScriptBlock {
    Set-Location C:\pos_repo\backend
    node dist/main.js
}

# Wait for server to start
Write-Host "Waiting for server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test endpoints
Write-Host "`nTesting GET /api/products..." -ForegroundColor Cyan
try {
    $products = Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method GET
    Write-Host "✓ GET /api/products: SUCCESS" -ForegroundColor Green
    Write-Host "Response: $($products | ConvertTo-Json -Depth 2)" -ForegroundColor White
} catch {
    Write-Host "✗ GET /api/products: FAILED - $_" -ForegroundColor Red
}

Write-Host "`nTesting POST /api/sync/offline-sale..." -ForegroundColor Cyan
try {
    $payload = @{
        source = "offline"
        location_id = "loc-123"
        items = @(
            @{
                product_id = "prod-1"
                quantity = 2
                sale_price = 10.50
            }
        )
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/sync/offline-sale" -Method POST -Body $payload -ContentType "application/json"
    Write-Host "✓ POST /api/sync/offline-sale: SUCCESS" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor White
} catch {
    Write-Host "✗ POST /api/sync/offline-sale: FAILED - $_" -ForegroundColor Red
}

# Cleanup
Write-Host "`nStopping backend server..." -ForegroundColor Yellow
Stop-Job $backendJob
Remove-Job $backendJob

Write-Host "`nBackend API tests complete!" -ForegroundColor Green
