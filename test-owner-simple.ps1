Write-Host "Testing Owner Management API..." -ForegroundColor Cyan

try {
    $result = Invoke-RestMethod -Method GET -Uri 'http://localhost:3000/api/locations' -Headers @{
        'x-business-id' = '05eae3ea-5c72-4207-b70b-b7495b18eda2'
        'x-user-id' = '77d12908-8d39-410d-b24c-c148f45198d2'
    }
    Write-Host "`n✅ Locations API Success!" -ForegroundColor Green
    $result | ConvertTo-Json -Depth 3
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
