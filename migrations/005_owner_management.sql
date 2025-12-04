-- Owner Management Migration
-- This migration adds support for owner accounts, location management, and enhanced user roles

-- Add owner-related columns to businesses table
ALTER TABLE businesses ADD COLUMN owner_id VARCHAR(36);
ALTER TABLE businesses ADD COLUMN status VARCHAR(20) DEFAULT 'active'; -- active, suspended, closed
ALTER TABLE businesses ADD COLUMN business_type VARCHAR(50);
ALTER TABLE businesses ADD COLUMN registration_date DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE businesses ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'basic';
ALTER TABLE businesses ADD COLUMN subscription_expires DATETIME;

-- Create locations table for multi-location support
CREATE TABLE IF NOT EXISTS locations (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  manager_id VARCHAR(36),
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, closed
  opening_hours TEXT,
  settings TEXT, -- JSON settings
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- Add location_id to products table for location-specific products
ALTER TABLE products ADD COLUMN IF NOT EXISTS location_id VARCHAR(36);

-- Enhanced users table with roles and permissions
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'cashier'; -- owner, admin, manager, cashier
ALTER TABLE users ADD COLUMN location_id VARCHAR(36);
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active'; -- active, inactive, suspended
ALTER TABLE users ADD COLUMN permissions TEXT; -- JSON permissions
ALTER TABLE users ADD COLUMN last_login DATETIME;
ALTER TABLE users ADD COLUMN created_by VARCHAR(36);
ALTER TABLE users ADD COLUMN updated_at DATETIME;

-- Create user_sessions table for tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  business_id VARCHAR(36) NOT NULL,
  location_id VARCHAR(36),
  login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  logout_time DATETIME,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'active',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- Create business_statistics table for cached statistics
CREATE TABLE IF NOT EXISTS business_statistics (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36) NOT NULL,
  location_id VARCHAR(36),
  stat_date DATE NOT NULL,
  total_sales DECIMAL(14, 2) DEFAULT 0,
  total_transactions INT DEFAULT 0,
  total_customers INT DEFAULT 0,
  total_profit DECIMAL(14, 2) DEFAULT 0,
  average_transaction DECIMAL(14, 2) DEFAULT 0,
  top_product_id VARCHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_business_location_date (business_id, location_id, stat_date)
);

-- Add location_id to sale_invoices for tracking
ALTER TABLE sale_invoices ADD COLUMN IF NOT EXISTS location_id VARCHAR(36);

-- Add location_id to stock_batches for inventory tracking
ALTER TABLE stock_batches ADD COLUMN IF NOT EXISTS location_id VARCHAR(36);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_locations_business ON locations(business_id);
CREATE INDEX IF NOT EXISTS idx_locations_status ON locations(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_business ON user_sessions(business_id);
CREATE INDEX IF NOT EXISTS idx_stats_business ON business_statistics(business_id);
CREATE INDEX IF NOT EXISTS idx_stats_location ON business_statistics(location_id);
CREATE INDEX IF NOT EXISTS idx_stats_date ON business_statistics(stat_date);
CREATE INDEX IF NOT EXISTS idx_products_location ON products(location_id);
CREATE INDEX IF NOT EXISTS idx_invoices_location ON sale_invoices(location_id);
CREATE INDEX IF NOT EXISTS idx_batches_location ON stock_batches(location_id);
