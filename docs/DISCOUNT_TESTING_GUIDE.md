# Discount & Promotion Engine - Testing & Verification Guide

## Test Environment
- Backend: http://localhost:3000/api
- Frontend: http://localhost:4200
- Database: SQLite (dev.sqlite)

## Backend API Testing

### 1. List All Discounts
```powershell
$response = Invoke-RestMethod -Method GET -Uri "http://localhost:3000/api/discounts"
$response | ConvertTo-Json -Depth 5
```

**Expected Response:**
```json
{
  "discounts": [],
  "total": 0
}
```

### 2. Create Percentage Discount
```powershell
$body = @{
  name = "Summer Sale 20%"
  code = "SUMMER20"
  description = "20% off all products this summer"
  discount_type = "percentage"
  discount_value = 20
  applies_to = "all_products"
  minimum_purchase = 0
  minimum_quantity = 0
  application_method = "coupon_code"
  priority = 5
  can_combine = $true
  is_active = $true
  valid_from = "2024-06-01T00:00:00"
  valid_until = "2024-08-31T23:59:59"
} | ConvertTo-Json

$discount = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/discounts" -ContentType "application/json" -Body $body
$discount | ConvertTo-Json
```

### 3. Create Fixed Amount Discount
```powershell
$body = @{
  name = "$10 Off Orders Over $100"
  code = "SAVE10"
  discount_type = "fixed_amount"
  discount_value = 10
  applies_to = "all_products"
  minimum_purchase = 100
  application_method = "automatic"
  priority = 3
  can_combine = $true
  is_active = $true
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/discounts" -ContentType "application/json" -Body $body
```

### 4. Create Buy X Get Y Discount
```powershell
$body = @{
  name = "Buy 2 Get 1 Free"
  discount_type = "buy_x_get_y"
  discount_value = 0
  applies_to = "all_products"
  application_method = "automatic"
  priority = 10
  buy_quantity = 2
  get_quantity = 1
  get_discount_percentage = 100
  is_active = $true
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/discounts" -ContentType "application/json" -Body $body
```

### 5. Create Bulk Discount
```powershell
$body = @{
  name = "Volume Discount"
  discount_type = "bulk_discount"
  discount_value = 0
  applies_to = "all_products"
  application_method = "automatic"
  priority = 7
  bulk_tiers = @(
    @{ quantity = 10; discount = 10 },
    @{ quantity = 25; discount = 15 },
    @{ quantity = 50; discount = 20 }
  )
  is_active = $true
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/discounts" -ContentType "application/json" -Body $body
```

### 6. Validate Coupon Code
```powershell
$body = @{
  code = "SUMMER20"
  cart_total = 150.00
} | ConvertTo-Json

$validation = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/discounts/validate-code" -ContentType "application/json" -Body $body
$validation | ConvertTo-Json
```

**Expected Response:**
```json
{
  "valid": true,
  "discount": { ... discount object ... }
}
```

### 7. Calculate Discounts for Cart
```powershell
$body = @{
  cart_items = @(
    @{ product_id = "prod-1"; quantity = 3; unit_price = 50.00 },
    @{ product_id = "prod-2"; quantity = 15; unit_price = 20.00 }
  )
  coupon_codes = @("SUMMER20")
} | ConvertTo-Json

$calculation = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/discounts/calculate" -ContentType "application/json" -Body $body
$calculation | ConvertTo-Json
```

**Expected Response:**
```json
{
  "applied_discounts": [
    {
      "discount_id": "...",
      "discount_name": "Summer Sale 20%",
      "discount_type": "percentage",
      "discount_amount": 90.00,
      "applied_to_items": ["prod-1", "prod-2"]
    }
  ],
  "total_discount": 90.00,
  "subtotal": 450.00,
  "final_total": 360.00
}
```

### 8. Get Active Discounts
```powershell
$active = Invoke-RestMethod -Method GET -Uri "http://localhost:3000/api/discounts/active"
$active | ConvertTo-Json
```

### 9. Get Usage Statistics
```powershell
# Replace {id} with actual discount ID
$stats = Invoke-RestMethod -Method GET -Uri "http://localhost:3000/api/discounts/{id}/usage-stats"
$stats | ConvertTo-Json
```

### 10. Update Discount
```powershell
$body = @{
  is_active = $false
} | ConvertTo-Json

# Replace {id} with actual discount ID
Invoke-RestMethod -Method PUT -Uri "http://localhost:3000/api/discounts/{id}" -ContentType "application/json" -Body $body
```

### 11. Delete Discount
```powershell
# Replace {id} with actual discount ID
Invoke-RestMethod -Method DELETE -Uri "http://localhost:3000/api/discounts/{id}"
```

## Frontend UI Testing

### Access Discount Management
1. Navigate to http://localhost:4200
2. Click "🏷️ Discounts" in the sidebar
3. Should see Discount Management page

### Create Discount via UI
1. Click "Create Discount" button
2. Fill in form:
   - Name: "Test Discount"
   - Type: Select from dropdown
   - Value: Enter percentage or amount
   - Code: Optional coupon code
3. Configure rules (minimum purchase, quantity, etc.)
4. Set validity dates
5. Click "Create Discount"
6. Should appear in table

### Test Filters
1. Type in search box → filters by name/code
2. Select discount type → filters by type
3. Select status → filters active/inactive
4. Count should update

### Test Pagination
1. Create 15+ discounts
2. Should show 10 per page
3. Click "Next" → shows next 10
4. Page info should update

### Test Edit
1. Click edit (✎) button on any discount
2. Modal opens with pre-filled data
3. Change values
4. Click "Update Discount"
5. Table refreshes with new values

### Test Delete
1. Click delete (🗑) button
2. Confirm dialog appears
3. Click OK
4. Discount removed from list

### Test Status Toggle
1. Click toggle switch on any discount
2. Status changes (Active ↔ Inactive)
3. Backend updated immediately

## Discount Calculation Testing

### Test Case 1: Single Percentage Discount
**Setup:**
- Cart: 3 items @ $50 each = $150
- Discount: 20% off

**Expected:**
- Discount Amount: $30
- Final Total: $120

### Test Case 2: Fixed Amount Discount
**Setup:**
- Cart: $200
- Discount: $10 off orders over $100

**Expected:**
- Discount Amount: $10
- Final Total: $190

### Test Case 3: Buy 2 Get 1 Free
**Setup:**
- Cart: 5 items @ $30 each = $150
- Discount: Buy 2 Get 1 Free (100% off)

**Expected:**
- Sets: floor(5 / 2) = 2
- Free items: 2 × 1 = 2
- Discount Amount: $60 (2 items free)
- Final Total: $90

### Test Case 4: Bulk Discount
**Setup:**
- Cart: 30 items @ $10 each = $300
- Tiers: 10+ = 10%, 25+ = 15%, 50+ = 20%

**Expected:**
- Applicable tier: 25+ (15% off)
- Discount Amount: $45
- Final Total: $255

### Test Case 5: Multiple Discounts (Stacked)
**Setup:**
- Cart: $500
- Discount 1: 10% off (priority 5, can_combine)
- Discount 2: $20 off (priority 3, can_combine)

**Expected:**
- Discount 1 Applied: $50 (higher priority)
- Discount 2 Applied: $20
- Total Discount: $70
- Final Total: $430

### Test Case 6: Non-Combinable Discount
**Setup:**
- Cart: $300
- Discount 1: 20% off (priority 10, can_combine = false)
- Discount 2: $30 off (priority 5, can_combine = true)

**Expected:**
- Only Discount 1 Applied: $60
- Final Total: $240

## Multi-Tenant Testing

### Verify Business Isolation
1. Create discount with business_id = "business-a"
2. Query with business_id = "business-b"
3. Should return empty result
4. Query with business_id = "business-a"
5. Should return the discount

### PowerShell Test:
```powershell
# Create discount for business A
$headers = @{ "X-Business-ID" = "business-a" }
$body = @{ name = "Business A Discount"; discount_type = "percentage"; discount_value = 10; ... } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/discounts" -Headers $headers -ContentType "application/json" -Body $body

# Try to fetch from business B
$headers = @{ "X-Business-ID" = "business-b" }
$result = Invoke-RestMethod -Method GET -Uri "http://localhost:3000/api/discounts" -Headers $headers
# Should return empty array
```

## Edge Cases Testing

### 1. Expired Discount
- Create discount with valid_until in the past
- Should not appear in /discounts/active
- validate-code should return "expired"

### 2. Not Started Discount
- Create discount with valid_from in the future
- Should not appear in /discounts/active
- validate-code should return "not yet valid"

### 3. Usage Limit Reached
- Create discount with maximum_uses = 1
- Apply to 2 transactions
- Second should fail with "usage limit reached"

### 4. Minimum Purchase Not Met
- Discount requires $100 minimum
- Cart total = $50
- validate-code should return false with message

### 5. Duplicate Coupon Code
- Create discount with code "TEST"
- Try to create another with code "TEST" (same business)
- Should return 400 error "Coupon code already exists"

### 6. Invalid Discount Type
- Try to create discount with type "invalid_type"
- Should return 400 error

### 7. Percentage > 100
- Try to set discount_value = 150 for percentage type
- Should return 400 error

### 8. Empty Cart Calculation
- Call /calculate with empty cart_items array
- Should return 0 discount

## Performance Testing

### Load Test: Calculate Discounts
```powershell
# Test with 100 items and 10 discounts
Measure-Command {
  1..100 | ForEach-Object {
    $body = @{
      cart_items = @(
        @{ product_id = "p1"; quantity = 10; unit_price = 25 }
      )
    } | ConvertTo-Json
    Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/discounts/calculate" -ContentType "application/json" -Body $body
  }
}
```

**Expected:** < 2 seconds for 100 calculations

## Database Verification

### Check Discount Table
```powershell
sqlite3 backend/dev.sqlite "SELECT COUNT(*) FROM discounts;"
sqlite3 backend/dev.sqlite "SELECT id, name, discount_type, is_active FROM discounts LIMIT 10;"
```

### Check Multi-Tenancy
```powershell
sqlite3 backend/dev.sqlite "SELECT DISTINCT business_id FROM discounts;"
# Should show only business IDs created
```

### Check Usage Log
```powershell
sqlite3 backend/dev.sqlite "SELECT COUNT(*) FROM discount_usage_log;"
sqlite3 backend/dev.sqlite "SELECT * FROM discount_usage_log LIMIT 5;"
```

## Integration Checklist

- [ ] Backend compiles without errors
- [ ] All 9 endpoints registered
- [ ] Frontend compiles without errors
- [ ] Discount Management page accessible
- [ ] Create discount works via UI
- [ ] Create discount works via API
- [ ] Edit discount works
- [ ] Delete discount works
- [ ] Status toggle works
- [ ] Search filter works
- [ ] Type filter works
- [ ] Status filter works
- [ ] Pagination works
- [ ] Coupon validation works
- [ ] Discount calculation works (4 types)
- [ ] Multi-tenant isolation works
- [ ] Usage limits enforced
- [ ] Date validation works
- [ ] Minimum purchase enforced
- [ ] Discount stacking works
- [ ] Non-combinable discounts work
- [ ] Database migration applied

## Success Criteria

✅ All backend endpoints respond correctly
✅ Frontend UI loads without errors
✅ CRUD operations work in UI
✅ Discount calculations return correct amounts
✅ Multi-tenant queries isolated properly
✅ Edge cases handled gracefully
✅ No memory leaks in calculation
✅ Performance acceptable (< 100ms per calculation)

## Next Phase: POS Integration

After verification complete, proceed to:
1. Add discount dropdown in POS checkout
2. Add coupon code input field
3. Real-time discount calculation
4. Receipt integration
5. Customer loyalty linking
6. Transaction history with discounts

## Troubleshooting

### Backend Won't Start
```powershell
cd c:\pos_repo\backend
npm install
npm run build
npm start
```

### Frontend Compilation Errors
```powershell
cd c:\pos_repo\frontend
npm install
ng serve
```

### Database Issues
```powershell
# Re-run migration
Get-Content migrations/003_discounts.sql | sqlite3 backend/dev.sqlite
```

### CORS Errors
Check `backend/src/main.ts` has:
```typescript
app.enableCors();
```

---

**Document Version:** 1.0
**Last Updated:** November 30, 2025
**Status:** Ready for Testing
