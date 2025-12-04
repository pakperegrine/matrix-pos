# API Verification Tests

Write-Host "🧪 Testing POS APIs..." -ForegroundColor Cyan
Write-Host "=" * 60

# 1. Test Login
Write-Host "`n1️⃣ Testing Login API..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"email":"owner@pos.com","password":"password123"}'

if ($loginResponse.token) {
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   Token: $($loginResponse.token.Substring(0,20))..." -ForegroundColor Gray
    Write-Host "   User: $($loginResponse.user.name)" -ForegroundColor Gray
    Write-Host "   Role: $($loginResponse.user.role)" -ForegroundColor Gray
    Write-Host "   Business ID: $($loginResponse.user.business_id)" -ForegroundColor Gray
    $token = $loginResponse.token
    $businessId = $loginResponse.user.business_id
} else {
    Write-Host "❌ Login failed!" -ForegroundColor Red
    exit 1
}

# 2. Test Locations API
Write-Host "`n2️⃣ Testing Locations API..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "x-business-id" = $businessId
}

$locations = Invoke-RestMethod -Uri "http://localhost:3000/api/locations" `
    -Method GET `
    -Headers $headers

if ($locations) {
    Write-Host "✅ Locations retrieved: $($locations.Count)" -ForegroundColor Green
    foreach ($loc in $locations) {
        Write-Host "   - $($loc.name) ($($loc.code)) - Status: $($loc.status)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ No locations found!" -ForegroundColor Red
}

# 3. Test Users API
Write-Host "`n3️⃣ Testing Owner/Users API..." -ForegroundColor Yellow
$users = Invoke-RestMethod -Uri "http://localhost:3000/api/owner/users" `
    -Method GET `
    -Headers $headers

if ($users) {
    Write-Host "✅ Users retrieved: $($users.Count)" -ForegroundColor Green
    $usersByRole = $users | Group-Object role
    foreach ($group in $usersByRole) {
        Write-Host "   - $($group.Name): $($group.Count) user(s)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ No users found!" -ForegroundColor Red
}

# 4. Test Products API
Write-Host "`n4️⃣ Testing Products API..." -ForegroundColor Yellow
$products = Invoke-RestMethod -Uri "http://localhost:3000/api/products" `
    -Method GET `
    -Headers $headers

if ($products) {
    Write-Host "✅ Products retrieved: $($products.Count)" -ForegroundColor Green
    Write-Host "   First 3 products:" -ForegroundColor Gray
    $products | Select-Object -First 3 | ForEach-Object {
        Write-Host "   - $($_.name) - Price: `$$($_.price)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ No products found!" -ForegroundColor Red
}

# 5. Test Customers API
Write-Host "`n5️⃣ Testing Customers API..." -ForegroundColor Yellow
$customers = Invoke-RestMethod -Uri "http://localhost:3000/api/customers" `
    -Method GET `
    -Headers $headers

if ($customers) {
    Write-Host "✅ Customers retrieved: $($customers.Count)" -ForegroundColor Green
    $customers | Select-Object -First 3 | ForEach-Object {
        Write-Host "   - $($_.name) ($($_.customer_type))" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ No customers found!" -ForegroundColor Red
}

# 6. Test Owner Dashboard API
Write-Host "`n6️⃣ Testing Owner Dashboard API..." -ForegroundColor Yellow
$dashboard = Invoke-RestMethod -Uri "http://localhost:3000/api/owner/dashboard" `
    -Method GET `
    -Headers $headers

if ($dashboard) {
    Write-Host "✅ Dashboard data retrieved!" -ForegroundColor Green
    Write-Host "   Total Locations: $($dashboard.overview.total_locations)" -ForegroundColor Gray
    Write-Host "   Active Locations: $($dashboard.overview.active_locations)" -ForegroundColor Gray
    Write-Host "   Total Users: $($dashboard.overview.total_users)" -ForegroundColor Gray
    Write-Host "   Total Products: $($dashboard.overview.total_products)" -ForegroundColor Gray
    Write-Host "   Today's Sales: `$$($dashboard.today.sales)" -ForegroundColor Gray
} else {
    Write-Host "❌ Dashboard data not available!" -ForegroundColor Red
}

# 7. Test Stock Batches API
Write-Host "`n7️⃣ Testing Stock Batches API..." -ForegroundColor Yellow
$stock = Invoke-RestMethod -Uri "http://localhost:3000/api/stock-batches" `
    -Method GET `
    -Headers $headers

if ($stock) {
    Write-Host "✅ Stock batches retrieved: $($stock.Count)" -ForegroundColor Green
    $totalQty = ($stock | Measure-Object -Property quantity -Sum).Sum
    Write-Host "   Total stock quantity: $totalQty" -ForegroundColor Gray
} else {
    Write-Host "❌ No stock batches found!" -ForegroundColor Red
}

# 8. Test Currencies API
Write-Host "`n8️⃣ Testing Currencies API..." -ForegroundColor Yellow
$currencies = Invoke-RestMethod -Uri "http://localhost:3000/api/currency" `
    -Method GET `
    -Headers $headers

if ($currencies) {
    Write-Host "✅ Currencies retrieved: $($currencies.Count)" -ForegroundColor Green
    foreach ($curr in $currencies) {
        Write-Host "   - $($curr.code) ($($curr.name)) - Rate: $($curr.exchange_rate)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ No currencies found!" -ForegroundColor Red
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "API Verification Complete!" -ForegroundColor Green
Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "   - Authentication: Working" -ForegroundColor Green
Write-Host "   - Locations: $($locations.Count) found" -ForegroundColor Green
Write-Host "   - Users: $($users.Count) found" -ForegroundColor Green
Write-Host "   - Products: $($products.Count) found" -ForegroundColor Green
Write-Host "   - Customers: $($customers.Count) found" -ForegroundColor Green
Write-Host "   - Stock: $($stock.Count) batches" -ForegroundColor Green
Write-Host "   - Dashboard: Data available" -ForegroundColor Green
Write-Host "   - Currencies: $($currencies.Count) found" -ForegroundColor Green
