Write-Host 'Testing location_id in API' -ForegroundColor Cyan
$login = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -ContentType 'application/json' -Body '{\"email\":\"owner@pos.com\",\"password\":\"password123\"}'
$token = $login.access_token
$bid = '3abc701e-15ee-4bf8-9668-87903ccd2506'
$loc1 = 'e2ea61f0-351f-48ee-81bd-834a0e5319dc'
$loc2 = 'fa449f18-2d96-419c-bce2-ce3e5b73f140'
$h = @{Authorization='Bearer ' + $token}
$c = Invoke-RestMethod -Uri ('http://localhost:3000/api/customers?business_id=' + $bid) -Headers $h
Write-Host ('Total customers: ' + $c.total)
Write-Host ('Has location_id: ' + ([bool]$c.customers[0].location_id))
$c1 = Invoke-RestMethod -Uri ('http://localhost:3000/api/customers?business_id=' + $bid + '&location_id=' + $loc1) -Headers $h
Write-Host ('Downtown: ' + $c1.total)
$c2 = Invoke-RestMethod -Uri ('http://localhost:3000/api/customers?business_id=' + $bid + '&location_id=' + $loc2) -Headers $h
Write-Host ('Uptown: ' + $c2.total)
