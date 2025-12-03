-- Cash Management Module Database Schema

-- Table: cash_shifts
-- Tracks each cashier shift session
CREATE TABLE IF NOT EXISTS cash_shifts (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(255) NOT NULL,
    cashier_id VARCHAR(36) NOT NULL,
    terminal_id VARCHAR(50),
    shift_number INT AUTO_INCREMENT UNIQUE,
    opening_float DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    opening_time DATETIME NOT NULL,
    opening_approved_by VARCHAR(36),
    opening_approved_at DATETIME,
    
    expected_cash DECIMAL(10, 2) DEFAULT 0.00,
    actual_cash DECIMAL(10, 2) DEFAULT 0.00,
    variance DECIMAL(10, 2) DEFAULT 0.00,
    
    closing_time DATETIME,
    closing_approved_by VARCHAR(36),
    closing_approved_at DATETIME,
    
    status ENUM('open', 'closed', 'reconciling') DEFAULT 'open',
    notes TEXT,
    
    total_cash_sales DECIMAL(10, 2) DEFAULT 0.00,
    total_card_sales DECIMAL(10, 2) DEFAULT 0.00,
    total_sales DECIMAL(10, 2) DEFAULT 0.00,
    total_discounts DECIMAL(10, 2) DEFAULT 0.00,
    total_refunds DECIMAL(10, 2) DEFAULT 0.00,
    total_voids DECIMAL(10, 2) DEFAULT 0.00,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_business_cashier (business_id, cashier_id),
    INDEX idx_status (status),
    INDEX idx_opening_time (opening_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: cash_movements
-- Tracks all cash in/out during shift
CREATE TABLE IF NOT EXISTS cash_movements (
    id VARCHAR(36) PRIMARY KEY,
    shift_id VARCHAR(36) NOT NULL,
    business_id VARCHAR(255) NOT NULL,
    movement_type ENUM('cash_in', 'cash_out', 'cash_drop', 'sale', 'refund') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reason VARCHAR(255),
    notes TEXT,
    
    performed_by VARCHAR(36) NOT NULL,
    approved_by VARCHAR(36),
    approved_at DATETIME,
    
    reference_type VARCHAR(50), -- 'sale', 'refund', 'manual'
    reference_id VARCHAR(36), -- invoice_id or transaction_id
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (shift_id) REFERENCES cash_shifts(id) ON DELETE CASCADE,
    INDEX idx_shift (shift_id),
    INDEX idx_movement_type (movement_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: drawer_events
-- Audit log for every drawer opening
CREATE TABLE IF NOT EXISTS drawer_events (
    id VARCHAR(36) PRIMARY KEY,
    shift_id VARCHAR(36),
    business_id VARCHAR(255) NOT NULL,
    terminal_id VARCHAR(50),
    
    event_type ENUM('manual_open', 'sale', 'refund', 'cash_movement', 'shift_open', 'shift_close') NOT NULL,
    reason VARCHAR(255),
    
    opened_by VARCHAR(36) NOT NULL,
    reference_type VARCHAR(50),
    reference_id VARCHAR(36),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_shift (shift_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: shift_sales_summary
-- Denormalized summary for quick reporting
CREATE TABLE IF NOT EXISTS shift_sales_summary (
    id VARCHAR(36) PRIMARY KEY,
    shift_id VARCHAR(36) NOT NULL UNIQUE,
    business_id VARCHAR(255) NOT NULL,
    
    total_transactions INT DEFAULT 0,
    total_items_sold INT DEFAULT 0,
    
    cash_sales_count INT DEFAULT 0,
    cash_sales_amount DECIMAL(10, 2) DEFAULT 0.00,
    
    card_sales_count INT DEFAULT 0,
    card_sales_amount DECIMAL(10, 2) DEFAULT 0.00,
    
    refunds_count INT DEFAULT 0,
    refunds_amount DECIMAL(10, 2) DEFAULT 0.00,
    
    voids_count INT DEFAULT 0,
    voids_amount DECIMAL(10, 2) DEFAULT 0.00,
    
    discounts_count INT DEFAULT 0,
    discounts_amount DECIMAL(10, 2) DEFAULT 0.00,
    
    cash_drops_count INT DEFAULT 0,
    cash_drops_amount DECIMAL(10, 2) DEFAULT 0.00,
    
    cash_in_count INT DEFAULT 0,
    cash_in_amount DECIMAL(10, 2) DEFAULT 0.00,
    
    cash_out_count INT DEFAULT 0,
    cash_out_amount DECIMAL(10, 2) DEFAULT 0.00,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (shift_id) REFERENCES cash_shifts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: supervisor_approvals
-- Log all supervisor approvals
CREATE TABLE IF NOT EXISTS supervisor_approvals (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(255) NOT NULL,
    shift_id VARCHAR(36),
    
    action_type ENUM('shift_open', 'shift_close', 'cash_in', 'cash_out', 'cash_drop', 'void', 'refund') NOT NULL,
    reference_type VARCHAR(50),
    reference_id VARCHAR(36),
    
    requested_by VARCHAR(36) NOT NULL,
    approved_by VARCHAR(36) NOT NULL,
    supervisor_pin VARCHAR(255), -- hashed
    
    amount DECIMAL(10, 2),
    reason VARCHAR(255),
    notes TEXT,
    
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    
    INDEX idx_shift (shift_id),
    INDEX idx_status (status),
    INDEX idx_action_type (action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
