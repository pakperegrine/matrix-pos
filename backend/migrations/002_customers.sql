-- Migration: Create customers table
-- Date: 2025-11-30

CREATE TABLE IF NOT EXISTS customers (
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
    discount_percentage DECIMAL(12, 4) DEFAULT 0,
    notes TEXT,
    is_active TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_purchase_date DATETIME,
    INDEX idx_business_id (business_id),
    INDEX idx_email (business_id, email),
    INDEX idx_phone (business_id, phone),
    INDEX idx_customer_type (customer_type),
    INDEX idx_loyalty_tier (loyalty_tier)
);

-- Add customer_id to sale_invoices if not exists
ALTER TABLE sale_invoices ADD COLUMN IF NOT EXISTS customer_id VARCHAR(36);
ALTER TABLE sale_invoices ADD INDEX IF NOT EXISTS idx_customer_id (customer_id);
