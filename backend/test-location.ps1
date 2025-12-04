# Test location_id in API responses

Write-Host "🧪 Testing location_id in API responses...`n" -ForegroundColor Cyan

# Login
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"owner@pos.com","password":"password123"}'
$token = $loginResponse.access_token

$businessId = "3abc701e-15ee-4bf8-9668-87903ccd2506"
$location1Id = "e2ea61f0-351f-48ee-81bd-834a0e5319dc"
$location2Id = "fa449f18-2d96-419c-bce2-ce3e5b73f140"

# Test customers
Write-Host "📋 CUSTOMERS API" -ForegroundColor Yellow
$uri = "http://localhost:3000/api/customers?business_id=$businessId&limit=100"
$allCustomers = Invoke-RestMethod -Uri $uri -Headers @{Authorization="Bearer $token"}
Write-Host "  Total: $($allCustomers.total)"
if ($allCustomers.customers[0].location_id) {
    Write-Host "  ✅ location_id present: $($allCustomers.customers[0].location_id)" -ForegroundColor Green
} else {
    Write-Host "  ❌ location_id missing!" -ForegroundColor Red
}

$uri = "http://localhost:3000/api/customers?business_id=$businessId&location_id=$location1Id"
$loc1Customers = Invoke-RestMethod -Uri $uri -Headers @{Authorization="Bearer $token"}
Write-Host "  Downtown: $($loc1Customers.total)"

$uri = "http://localhost:3000/api/customers?business_id=$businessId&location_id=$location2Id"
$loc2Customers = Invoke-RestMethod -Uri $uri -Headers @{Authorization="Bearer $token"}
Write-Host "  Uptown: $($loc2Customers.total)"

# Test products
Write-Host "`n📦 PRODUCTS API" -ForegroundColor Yellow
$uri = "http://localhost:3000/api/products?business_id=$businessId&limit=100"
$allProducts = Invoke-RestMethod -Uri $uri -Headers @{Authorization="Bearer $token"}
Write-Host "  Total: $($allProducts.total)"
if ($allProducts.products[0].location_id) {
    Write-Host "  ✅ location_id present: $($allProducts.products[0].location_id)" -ForegroundColor Green
} else {
    Write-Host "  ❌ location_id missing!" -ForegroundColor Red
}

$uri = "http://localhost:3000/api/products?business_id=$businessId&location_id=$location1Id"
$loc1Products = Invoke-RestMethod -Uri $uri -Headers @{Authorization="Bearer $token"}
Write-Host "  Downtown: $($loc1Products.total)"

$uri = "http://localhost:3000/api/products?business_id=$businessId&location_id=$location2Id"
$loc2Products = Invoke-RestMethod -Uri $uri -Headers @{Authorization="Bearer $token"}
Write-Host "  Uptown: $($loc2Products.total)"

Write-Host "`n✅ Tests complete!" -ForegroundColor Green
