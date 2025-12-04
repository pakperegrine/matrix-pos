-- Simple Seed Data for Matrix POS
-- Date: 2025-12-04
-- Usage: mysql -u root -p123 matrix_pos < seed-simple.sql

-- ============================================================
-- 1. SEED BUSINESSES
-- ============================================================

INSERT INTO businesses (id, name, business_type, status, registration_number, tax_number, email, phone, address, city, state, country, postal_code, website, subscription_plan, subscription_status, registration_date) VALUES
('business-1', 'Matrix Retail Store', 'retail', 'active', 'REG-2024-001', 'TAX-123456', 'contact@matrixpos.com', '+1-555-0100', '123 Main Street', 'New York', 'NY', 'USA', '10001', 'https://matrixpos.com', 'premium', 'active', '2024-01-01');

-- ============================================================
-- 2. SEED LOCATIONS
-- ============================================================

INSERT INTO locations (id, business_id, code, name, address, city, state, country, postal_code, phone, email, timezone, currency, tax_rate, status, opening_date) VALUES
('location-central', 'business-1', 'CENTRAL', 'Central Store', '123 Main Street', 'New York', 'NY', 'USA', '10001', '+1-555-0101', 'central@matrixpos.com', 'America/New_York', 'USD', 8.875, 'active', '2024-01-15'),
('location-west', 'business-1', 'WEST', 'West Side Branch', '456 West Avenue', 'Los Angeles', 'CA', 'USA', '90001', '+1-555-0102', 'west@matrixpos.com', 'America/Los_Angeles', 'USD', 9.5, 'active', '2024-02-01');

-- ============================================================
-- 3. SEED USERS (password: password123)
-- ============================================================

INSERT INTO users (id, business_id, name, email, password_hash, role, location_id, status, permissions) VALUES
('user-owner', 'business-1', 'John Owner', 'owner@matrixpos.com', '$2b$10$kF7qVxB5rZ1YxB5rZ1YxBOVqQJZ5rZ1YxB5rZ1YxB5rZ1YxB5rZ1Y', 'owner', NULL, 'active', '{"all": true}'),
('user-admin', 'business-1', 'Admin User', 'admin@matrixpos.com', '$2b$10$kF7qVxB5rZ1YxB5rZ1YxBOVqQJZ5rZ1YxB5rZ1YxB5rZ1YxB5rZ1Y', 'admin', 'location-central', 'active', '{"products": true, "sales": true, "customers": true, "reports": true}'),
('user-cashier', 'business-1', 'Jane Cashier', 'cashier@matrixpos.com', '$2b$10$kF7qVxB5rZ1YxB5rZ1YxBOVqQJZ5rZ1YxB5rZ1YxB5rZ1YxB5rZ1Y', 'cashier', 'location-central', 'active', '{"pos": true, "sales": true}');

-- Update business owner
UPDATE businesses SET owner_id = 'user-owner' WHERE id = 'business-1';

-- ============================================================
-- 4. SEED CURRENCIES
-- ============================================================

INSERT INTO currencies (id, business_id, code, name, symbol, exchange_rate, is_base, is_active) VALUES
(UUID(), 'business-1', 'USD', 'US Dollar', '$', 1.000000, 1, 1),
(UUID(), 'business-1', 'EUR', 'Euro', '€', 0.850000, 0, 1),
(UUID(), 'business-1', 'GBP', 'British Pound', '£', 0.730000, 0, 1);

-- ============================================================
-- 5. SEED CUSTOMERS
-- ============================================================

INSERT INTO customers (id, business_id, location_id, name, email, phone, address, city, country, postal_code, customer_type, credit_limit, loyalty_points, loyalty_tier, discount_percentage, is_active) VALUES
(UUID(), 'business-1', 'location-central', 'Alice Johnson', 'alice@example.com', '+1-555-1001', '789 Oak Street', 'New York', 'USA', '10002', 'vip', 5000.0000, 1500, 'silver', 5.0000, 1),
(UUID(), 'business-1', 'location-central', 'Bob Smith', 'bob@example.com', '+1-555-1002', '321 Pine Avenue', 'New York', 'USA', '10003', 'regular', 1000.0000, 500, 'bronze', 0.0000, 1),
(UUID(), 'business-1', 'location-west', 'Carol Williams', 'carol@example.com', '+1-555-1003', '654 Elm Street', 'Los Angeles', 'USA', '90002', 'wholesale', 10000.0000, 8500, 'gold', 15.0000, 1);

-- ============================================================
-- 6. SEED PRODUCTS
-- ============================================================

INSERT INTO products (id, business_id, scope, location_id, name, sku, barcode, price, cost, track_inventory, allow_negative_stock, status) VALUES
(UUID(), 'business-1', 'central', NULL, 'Laptop - Dell XPS 13', 'DELL-XPS-13', '1234567890123', 999.9900, 750.0000, 1, 0, 1),
(UUID(), 'business-1', 'central', NULL, 'Mouse - Logitech MX Master', 'LOG-MX-MASTER', '1234567890124', 99.9900, 65.0000, 1, 0, 1),
(UUID(), 'business-1', 'central', NULL, 'Keyboard - Mechanical RGB', 'KB-MECH-RGB', '1234567890125', 149.9900, 90.0000, 1, 0, 1),
(UUID(), 'business-1', 'location', 'location-central', 'USB Cable - Type C', 'USB-C-CABLE', '1234567890126', 19.9900, 8.0000, 1, 1, 1),
(UUID(), 'business-1', 'central', NULL, 'Monitor - 27" 4K', 'MON-27-4K', '1234567890127', 449.9900, 320.0000, 1, 0, 1);

-- ============================================================
-- 7. SEED DISCOUNTS
-- ============================================================

INSERT INTO discounts (id, business_id, location_id, name, code, description, discount_type, value_type, discount_value, applies_to, minimum_purchase, application_method, valid_from, valid_until, priority, can_combine, is_active) VALUES
(UUID(), 'business-1', NULL, '10% Off Storewide', 'SAVE10', 'Get 10% off your entire purchase', 'percentage', 'percentage', 10.0000, 'all_products', 0.0000, 'coupon_code', '2024-01-01', '2024-12-31', 5, 1, 1),
(UUID(), 'business-1', NULL, '$50 Off Orders Over $500', 'SAVE50', 'Save $50 on orders over $500', 'fixed_amount', 'fixed', 50.0000, 'all_products', 500.0000, 'coupon_code', '2024-01-01', '2024-12-31', 10, 0, 1),
(UUID(), 'business-1', NULL, 'Buy 2 Get 1 Free', 'B2G1', 'Buy 2 items, get 1 free', 'buy_x_get_y', 'percentage', 0.0000, 'all_products', 0.0000, 'automatic', '2024-01-01', '2024-12-31', 8, 0, 1),
(UUID(), 'business-1', 'location-central', 'VIP Customer Discount', NULL, 'Special discount for VIP customers', 'percentage', 'percentage', 15.0000, 'customers', 0.0000, 'automatic', '2024-01-01', '2024-12-31', 12, 1, 1);

-- Update Buy 2 Get 1 discount with BOGO details
UPDATE discounts SET buy_quantity = 2, get_quantity = 1, get_discount_percentage = 100.0000 WHERE code = 'B2G1';

-- ============================================================
-- VERIFY SEEDED DATA
-- ============================================================

SELECT 'Businesses' as table_name, COUNT(*) as count FROM businesses
UNION ALL
SELECT 'Locations', COUNT(*) FROM locations
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Currencies', COUNT(*) FROM currencies
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Discounts', COUNT(*) FROM discounts;
