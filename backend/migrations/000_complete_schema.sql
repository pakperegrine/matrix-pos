-- Complete POS Schema (SQLite)
-- Date: 2025-12-04
-- Merged from all migrations

-- Drop existing tables
DROP TABLE IF EXISTS sale_items;
DROP TABLE IF EXISTS sale_invoices;
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS stock_batches;
DROP TABLE IF EXISTS stock_forecasts;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS units;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS discounts;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS currencies;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS business_statistics;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS businesses;

-- Businesses table
CREATE TABLE businesses (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
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
  status VARCHAR(20) DEFAULT 'active',
  registration_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

CREATE INDEX idx_businesses_status ON businesses(status);

-- Users table
CREATE TABLE users (
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
  updated_at DATETIME
);

CREATE INDEX idx_users_business_id ON users(business_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_location ON users(location_id);

-- Locations table
CREATE TABLE locations (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36) NOT NULL,
  code VARCHAR(20) NOT NULL,
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

CREATE INDEX idx_locations_business_id ON locations(business_id);
CREATE INDEX idx_locations_status ON locations(status);
CREATE INDEX idx_locations_code ON locations(business_id, code);

-- Business Statistics table
CREATE TABLE business_statistics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id VARCHAR(36) NOT NULL,
  date DATE NOT NULL,
  total_sales DECIMAL(12, 2) DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  total_profit DECIMAL(12, 2) DEFAULT 0,
  total_customers INTEGER DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  active_locations INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_business_statistics_business_date ON business_statistics(business_id, date);

-- User Sessions table
CREATE TABLE user_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  business_id VARCHAR(36) NOT NULL,
  location_id VARCHAR(36),
  login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  logout_time DATETIME,
  ip_address VARCHAR(50),
  user_agent TEXT,
  session_duration INTEGER,
  status VARCHAR(20) DEFAULT 'active'
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_business ON user_sessions(business_id);

-- Settings table
CREATE TABLE settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id VARCHAR(36) NOT NULL,
  location_id VARCHAR(36),
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

CREATE INDEX idx_settings_business_key ON settings(business_id, setting_key);
CREATE INDEX idx_settings_location_key ON settings(location_id, setting_key);

-- Currencies table
CREATE TABLE currencies (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36) NOT NULL,
  code VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10),
  exchange_rate DECIMAL(12, 6) DEFAULT 1.000000,
  is_base TINYINT DEFAULT 0,
  is_active TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

CREATE INDEX idx_currencies_business ON currencies(business_id);
CREATE INDEX idx_currencies_code ON currencies(business_id, code);

-- Customers table
CREATE TABLE customers (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36) NOT NULL,
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
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  notes TEXT,
  is_active TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  last_purchase_date DATETIME
);

CREATE INDEX idx_customers_business_id ON customers(business_id);
CREATE INDEX idx_customers_email ON customers(business_id, email);
CREATE INDEX idx_customers_phone ON customers(business_id, phone);

-- Discounts table
CREATE TABLE discounts (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  discount_type VARCHAR(50) NOT NULL,
  value_type VARCHAR(20) NOT NULL,
  value DECIMAL(12, 4) NOT NULL,
  applies_to VARCHAR(50) DEFAULT 'invoice',
  min_purchase_amount DECIMAL(12, 4) DEFAULT 0,
  max_discount_amount DECIMAL(12, 4),
  customer_type VARCHAR(50),
  start_date DATE,
  end_date DATE,
  is_active TINYINT DEFAULT 1,
  priority INT DEFAULT 0,
  combinable TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

CREATE INDEX idx_discounts_business ON discounts(business_id);
CREATE INDEX idx_discounts_type ON discounts(discount_type);

-- Categories table
CREATE TABLE categories (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36),
  name VARCHAR(100),
  parent_id VARCHAR(36)
);

CREATE INDEX idx_categories_business ON categories(business_id);

-- Units table
CREATE TABLE units (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36),
  name VARCHAR(50),
  short_name VARCHAR(10)
);

CREATE INDEX idx_units_business ON units(business_id);

-- Products table
CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36),
  location_id VARCHAR(36),
  category_id VARCHAR(36),
  unit_id VARCHAR(36),
  name VARCHAR(200),
  barcode VARCHAR(100),
  sku VARCHAR(100),
  price DECIMAL(12,4) DEFAULT 0,
  cost DECIMAL(12,4) DEFAULT 0,
  track_inventory TINYINT DEFAULT 1,
  allow_negative_stock TINYINT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_business_id ON products(business_id);
CREATE INDEX idx_products_location_id ON products(location_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_sku ON products(sku);

-- Stock Batches table
CREATE TABLE stock_batches (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36),
  location_id VARCHAR(36),
  quantity DECIMAL(14,4),
  cost_price DECIMAL(12,4),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_batches_product ON stock_batches(product_id);
CREATE INDEX idx_stock_batches_location ON stock_batches(location_id);

-- Stock Forecasts table
CREATE TABLE stock_forecasts (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36),
  location_id VARCHAR(36),
  forecast_date DATE,
  forecasted_demand DECIMAL(14, 4),
  current_stock DECIMAL(14, 4),
  reorder_point DECIMAL(14, 4),
  optimal_stock DECIMAL(14, 4),
  confidence_score DECIMAL(5, 2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_forecasts_product ON stock_forecasts(product_id);
CREATE INDEX idx_stock_forecasts_date ON stock_forecasts(forecast_date);

-- Sale Invoices table
CREATE TABLE sale_invoices (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36),
  location_id VARCHAR(36),
  customer_id VARCHAR(36),
  subtotal DECIMAL(12,2),
  total DECIMAL(12,2),
  total_cost DECIMAL(12,2),
  total_profit DECIMAL(12,2),
  discount_amount DECIMAL(12,2) DEFAULT 0,
  payment_method VARCHAR(50),
  invoice_no VARCHAR(100),
  source VARCHAR(50),
  created_by VARCHAR(36),
  sale_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sale_invoices_business_id ON sale_invoices(business_id);
CREATE INDEX idx_sale_invoices_location_id ON sale_invoices(location_id);
CREATE INDEX idx_sale_invoices_customer_id ON sale_invoices(customer_id);
CREATE INDEX idx_sale_invoices_sale_date ON sale_invoices(sale_date);
CREATE INDEX idx_sale_invoices_business_date ON sale_invoices(business_id, sale_date);
CREATE INDEX idx_sale_invoices_location_date ON sale_invoices(location_id, sale_date);

-- Sale Items table
CREATE TABLE sale_items (
  id VARCHAR(36) PRIMARY KEY,
  invoice_id VARCHAR(36),
  product_id VARCHAR(36),
  quantity DECIMAL(14,4),
  sale_price DECIMAL(12,4),
  fifo_cost DECIMAL(12,4),
  total_cost DECIMAL(12,4),
  profit DECIMAL(12,4),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sale_items_invoice ON sale_items(invoice_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);
