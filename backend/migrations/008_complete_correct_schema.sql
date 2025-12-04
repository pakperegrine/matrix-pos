-- Complete Correct Schema for Matrix POS (MySQL/MariaDB)
-- Date: 2025-12-04
-- Purpose: Definitive schema aligned with TypeORM entities
-- This is the CORRECT schema that matches all entities exactly

-- ============================================================
-- DROP ALL TABLES (Fresh Install Only - Comment out for migration)
-- ============================================================

-- SET FOREIGN_KEY_CHECKS = 0;

-- DROP TABLE IF EXISTS discount_usage_log;
-- DROP TABLE IF EXISTS sale_items;
-- DROP TABLE IF EXISTS sale_invoices;
-- DROP TABLE IF EXISTS cash_movements;
-- DROP TABLE IF EXISTS cash_shifts;
-- DROP TABLE IF EXISTS drawer_events;
-- DROP TABLE IF EXISTS shift_sales_summary;
-- DROP TABLE IF EXISTS supervisor_approvals;
-- DROP TABLE IF EXISTS stock_forecasts;
-- DROP TABLE IF EXISTS stock_batches;
-- DROP TABLE IF EXISTS products;
-- DROP TABLE IF EXISTS discounts;
-- DROP TABLE IF EXISTS customers;
-- DROP TABLE IF EXISTS currencies;
-- DROP TABLE IF EXISTS business_statistics;
-- DROP TABLE IF EXISTS user_sessions;
-- DROP TABLE IF EXISTS locations;
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS businesses;
-- DROP TABLE IF EXISTS categories;
-- DROP TABLE IF EXISTS units;
-- DROP TABLE IF EXISTS settings;

-- SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. BUSINESSES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS businesses (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  owner_id VARCHAR(36),
  status VARCHAR(20) DEFAULT 'active',
  business_type VARCHAR(100),
  registration_number VARCHAR(100),
  tax_number VARCHAR(100),
  email VARCHAR(150),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  website VARCHAR(255),
  logo_url TEXT,
  subscription_plan VARCHAR(50) DEFAULT 'basic',
  subscription_status VARCHAR(20) DEFAULT 'active',
  trial_ends_at DATE,
  subscription_expires DATETIME,
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_businesses_status (status),
  INDEX idx_businesses_owner (owner_id),
  INDEX idx_businesses_subscription (subscription_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 2. LOCATIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS locations (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36) NOT NULL,
  code VARCHAR(20),
  name VARCHAR(150) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  phone VARCHAR(50),
  email VARCHAR(150),
  manager_id VARCHAR(36),
  timezone VARCHAR(50) DEFAULT 'UTC',
  currency VARCHAR(10) DEFAULT 'USD',
  tax_rate DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  opening_date DATE,
  opening_hours TEXT,
  settings TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_locations_business_id (business_id),
  INDEX idx_locations_status (status),
  INDEX idx_locations_code (business_id, code),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 3. USERS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36),
  name VARCHAR(150),
  email VARCHAR(150),
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'cashier',
  location_id VARCHAR(36),
  status VARCHAR(20) DEFAULT 'active',
  permissions TEXT,
  last_login DATETIME,
  created_by VARCHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_users_business_id (business_id),
  INDEX idx_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_status (status),
  INDEX idx_users_location (location_id),
  INDEX idx_users_business_role (business_id, role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 4. USER_SESSIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  business_id VARCHAR(36) NOT NULL,
  location_id VARCHAR(36),
  login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  logout_time DATETIME,
  ip_address VARCHAR(50),
  user_agent TEXT,
  session_duration INT,
  status VARCHAR(20) DEFAULT 'active',
  
  INDEX idx_user_sessions_user (user_id),
  INDEX idx_user_sessions_business (business_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 5. BUSINESS_STATISTICS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS business_statistics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  business_id VARCHAR(36) NOT NULL,
  location_id VARCHAR(36),
  date DATE NOT NULL,
  stat_date DATE NOT NULL,
  total_sales DECIMAL(12, 2) DEFAULT 0,
  total_transactions INT DEFAULT 0,
  total_profit DECIMAL(12, 2) DEFAULT 0,
  total_customers INT DEFAULT 0,
  new_customers INT DEFAULT 0,
  active_locations INT DEFAULT 0,
  average_transaction DECIMAL(14, 2) DEFAULT 0,
  top_product_id VARCHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_business_statistics_business_date (business_id, date),
  INDEX idx_stats_business (business_id),
  INDEX idx_stats_location (location_id),
  INDEX idx_stats_date (stat_date),
  UNIQUE KEY unique_business_location_date (business_id, location_id, stat_date),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 6. SETTINGS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  business_id VARCHAR(36) NOT NULL,
  location_id VARCHAR(36),
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_settings_business_key (business_id, setting_key),
  INDEX idx_settings_location_key (location_id, setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 7. CURRENCIES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS currencies (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36) NOT NULL,
  code VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10),
  exchange_rate DECIMAL(12, 6) DEFAULT 1.000000,
  is_base TINYINT DEFAULT 0,
  is_active TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_currencies_business (business_id),
  INDEX idx_currencies_code (business_id, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 8. CUSTOMERS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36) NOT NULL,
  location_id VARCHAR(36),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  date_of_birth DATE,
  customer_type VARCHAR(50) DEFAULT 'regular',
  credit_limit DECIMAL(12, 4) DEFAULT 0,
  current_balance DECIMAL(12, 4) DEFAULT 0,
  loyalty_points INT DEFAULT 0,
  loyalty_tier VARCHAR(50) DEFAULT 'bronze',
  total_purchases DECIMAL(12, 4) DEFAULT 0,
  purchase_count INT DEFAULT 0,
  discount_percentage DECIMAL(12, 4) DEFAULT 0,
  notes TEXT,
  is_active TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_purchase_date DATETIME,
  
  INDEX idx_customers_business_id (business_id),
  INDEX idx_customers_location (location_id),
  INDEX idx_customers_email (business_id, email),
  INDEX idx_customers_phone (business_id, phone),
  INDEX idx_customers_type (customer_type),
  INDEX idx_customers_tier (loyalty_tier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 9. DISCOUNTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS discounts (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36) NOT NULL,
  location_id VARCHAR(36),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100),
  description TEXT,
  discount_type VARCHAR(50) NOT NULL,
  value_type VARCHAR(20) NOT NULL,
  discount_value DECIMAL(12, 4) NOT NULL,
  applies_to VARCHAR(50) DEFAULT 'invoice',
  applies_to_ids JSON,
  minimum_purchase DECIMAL(12, 4) DEFAULT 0,
  minimum_quantity INT DEFAULT 0,
  maximum_uses INT,
  current_uses INT DEFAULT 0,
  max_uses_per_customer INT,
  valid_from DATETIME,
  valid_until DATETIME,
  application_method VARCHAR(50) DEFAULT 'manual',
  priority INT DEFAULT 0,
  can_combine TINYINT DEFAULT 1,
  is_active TINYINT DEFAULT 1,
  buy_quantity INT,
  get_quantity INT,
  get_discount_percentage DECIMAL(12, 4),
  bulk_tiers JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_discounts_business (business_id),
  INDEX idx_discounts_location (location_id),
  INDEX idx_discounts_code (code),
  INDEX idx_discounts_type (discount_type),
  INDEX idx_discounts_active (is_active),
  INDEX idx_discounts_valid_dates (valid_from, valid_until),
  UNIQUE KEY unique_business_code (business_id, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 10. DISCOUNT_USAGE_LOG TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS discount_usage_log (
  id VARCHAR(36) PRIMARY KEY,
  discount_id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36),
  sale_invoice_id VARCHAR(36),
  discount_amount DECIMAL(12, 4) NOT NULL,
  used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_discount_usage_discount (discount_id),
  INDEX idx_discount_usage_customer (customer_id),
  INDEX idx_discount_usage_invoice (sale_invoice_id),
  FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 11. CATEGORIES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36),
  name VARCHAR(100),
  parent_id VARCHAR(36),
  
  INDEX idx_categories_business (business_id),
  INDEX idx_categories_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 12. UNITS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS units (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36),
  name VARCHAR(50),
  short_name VARCHAR(10),
  
  INDEX idx_units_business (business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 13. PRODUCTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36) NOT NULL,
  scope VARCHAR(20) DEFAULT 'central',
  location_id VARCHAR(36),
  category_id VARCHAR(36),
  unit_id VARCHAR(36),
  name VARCHAR(200) NOT NULL,
  barcode VARCHAR(100),
  sku VARCHAR(100),
  price DECIMAL(12,4) DEFAULT 0,
  cost DECIMAL(12,4) DEFAULT 0,
  track_inventory TINYINT DEFAULT 1,
  allow_negative_stock TINYINT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_products_business_id (business_id),
  INDEX idx_products_location_id (location_id),
  INDEX idx_products_category (category_id),
  INDEX idx_products_scope (scope),
  INDEX idx_products_barcode (barcode),
  INDEX idx_products_sku (sku),
  INDEX idx_products_active (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 14. STOCK_BATCHES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS stock_batches (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  location_id VARCHAR(36),
  quantity DECIMAL(14,4) NOT NULL,
  cost_price DECIMAL(12,4) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_stock_batches_product (product_id),
  INDEX idx_stock_batches_location (location_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 15. STOCK_FORECASTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS stock_forecasts (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  location_id VARCHAR(36),
  forecast_date DATE NOT NULL,
  forecasted_demand DECIMAL(14, 4),
  current_stock DECIMAL(14, 4),
  reorder_point DECIMAL(14, 4),
  optimal_stock DECIMAL(14, 4),
  confidence_score DECIMAL(5, 2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_stock_forecasts_product (product_id),
  INDEX idx_stock_forecasts_location (location_id),
  INDEX idx_stock_forecasts_date (forecast_date),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 16. SALE_INVOICES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS sale_invoices (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36),
  location_id VARCHAR(36),
  customer_id VARCHAR(36),
  subtotal DECIMAL(12,2),
  total DECIMAL(12,2),
  total_cost DECIMAL(12,2) DEFAULT 0,
  total_profit DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  applied_discounts JSON,
  payment_method VARCHAR(50),
  invoice_no VARCHAR(100),
  source VARCHAR(50),
  created_by VARCHAR(36),
  sale_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_sale_invoices_business_id (business_id),
  INDEX idx_sale_invoices_location_id (location_id),
  INDEX idx_sale_invoices_customer_id (customer_id),
  INDEX idx_sale_invoices_sale_date (sale_date),
  INDEX idx_sale_invoices_business_date (business_id, sale_date),
  INDEX idx_sale_invoices_location_date (location_id, sale_date),
  INDEX idx_sale_invoices_created_by (created_by),
  INDEX idx_sale_invoices_payment_method (payment_method),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 17. SALE_ITEMS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS sale_items (
  id VARCHAR(36) PRIMARY KEY,
  invoice_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36),
  quantity DECIMAL(14,4) NOT NULL,
  sale_price DECIMAL(12,4) NOT NULL,
  fifo_cost DECIMAL(12,4),
  total_cost DECIMAL(12,4),
  profit DECIMAL(12,4),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_sale_items_invoice (invoice_id),
  INDEX idx_sale_items_product (product_id),
  FOREIGN KEY (invoice_id) REFERENCES sale_invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 18. CASH_SHIFTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS cash_shifts (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(255) NOT NULL,
  location_id VARCHAR(36),
  cashier_id VARCHAR(36) NOT NULL,
  terminal_id VARCHAR(50),
  shift_number INT,
  opening_float DECIMAL(10, 2) DEFAULT 0.00,
  opening_time DATETIME NOT NULL,
  opening_approved_by VARCHAR(36),
  opening_approved_at DATETIME,
  expected_cash DECIMAL(10, 2) DEFAULT 0.00,
  actual_cash DECIMAL(10, 2) DEFAULT 0.00,
  variance DECIMAL(10, 2) DEFAULT 0.00,
  closing_time DATETIME,
  closing_approved_by VARCHAR(36),
  closing_approved_at DATETIME,
  status VARCHAR(20) DEFAULT 'open',
  notes TEXT,
  total_cash_sales DECIMAL(10, 2) DEFAULT 0.00,
  total_card_sales DECIMAL(10, 2) DEFAULT 0.00,
  total_sales DECIMAL(10, 2) DEFAULT 0.00,
  total_discounts DECIMAL(10, 2) DEFAULT 0.00,
  total_refunds DECIMAL(10, 2) DEFAULT 0.00,
  total_voids DECIMAL(10, 2) DEFAULT 0.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_cash_shifts_business_cashier (business_id, cashier_id),
  INDEX idx_cash_shifts_status (status),
  INDEX idx_cash_shifts_opening_time (opening_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 19. CASH_MOVEMENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS cash_movements (
  id VARCHAR(36) PRIMARY KEY,
  shift_id VARCHAR(36) NOT NULL,
  business_id VARCHAR(255) NOT NULL,
  location_id VARCHAR(36),
  movement_type VARCHAR(20) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  reason VARCHAR(255),
  notes TEXT,
  performed_by VARCHAR(36) NOT NULL,
  approved_by VARCHAR(36),
  approved_at DATETIME,
  reference_type VARCHAR(50),
  reference_id VARCHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_cash_movements_shift (shift_id),
  INDEX idx_cash_movements_type (movement_type),
  INDEX idx_cash_movements_created (created_at),
  FOREIGN KEY (shift_id) REFERENCES cash_shifts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 20. DRAWER_EVENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS drawer_events (
  id VARCHAR(36) PRIMARY KEY,
  shift_id VARCHAR(36),
  business_id VARCHAR(255) NOT NULL,
  terminal_id VARCHAR(50),
  event_type VARCHAR(50) NOT NULL,
  reason VARCHAR(255),
  opened_by VARCHAR(36) NOT NULL,
  reference_type VARCHAR(50),
  reference_id VARCHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_drawer_events_shift (shift_id),
  INDEX idx_drawer_events_type (event_type),
  INDEX idx_drawer_events_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- COMPLETE SCHEMA CREATED SUCCESSFULLY
-- ============================================================
