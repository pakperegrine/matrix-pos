const Database = require('better-sqlite3');
const { v4: uuid } = require('uuid');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.sqlite');
const db = new Database(dbPath);

const products = [
  ['Wireless Mouse', 'ELEC-001', 29.99, 15.50, 'electronics', 'pcs'],
  ['USB-C Cable 2m', 'ELEC-002', 12.99, 6.00, 'electronics', 'pcs'],
  ['Bluetooth Headphones', 'ELEC-003', 79.99, 42.00, 'electronics', 'pcs'],
  ['Wireless Keyboard', 'ELEC-004', 45.99, 24.00, 'electronics', 'pcs'],
  ['USB Flash Drive 32GB', 'ELEC-005', 15.99, 8.00, 'electronics', 'pcs'],
  ['HDMI Cable 3m', 'ELEC-006', 18.99, 9.50, 'electronics', 'pcs'],
  ['Phone Stand', 'ELEC-007', 9.99, 4.50, 'electronics', 'pcs'],
  ['Laptop Sleeve 15"', 'ELEC-008', 24.99, 12.00, 'electronics', 'pcs'],
  
  ['Organic Coffee Beans', 'FOOD-001', 16.99, 8.50, 'food', 'kg'],
  ['Green Tea (100 bags)', 'FOOD-002', 12.99, 6.00, 'food', 'box'],
  ['Chocolate Bar', 'FOOD-003', 3.99, 1.80, 'food', 'pcs'],
  ['Energy Drink', 'FOOD-004', 2.99, 1.20, 'food', 'pcs'],
  ['Bottled Water 1L', 'FOOD-005', 1.49, 0.60, 'food', 'pcs'],
  ['Trail Mix 500g', 'FOOD-006', 8.99, 4.50, 'food', 'pack'],
  
  ['Ballpoint Pens (Pack of 10)', 'OFF-001', 6.99, 3.20, 'office', 'pack'],
  ['Spiral Notebook A4', 'OFF-002', 4.99, 2.30, 'office', 'pcs'],
  ['Sticky Notes (Pack of 6)', 'OFF-003', 7.99, 3.80, 'office', 'pack'],
  ['Desk Organizer', 'OFF-004', 19.99, 10.00, 'office', 'pcs'],
  ['Stapler', 'OFF-005', 8.99, 4.50, 'office', 'pcs'],
  ['Paper Clips (Box of 100)', 'OFF-006', 2.99, 1.20, 'office', 'box'],
  ['Highlighters (Set of 4)', 'OFF-007', 5.99, 2.80, 'office', 'pack'],
  
  ['Cotton T-Shirt (White)', 'CLO-001', 19.99, 9.00, 'clothing', 'pcs'],
  ['Denim Jeans', 'CLO-002', 49.99, 25.00, 'clothing', 'pcs'],
  ['Running Socks (3-Pack)', 'CLO-003', 12.99, 6.00, 'clothing', 'pack'],
  ['Baseball Cap', 'CLO-004', 24.99, 12.00, 'clothing', 'pcs'],
  
  ['Hand Sanitizer 500ml', 'HLT-001', 8.99, 4.20, 'health', 'pcs'],
  ['Face Masks (Box of 50)', 'HLT-002', 19.99, 10.00, 'health', 'box'],
  ['Shampoo 400ml', 'HLT-003', 12.99, 6.50, 'health', 'pcs'],
  ['Toothbrush (2-Pack)', 'HLT-004', 6.99, 3.20, 'health', 'pack'],
  
  ['Yoga Mat', 'SPT-001', 34.99, 18.00, 'sports', 'pcs'],
  ['Water Bottle 750ml', 'SPT-002', 14.99, 7.50, 'sports', 'pcs'],
  ['Resistance Bands Set', 'SPT-003', 24.99, 12.00, 'sports', 'pack'],
  ['Tennis Balls (3-Pack)', 'SPT-004', 8.99, 4.20, 'sports', 'pack'],
  
  ['Blank Journal', 'BK-001', 14.99, 7.00, 'books', 'pcs'],
  ['Coloring Book', 'BK-002', 9.99, 4.80, 'books', 'pcs'],
  ['Bookmark Set (5-Pack)', 'BK-003', 5.99, 2.50, 'books', 'pack'],
  
  ['Puzzle 1000 Pieces', 'TOY-001', 19.99, 10.00, 'toys', 'pcs'],
  ['Playing Cards Deck', 'TOY-002', 5.99, 2.80, 'toys', 'pcs'],
  ['Board Game', 'TOY-003', 34.99, 18.00, 'toys', 'pcs'],
  
  ['Car Air Freshener', 'AUTO-001', 4.99, 2.20, 'automotive', 'pcs'],
  ['Microfiber Cloth (3-Pack)', 'AUTO-002', 8.99, 4.20, 'automotive', 'pack'],
  ['Phone Car Mount', 'AUTO-003', 16.99, 8.50, 'automotive', 'pcs']
];

console.log('🌱 Seeding database...\n');

try {
  // Get or create business
  let business = db.prepare('SELECT id FROM businesses LIMIT 1').get();
  let businessId;
  
  if (!business) {
    businessId = uuid();
    db.prepare(`INSERT INTO businesses (id, name) VALUES (?, ?)`)
      .run(businessId, 'Demo Business');
    console.log('✅ Created Demo Business');
  } else {
    businessId = business.id;
    console.log('✅ Using existing business:', businessId);
  }
  
  // Insert products
  const insert = db.prepare(`
    INSERT INTO products (id, business_id, name, sku, price, cost, category_id, unit_id, track_inventory, status, scope) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 'central')
  `);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const product of products) {
    try {
      insert.run(uuid(), businessId, ...product);
      successCount++;
      console.log(`✅ ${product[0]}`);
    } catch (error) {
      errorCount++;
      console.error(`❌ ${product[0]}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📦 Total: ${products.length}`);
  console.log(`\n🎉 Database seeding complete!`);
  
} catch (error) {
  console.error('❌ Seeding failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
