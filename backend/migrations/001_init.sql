-- 001_init.sql
-- Initial schema for SaaS POS (MySQL)
-- NOTE: Use UUID() function on insert or generate UUIDs from application.

CREATE TABLE businesses (
  id CHAR(36) PRIMARY KEY,
  owner_id CHAR(36) NOT NULL,
  name VARCHAR(150) NOT NULL,
  industry VARCHAR(100),
  email VARCHAR(150),
  phone VARCHAR(50),
  address VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE locations (
  id CHAR(36) PRIMARY KEY,
  business_id CHAR(36) NOT NULL,
  code VARCHAR(10) NOT NULL,
  name VARCHAR(150),
  address VARCHAR(255),
  currency VARCHAR(10) DEFAULT 'USD',
  timezone VARCHAR(50) DEFAULT 'UTC',
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_inclusive TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (business_id),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  business_id CHAR(36) NOT NULL,
  name VARCHAR(150),
  email VARCHAR(150) UNIQUE,
  password_hash VARCHAR(255),
  role_id CHAR(36),
  is_owner TINYINT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (business_id)
);

CREATE TABLE roles (
  id CHAR(36) PRIMARY KEY,
  business_id CHAR(36),
  name VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (business_id)
);

CREATE TABLE role_permissions (
  id CHAR(36) PRIMARY KEY,
  role_id CHAR(36),
  permission_key VARCHAR(100)
);

CREATE TABLE customers (
  id CHAR(36) PRIMARY KEY,
  business_id CHAR(36),
  name VARCHAR(150),
  phone VARCHAR(50),
  email VARCHAR(150),
  address VARCHAR(255),
  total_spent DECIMAL(12,2) DEFAULT 0,
  last_purchase DATETIME NULL,
  loyalty_points DECIMAL(12,2) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (business_id)
);

CREATE TABLE categories (
  id CHAR(36) PRIMARY KEY,
  business_id CHAR(36),
  name VARCHAR(100),
  parent_id CHAR(36) NULL
);

CREATE TABLE units (
  id CHAR(36) PRIMARY KEY,
  business_id CHAR(36),
  name VARCHAR(50),
  short_name VARCHAR(10)
);

CREATE TABLE products (
  id CHAR(36) PRIMARY KEY,
  business_id CHAR(36),
  scope ENUM('central','local') DEFAULT 'central',
  location_id CHAR(36) NULL,
  category_id CHAR(36),
  unit_id CHAR(36),
  name VARCHAR(200),
  barcode VARCHAR(100),
  sku VARCHAR(100),
  track_inventory TINYINT DEFAULT 1,
  allow_negative_stock TINYINT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (business_id),
  INDEX (location_id)
);

CREATE TABLE stock_batches (
  id CHAR(36) PRIMARY KEY,
  product_id CHAR(36),
  location_id CHAR(36),
  quantity DECIMAL(14,4),
  cost_price DECIMAL(12,4),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (product_id),
  INDEX (location_id)
);

CREATE TABLE stock_movements (
  id CHAR(36) PRIMARY KEY,
  batch_id CHAR(36) NULL,
  product_id CHAR(36),
  location_id CHAR(36),
  type ENUM('purchase','sale','adjustment','opening'),
  quantity DECIMAL(14,4),
  cost_price DECIMAL(12,4) NULL,
  invoice_id CHAR(36) NULL,
  created_by CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (product_id),
  INDEX (location_id)
);

CREATE TABLE sale_invoices (
  id CHAR(36) PRIMARY KEY,
  business_id CHAR(36),
  location_id CHAR(36),
  customer_id CHAR(36) NULL,
  subtotal DECIMAL(12,2),
  tax DECIMAL(12,2),
  total DECIMAL(12,2),
  total_cost DECIMAL(12,2),
  total_profit DECIMAL(12,2),
  invoice_no VARCHAR(100), -- human-readable per location
  source ENUM('online','offline') DEFAULT 'online',
  temp_invoice_no VARCHAR(100) NULL,
  created_by CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (business_id),
  INDEX (location_id),
  INDEX (invoice_no)
);

CREATE TABLE sale_items (
  id CHAR(36) PRIMARY KEY,
  invoice_id CHAR(36),
  product_id CHAR(36),
  quantity DECIMAL(14,4),
  sale_price DECIMAL(12,4),
  fifo_cost DECIMAL(12,4),
  total_cost DECIMAL(12,4),
  profit DECIMAL(12,4),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (invoice_id),
  INDEX (product_id)
);

CREATE TABLE payments (
  id CHAR(36) PRIMARY KEY,
  invoice_id CHAR(36),
  business_id CHAR(36),
  location_id CHAR(36),
  method ENUM('cash','card'),
  amount DECIMAL(12,2),
  reference VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE business_settings (
  business_id CHAR(36) PRIMARY KEY,
  invoice_prefix VARCHAR(20),
  invoice_next BIGINT DEFAULT 1,
  receipt_header TEXT,
  receipt_footer TEXT,
  currency_symbol VARCHAR(10),
  rounding_mode ENUM('none','up','down','nearest') DEFAULT 'none'
);

CREATE TABLE location_settings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  location_id CHAR(36),
  enable_tax TINYINT DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_inclusive TINYINT DEFAULT 0,
  allow_discount TINYINT DEFAULT 1,
  max_discount_percent DECIMAL(5,2) DEFAULT 0,
  print_mode ENUM('dialog','silent','thermal') DEFAULT 'thermal',
  print_paper_size ENUM('58mm','80mm','A4') DEFAULT '80mm',
  auto_print_receipt TINYINT DEFAULT 1,
  auto_open_cash_drawer TINYINT DEFAULT 1,
  allow_negative_stock TINYINT DEFAULT 0,
  enable_rounding TINYINT DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_sale_invoices_created_at ON sale_invoices(created_at);
CREATE INDEX idx_stock_batches_product ON stock_batches(product_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);

-- End of migration
