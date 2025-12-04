# Test Owner Management API
$businessId = '05eae3ea-5c72-4207-b70b-b7495b18eda2'
$userId = '77d12908-8d39-410d-b24c-c148f45198d2'
$headers = @{
    'x-business-id' = $businessId
    'x-user-id' = $userId
    'Content-Type' = 'application/json'
}

Write-Host "`n===== Testing Owner Management APIs =====`n" -ForegroundColor Cyan

# Test 1: Get Locations
Write-Host "1. GET /api/locations" -ForegroundColor Yellow
try {
    $locations = Invoke-RestMethod -Uri 'http://localhost:3000/api/locations' -Headers $headers
    Write-Host "✅ Success: Found $($locations.Count) location(s)" -ForegroundColor Green
    $locations | ConvertTo-Json -Depth 2
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host "`n---`n"

# Test 2: Get Active Locations
Write-Host "2. GET /api/locations/active" -ForegroundColor Yellow
try {
    $activeLocations = Invoke-RestMethod -Uri 'http://localhost:3000/api/locations/active' -Headers $headers
    Write-Host "✅ Success: Found $($activeLocations.Count) active location(s)" -ForegroundColor Green
    $activeLocations | ConvertTo-Json -Depth 2
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host "`n---`n"

# Test 3: Get Owner Dashboard
Write-Host "3. GET /api/owner/dashboard" -ForegroundColor Yellow
try {
    $dashboard = Invoke-RestMethod -Uri 'http://localhost:3000/api/owner/dashboard' -Headers $headers
    Write-Host "✅ Success: Dashboard loaded" -ForegroundColor Green
    $dashboard | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host "`n---`n"

# Test 4: Get Users
Write-Host "4. GET /api/owner/users" -ForegroundColor Yellow
try {
    $users = Invoke-RestMethod -Uri 'http://localhost:3000/api/owner/users' -Headers $headers
    Write-Host "✅ Success: Found $($users.Count) user(s)" -ForegroundColor Green
    $users | Select-Object id, name, email, role, status | Format-Table
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host "`n---`n"

# Test 5: Get Business Info
Write-Host "5. GET /api/owner/business" -ForegroundColor Yellow
try {
    $business = Invoke-RestMethod -Uri 'http://localhost:3000/api/owner/business' -Headers $headers
    Write-Host "✅ Success: Business info loaded" -ForegroundColor Green
    $business | ConvertTo-Json -Depth 2
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host "`n`n===== All Tests Complete =====`n" -ForegroundColor Cyan
