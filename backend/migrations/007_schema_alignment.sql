-- Migration 007: Schema Alignment & Fixes
-- Date: 2025-12-04
-- Purpose: Fix column name mismatches between entities and database schema

-- ============================================================
-- 1. FIX CUSTOMERS TABLE
-- ============================================================

-- Fix discount_percentage precision to match entity (12,4)
ALTER TABLE customers 
MODIFY COLUMN discount_percentage DECIMAL(12, 4) DEFAULT 0;

-- Ensure location_id column exists
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS location_id VARCHAR(36) AFTER business_id;

CREATE INDEX IF NOT EXISTS idx_customers_location ON customers(location_id);

-- ============================================================
-- 2. FIX DISCOUNTS TABLE
-- ============================================================

-- Add location_id column to discounts
ALTER TABLE discounts 
ADD COLUMN IF NOT EXISTS location_id VARCHAR(36) AFTER business_id;

CREATE INDEX IF NOT EXISTS idx_discounts_location ON discounts(location_id);

-- Ensure column naming consistency for value_type
ALTER TABLE discounts 
ADD COLUMN IF NOT EXISTS value_type VARCHAR(20) AFTER discount_type;

-- Update existing records
UPDATE discounts 
SET value_type = 'percentage' 
WHERE discount_type = 'percentage' AND value_type IS NULL;

UPDATE discounts 
SET value_type = 'fixed' 
WHERE discount_type = 'fixed_amount' AND value_type IS NULL;

-- Rename discount_value to value for consistency (optional, based on entity)
-- Note: Keep discount_value as per current entity definition

-- ============================================================
-- 3. FIX BUSINESSES TABLE
-- ============================================================

-- Add missing columns from schema
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS email VARCHAR(150) AFTER registration_number;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS phone VARCHAR(50) AFTER email;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS address TEXT AFTER phone;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS city VARCHAR(100) AFTER address;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS state VARCHAR(100) AFTER city;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS country VARCHAR(100) AFTER state;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20) AFTER country;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS website VARCHAR(255) AFTER postal_code;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS logo_url TEXT AFTER website;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active' AFTER subscription_plan;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS trial_ends_at DATE AFTER subscription_status;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS registration_number VARCHAR(100) AFTER business_type;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS tax_number VARCHAR(100) AFTER registration_number;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER registration_date;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- ============================================================
-- 4. FIX USERS TABLE
-- ============================================================

-- Add created_at if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER created_by;

-- Ensure updated_at has proper default
ALTER TABLE users 
MODIFY COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ============================================================
-- 5. FIX PRODUCTS TABLE
-- ============================================================

-- Ensure scope column exists (central vs location-specific)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS scope VARCHAR(20) DEFAULT 'central' AFTER business_id;

-- Add updated_at if missing
ALTER TABLE products 
MODIFY COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- ============================================================
-- 6. FIX LOCATIONS TABLE
-- ============================================================

-- Add missing columns
ALTER TABLE locations 
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC' AFTER manager_id;

ALTER TABLE locations 
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD' AFTER timezone;

ALTER TABLE locations 
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0 AFTER currency;

ALTER TABLE locations 
ADD COLUMN IF NOT EXISTS opening_date DATE AFTER status;

-- ============================================================
-- 7. FIX SALE_INVOICES TABLE
-- ============================================================

-- Ensure all decimal columns have consistent precision
ALTER TABLE sale_invoices 
MODIFY COLUMN subtotal DECIMAL(12, 2);

ALTER TABLE sale_invoices 
MODIFY COLUMN total DECIMAL(12, 2);

ALTER TABLE sale_invoices 
MODIFY COLUMN total_cost DECIMAL(12, 2) DEFAULT 0;

ALTER TABLE sale_invoices 
MODIFY COLUMN total_profit DECIMAL(12, 2) DEFAULT 0;

ALTER TABLE sale_invoices 
MODIFY COLUMN discount_amount DECIMAL(12, 2) DEFAULT 0;

-- Add applied_discounts JSON column if not exists
ALTER TABLE sale_invoices 
ADD COLUMN IF NOT EXISTS applied_discounts JSON AFTER discount_amount;

-- Rename discount_amount to total_discount for consistency (if needed)
-- ALTER TABLE sale_invoices 
-- CHANGE COLUMN discount_amount total_discount DECIMAL(12, 2) DEFAULT 0;

-- ============================================================
-- 8. FIX SALE_ITEMS TABLE
-- ============================================================

-- Add created_at timestamp
ALTER TABLE sale_items 
ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- ============================================================
-- 9. FIX STOCK_BATCHES TABLE
-- ============================================================

-- Ensure location_id exists
ALTER TABLE stock_batches 
ADD COLUMN IF NOT EXISTS location_id VARCHAR(36) AFTER product_id;

CREATE INDEX IF NOT EXISTS idx_stock_batches_location ON stock_batches(location_id);

-- ============================================================
-- 10. FIX CURRENCIES TABLE
-- ============================================================

-- Ensure all columns exist with proper defaults
ALTER TABLE currencies 
MODIFY COLUMN exchange_rate DECIMAL(12, 6) DEFAULT 1.000000;

-- ============================================================
-- 11. ADD MISSING INDEXES FOR PERFORMANCE
-- ============================================================

-- Business indexes
CREATE INDEX IF NOT EXISTS idx_businesses_subscription ON businesses(subscription_status);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_scope ON products(scope);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(status);

-- Sale invoice indexes
CREATE INDEX IF NOT EXISTS idx_sale_invoices_created_by ON sale_invoices(created_by);
CREATE INDEX IF NOT EXISTS idx_sale_invoices_payment_method ON sale_invoices(payment_method);

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_business_role ON users(business_id, role);

-- ============================================================
-- 12. DATA INTEGRITY CHECKS
-- ============================================================

-- Ensure all customers have valid business_id
UPDATE customers 
SET is_active = 0 
WHERE business_id IS NULL OR business_id = '';

-- Ensure all products have valid business_id
UPDATE products 
SET status = 0 
WHERE business_id IS NULL OR business_id = '';

-- Set default scope for existing products
UPDATE products 
SET scope = 'central' 
WHERE scope IS NULL OR scope = '';

-- ============================================================
-- VERIFICATION QUERIES (Comment out in production)
-- ============================================================

-- SELECT 'Customers' as table_name, COUNT(*) as count FROM customers;
-- SELECT 'Discounts' as table_name, COUNT(*) as count FROM discounts;
-- SELECT 'Products' as table_name, COUNT(*) as count FROM products;
-- SELECT 'Businesses' as table_name, COUNT(*) as count FROM businesses;
-- SELECT 'Locations' as table_name, COUNT(*) as count FROM locations;

-- SHOW COLUMNS FROM customers;
-- SHOW COLUMNS FROM discounts;
-- SHOW COLUMNS FROM businesses;
-- SHOW COLUMNS FROM products;
-- SHOW INDEXES FROM customers;
-- SHOW INDEXES FROM discounts;
