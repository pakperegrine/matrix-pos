-- Migration: Create discounts table
-- Description: Discount and promotion engine for matrix-pos
-- Created: 2024

-- Create discounts table
CREATE TABLE IF NOT EXISTS discounts (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100),
    description TEXT,
    discount_type VARCHAR(50) NOT NULL, -- percentage, fixed_amount, buy_x_get_y, bulk_discount
    discount_value DECIMAL(12, 4) NOT NULL,
    applies_to VARCHAR(50), -- all_products, specific_products, categories, customers
    applies_to_ids JSON,
    minimum_purchase DECIMAL(12, 4) DEFAULT 0,
    minimum_quantity INT DEFAULT 0,
    maximum_uses INT,
    current_uses INT DEFAULT 0,
    max_uses_per_customer INT,
    valid_from DATETIME,
    valid_until DATETIME,
    application_method VARCHAR(50) DEFAULT 'manual', -- manual, automatic, coupon_code
    priority INT DEFAULT 0,
    can_combine TINYINT DEFAULT 1,
    is_active TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Buy X Get Y fields
    buy_quantity INT,
    get_quantity INT,
    get_discount_percentage DECIMAL(12, 4),
    
    -- Bulk discount tiers
    bulk_tiers JSON,
    
    INDEX idx_business_id (business_id),
    INDEX idx_code (code),
    INDEX idx_discount_type (discount_type),
    INDEX idx_is_active (is_active),
    INDEX idx_valid_dates (valid_from, valid_until),
    UNIQUE KEY unique_business_code (business_id, code)
);

-- Create discount_usage_log table for tracking per-customer usage
CREATE TABLE IF NOT EXISTS discount_usage_log (
    id VARCHAR(36) PRIMARY KEY,
    discount_id VARCHAR(36) NOT NULL,
    customer_id VARCHAR(36),
    sale_invoice_id VARCHAR(36),
    discount_amount DECIMAL(12, 4) NOT NULL,
    used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_discount_id (discount_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_sale_invoice_id (sale_invoice_id),
    FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE CASCADE
);

-- Add discount fields to sale_invoices
ALTER TABLE sale_invoices 
ADD COLUMN applied_discounts JSON,
ADD COLUMN total_discount DECIMAL(12, 4) DEFAULT 0;

-- Insert sample discounts for testing
INSERT INTO discounts (id, business_id, name, code, description, discount_type, discount_value, applies_to, minimum_purchase, valid_from, valid_until, application_method, priority, is_active)
VALUES 
    ('disc-1', 'default-business-id', '10% Off Storewide', 'SAVE10', 'Get 10% off your entire purchase', 'percentage', 10, 'all_products', 0, '2024-01-01', '2024-12-31', 'coupon_code', 5, 1),
    ('disc-2', 'default-business-id', '$5 Off Orders Over $50', 'SAVE5', 'Save $5 on orders over $50', 'fixed_amount', 5, 'all_products', 50, '2024-01-01', '2024-12-31', 'coupon_code', 3, 1),
    ('disc-3', 'default-business-id', 'Buy 3 Get 1 Free', 'BUY3GET1', 'Buy 3 items, get 1 free', 'buy_x_get_y', 0, 'all_products', 0, '2024-01-01', '2024-12-31', 'automatic', 10, 1),
    ('disc-4', 'default-business-id', 'Bulk Discount', NULL, 'Buy 10+ items for 15% off, 20+ for 20% off', 'bulk_discount', 0, 'all_products', 0, '2024-01-01', '2024-12-31', 'automatic', 7, 1);

-- Update Buy 3 Get 1 Free discount with BOGO details
UPDATE discounts 
SET buy_quantity = 3, 
    get_quantity = 1, 
    get_discount_percentage = 100
WHERE id = 'disc-3';

-- Update Bulk Discount with tier details
UPDATE discounts 
SET bulk_tiers = '[{"quantity": 10, "discount": 15}, {"quantity": 20, "discount": 20}]'
WHERE id = 'disc-4';
