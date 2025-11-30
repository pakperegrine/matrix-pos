-- SQL Script to seed sample products
-- Replace 'YOUR_BUSINESS_ID_HERE' with actual business UUID

-- Electronics
INSERT INTO products (id, business_id, name, sku, barcode, price, cost, category_id, unit_id, track_inventory, is_active, scope, created_at) VALUES
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Wireless Mouse', 'ELEC-001', '1234567890123', 29.99, 15.50, 'electronics', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'USB-C Cable 2m', 'ELEC-002', '1234567890124', 12.99, 6.00, 'electronics', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Bluetooth Headphones', 'ELEC-003', '1234567890125', 79.99, 42.00, 'electronics', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Wireless Keyboard', 'ELEC-004', '1234567890126', 45.99, 24.00, 'electronics', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'USB Flash Drive 32GB', 'ELEC-005', '1234567890127', 15.99, 8.00, 'electronics', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'HDMI Cable 3m', 'ELEC-006', '1234567890128', 18.99, 9.50, 'electronics', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Phone Stand', 'ELEC-007', '1234567890129', 9.99, 4.50, 'electronics', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Laptop Sleeve 15"', 'ELEC-008', '1234567890130', 24.99, 12.00, 'electronics', 'pcs', 1, 1, 'central', NOW());

-- Food & Beverage
INSERT INTO products (id, business_id, name, sku, barcode, price, cost, category_id, unit_id, track_inventory, is_active, scope, created_at) VALUES
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Organic Coffee Beans', 'FOOD-001', '2234567890123', 16.99, 8.50, 'food', 'kg', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Green Tea (100 bags)', 'FOOD-002', '2234567890124', 12.99, 6.00, 'food', 'box', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Chocolate Bar', 'FOOD-003', '2234567890125', 3.99, 1.80, 'food', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Energy Drink', 'FOOD-004', '2234567890126', 2.99, 1.20, 'food', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Bottled Water 1L', 'FOOD-005', '2234567890127', 1.49, 0.60, 'food', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Trail Mix 500g', 'FOOD-006', '2234567890128', 8.99, 4.50, 'food', 'pack', 1, 1, 'central', NOW());

-- Office Supplies
INSERT INTO products (id, business_id, name, sku, barcode, price, cost, category_id, unit_id, track_inventory, is_active, scope, created_at) VALUES
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Ballpoint Pens (Pack of 10)', 'OFF-001', '3234567890123', 6.99, 3.20, 'office', 'pack', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Spiral Notebook A4', 'OFF-002', '3234567890124', 4.99, 2.30, 'office', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Sticky Notes (Pack of 6)', 'OFF-003', '3234567890125', 7.99, 3.80, 'office', 'pack', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Desk Organizer', 'OFF-004', '3234567890126', 19.99, 10.00, 'office', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Stapler', 'OFF-005', '3234567890127', 8.99, 4.50, 'office', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Paper Clips (Box of 100)', 'OFF-006', '3234567890128', 2.99, 1.20, 'office', 'box', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Highlighters (Set of 4)', 'OFF-007', '3234567890129', 5.99, 2.80, 'office', 'pack', 1, 1, 'central', NOW());

-- Clothing
INSERT INTO products (id, business_id, name, sku, barcode, price, cost, category_id, unit_id, track_inventory, is_active, scope, created_at) VALUES
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Cotton T-Shirt (White)', 'CLO-001', '4234567890123', 19.99, 9.00, 'clothing', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Denim Jeans', 'CLO-002', '4234567890124', 49.99, 25.00, 'clothing', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Running Socks (3-Pack)', 'CLO-003', '4234567890125', 12.99, 6.00, 'clothing', 'pack', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Baseball Cap', 'CLO-004', '4234567890126', 24.99, 12.00, 'clothing', 'pcs', 1, 1, 'central', NOW());

-- Health & Beauty
INSERT INTO products (id, business_id, name, sku, barcode, price, cost, category_id, unit_id, track_inventory, is_active, scope, created_at) VALUES
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Hand Sanitizer 500ml', 'HLT-001', '5234567890123', 8.99, 4.20, 'health', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Face Masks (Box of 50)', 'HLT-002', '5234567890124', 19.99, 10.00, 'health', 'box', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Shampoo 400ml', 'HLT-003', '5234567890125', 12.99, 6.50, 'health', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Toothbrush (2-Pack)', 'HLT-004', '5234567890126', 6.99, 3.20, 'health', 'pack', 1, 1, 'central', NOW());

-- Sports & Outdoors
INSERT INTO products (id, business_id, name, sku, barcode, price, cost, category_id, unit_id, track_inventory, is_active, scope, created_at) VALUES
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Yoga Mat', 'SPT-001', '6234567890123', 34.99, 18.00, 'sports', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Water Bottle 750ml', 'SPT-002', '6234567890124', 14.99, 7.50, 'sports', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Resistance Bands Set', 'SPT-003', '6234567890125', 24.99, 12.00, 'sports', 'pack', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Tennis Balls (3-Pack)', 'SPT-004', '6234567890126', 8.99, 4.20, 'sports', 'pack', 1, 1, 'central', NOW());

-- Books & Media
INSERT INTO products (id, business_id, name, sku, barcode, price, cost, category_id, unit_id, track_inventory, is_active, scope, created_at) VALUES
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Blank Journal', 'BK-001', '7234567890123', 14.99, 7.00, 'books', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Coloring Book', 'BK-002', '7234567890124', 9.99, 4.80, 'books', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Bookmark Set (5-Pack)', 'BK-003', '7234567890125', 5.99, 2.50, 'books', 'pack', 1, 1, 'central', NOW());

-- Toys & Games
INSERT INTO products (id, business_id, name, sku, barcode, price, cost, category_id, unit_id, track_inventory, is_active, scope, created_at) VALUES
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Puzzle 1000 Pieces', 'TOY-001', '8234567890123', 19.99, 10.00, 'toys', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Playing Cards Deck', 'TOY-002', '8234567890124', 5.99, 2.80, 'toys', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Board Game', 'TOY-003', '8234567890125', 34.99, 18.00, 'toys', 'pcs', 1, 1, 'central', NOW());

-- Automotive
INSERT INTO products (id, business_id, name, sku, barcode, price, cost, category_id, unit_id, track_inventory, is_active, scope, created_at) VALUES
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Car Air Freshener', 'AUTO-001', '9234567890123', 4.99, 2.20, 'automotive', 'pcs', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Microfiber Cloth (3-Pack)', 'AUTO-002', '9234567890124', 8.99, 4.20, 'automotive', 'pack', 1, 1, 'central', NOW()),
(UUID(), 'YOUR_BUSINESS_ID_HERE', 'Phone Car Mount', 'AUTO-003', '9234567890125', 16.99, 8.50, 'automotive', 'pcs', 1, 1, 'central', NOW());
