-- 002_add_product_pricing.sql
-- Add price and cost columns to products table

ALTER TABLE products
  ADD COLUMN price DECIMAL(12,4) DEFAULT 0 AFTER sku,
  ADD COLUMN cost DECIMAL(12,4) DEFAULT 0 AFTER price;

-- Update existing products to have 0 as default
UPDATE products SET price = 0 WHERE price IS NULL;
UPDATE products SET cost = 0 WHERE cost IS NULL;
