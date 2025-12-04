# Quick Start Guide - Schema Fixes

## For Fresh Database Installation

```bash
# 1. Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS matrix_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Run complete correct schema
mysql -u root -p matrix_pos < backend/migrations/008_complete_correct_schema.sql

# 3. Run seed data
cd backend
npm install
node seed-complete-correct.js

# 4. Start backend
npm run start:dev

# 5. Start frontend (new terminal)
cd ../frontend
npm start
```

## For Existing Database (Migration)

```bash
# 1. BACKUP FIRST!
mysqldump -u root -p matrix_pos > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Apply alignment migration
mysql -u root -p matrix_pos < backend/migrations/007_schema_alignment.sql

# 3. Verify
mysql -u root -p matrix_pos -e "SHOW COLUMNS FROM businesses"
mysql -u root -p matrix_pos -e "SELECT COUNT(*) FROM businesses"

# 4. If needed, seed additional data
cd backend
node seed-complete-correct.js
```

## Verify Everything Works

```bash
# Check all tables exist
mysql -u root -p matrix_pos -e "SHOW TABLES;"

# Check row counts
mysql -u root -p matrix_pos -e "
SELECT 
  (SELECT COUNT(*) FROM businesses) as businesses,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM locations) as locations,
  (SELECT COUNT(*) FROM products) as products,
  (SELECT COUNT(*) FROM customers) as customers,
  (SELECT COUNT(*) FROM discounts) as discounts
FROM DUAL;
"

# Test login API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@matrixpos.com","password":"password123"}'
```

## Default Credentials

```
Owner:   owner@matrixpos.com / password123
Admin:   admin@matrixpos.com / password123
Cashier: cashier@matrixpos.com / password123
```

## Troubleshooting

### If seed fails with "Cannot find module"
```bash
cd backend
npm install typeorm mysql2 bcrypt uuid
```

### If migration shows "column already exists"
```bash
# That's OK! Migration uses "IF NOT EXISTS" clauses
# Just means some columns were already added
```

### If you need to start completely fresh
```bash
mysql -u root -p -e "DROP DATABASE matrix_pos;"
mysql -u root -p -e "CREATE DATABASE matrix_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p matrix_pos < backend/migrations/008_complete_correct_schema.sql
cd backend && node seed-complete-correct.js
```

## Files Modified

### Entities (5 files)
- `backend/src/entities/business.entity.ts` ✓
- `backend/src/entities/user.entity.ts` ✓
- `backend/src/entities/product.entity.ts` ✓
- `backend/src/entities/sale-invoice.entity.ts` ✓
- `backend/src/entities/sale-item.entity.ts` ✓

### Migrations (2 new files)
- `backend/migrations/007_schema_alignment.sql` (for existing DBs)
- `backend/migrations/008_complete_correct_schema.sql` (for fresh install)

### Seeds (1 new file)
- `backend/seed-complete-correct.js` (complete seed with all data)

### Documentation (2 new files)
- `docs/SCHEMA_FIX_SUMMARY.md` (detailed explanation)
- `docs/SCHEMA_QUICKSTART.md` (this file)
