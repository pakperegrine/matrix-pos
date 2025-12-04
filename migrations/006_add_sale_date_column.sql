-- Migration: Add sale_date column to sale_invoices table
-- Date: 2025-12-04
-- Description: Add a separate date-only column for easier date filtering and reporting

-- Add sale_date column
ALTER TABLE sale_invoices ADD COLUMN sale_date DATE;

-- Populate sale_date from existing created_at timestamps
UPDATE sale_invoices SET sale_date = DATE(created_at) WHERE created_at IS NOT NULL;

-- Create index on sale_date for better query performance
CREATE INDEX idx_sale_invoices_sale_date ON sale_invoices(sale_date);

-- Create composite index for common queries (business_id + sale_date)
CREATE INDEX idx_sale_invoices_business_date ON sale_invoices(business_id, sale_date);

-- Create composite index for location queries (location_id + sale_date)
CREATE INDEX idx_sale_invoices_location_date ON sale_invoices(location_id, sale_date);
