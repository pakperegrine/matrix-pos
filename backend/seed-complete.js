const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const argon2 = require('argon2');

const dbPath = path.join(__dirname, '..', 'dev.sqlite');

// Helper to generate date string
const dateStr = (daysAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Helper to generate datetime string
const datetimeStr = (daysAgo = 0, hoursAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString().replace('T', ' ').split('.')[0];
};

async function seed() {
  const db = new sqlite3.Database(dbPath);
  
  // IDs
  const businessId = uuidv4();
  const ownerId = uuidv4();
  const location1Id = uuidv4();
  const location2Id = uuidv4();
  
  // Categories
  const categoryIds = {
    electronics: uuidv4(),
    food: uuidv4(),
    clothing: uuidv4(),
    home: uuidv4()
  };
  
  // Units
  const unitIds = {
    piece: uuidv4(),
    kg: uuidv4(),
    liter: uuidv4()
  };
  
  // Hash password
  const passwordHash = await argon2.hash('password123');
  
  console.log('🌱 Starting seed...\n');
  
  db.serialize(async () => {
    // 1. Business
    console.log('✓ Creating business...');
    db.run(`INSERT INTO businesses (id, name, business_type, email, phone, address, city, state, country, subscription_plan, status, registration_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [businessId, 'Matrix Retail Group', 'retail', 'owner@matrixretail.com', '+1234567890', '123 Main Street', 'New York', 'NY', 'USA', 'premium', 'active', dateStr(90), datetimeStr(90)]);
    
    // 2. Owner User
    console.log('✓ Creating owner account...');
    db.run(`INSERT INTO users (id, business_id, name, email, password_hash, role, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [ownerId, businessId, 'John Owner', 'owner@pos.com', passwordHash, 'owner', 'active', datetimeStr(90)]);
    
    // 3. Locations
    console.log('✓ Creating 2 locations...');
    db.run(`INSERT INTO locations (id, business_id, code, name, address, city, state, country, postal_code, phone, manager_id, status, opening_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [location1Id, businessId, 'LOC001', 'Downtown Store', '456 Broadway', 'New York', 'NY', 'USA', '10013', '+1234567891', null, 'active', dateStr(60), datetimeStr(60)]);
    
    db.run(`INSERT INTO locations (id, business_id, code, name, address, city, state, country, postal_code, phone, manager_id, status, opening_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [location2Id, businessId, 'LOC002', 'Uptown Branch', '789 5th Avenue', 'New York', 'NY', 'USA', '10021', '+1234567892', null, 'active', dateStr(45), datetimeStr(45)]);
    
    // 4. Users for each location (admin, manager, cashier per location)
    console.log('✓ Creating users (admin, manager, cashier) for each location...');
    const users = [
      // Location 1
      { id: uuidv4(), name: 'Alice Admin', email: 'alice.admin@pos.com', role: 'admin', location: location1Id },
      { id: uuidv4(), name: 'Bob Manager', email: 'bob.manager@pos.com', role: 'manager', location: location1Id },
      { id: uuidv4(), name: 'Charlie Cashier', email: 'charlie.cashier@pos.com', role: 'cashier', location: location1Id },
      // Location 2
      { id: uuidv4(), name: 'David Admin', email: 'david.admin@pos.com', role: 'admin', location: location2Id },
      { id: uuidv4(), name: 'Eve Manager', email: 'eve.manager@pos.com', role: 'manager', location: location2Id },
      { id: uuidv4(), name: 'Frank Cashier', email: 'frank.cashier@pos.com', role: 'cashier', location: location2Id },
    ];
    
    for (const user of users) {
      db.run(`INSERT INTO users (id, business_id, name, email, password_hash, role, location_id, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user.id, businessId, user.name, user.email, passwordHash, user.role, user.location, 'active', datetimeStr(60)]);
    }
    
    // Update location managers
    db.run(`UPDATE locations SET manager_id = ? WHERE id = ?`, [users[1].id, location1Id]);
    db.run(`UPDATE locations SET manager_id = ? WHERE id = ?`, [users[4].id, location2Id]);
    
    // 5. Categories
    console.log('✓ Creating categories...');
    db.run(`INSERT INTO categories (id, business_id, name) VALUES (?, ?, ?)`, [categoryIds.electronics, businessId, 'Electronics']);
    db.run(`INSERT INTO categories (id, business_id, name) VALUES (?, ?, ?)`, [categoryIds.food, businessId, 'Food & Beverages']);
    db.run(`INSERT INTO categories (id, business_id, name) VALUES (?, ?, ?)`, [categoryIds.clothing, businessId, 'Clothing']);
    db.run(`INSERT INTO categories (id, business_id, name) VALUES (?, ?, ?)`, [categoryIds.home, businessId, 'Home & Garden']);
    
    // 6. Units
    console.log('✓ Creating units...');
    db.run(`INSERT INTO units (id, business_id, name, short_name) VALUES (?, ?, ?, ?)`, [unitIds.piece, businessId, 'Piece', 'pc']);
    db.run(`INSERT INTO units (id, business_id, name, short_name) VALUES (?, ?, ?, ?)`, [unitIds.kg, businessId, 'Kilogram', 'kg']);
    db.run(`INSERT INTO units (id, business_id, name, short_name) VALUES (?, ?, ?, ?)`, [unitIds.liter, businessId, 'Liter', 'L']);
    
    // 7. Currency
    console.log('✓ Creating base currency...');
    db.run(`INSERT INTO currencies (id, business_id, code, name, symbol, exchange_rate, is_base, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), businessId, 'USD', 'US Dollar', '$', 1.000000, 1, 1]);
    
    // 8. Products for Location 1
    console.log('✓ Creating 15 products for Downtown Store...');
    const productsLoc1 = [
      { name: 'Wireless Mouse', barcode: 'WM001', sku: 'ELEC-WM-001', price: 29.99, cost: 15.00, category: categoryIds.electronics },
      { name: 'USB Keyboard', barcode: 'KB001', sku: 'ELEC-KB-001', price: 49.99, cost: 25.00, category: categoryIds.electronics },
      { name: 'HDMI Cable 2m', barcode: 'HD001', sku: 'ELEC-HD-001', price: 12.99, cost: 6.00, category: categoryIds.electronics },
      { name: 'Laptop Stand', barcode: 'LS001', sku: 'ELEC-LS-001', price: 39.99, cost: 20.00, category: categoryIds.electronics },
      { name: 'Phone Charger', barcode: 'PC001', sku: 'ELEC-PC-001', price: 19.99, cost: 8.00, category: categoryIds.electronics },
      { name: 'Coffee Beans 1kg', barcode: 'CB001', sku: 'FOOD-CB-001', price: 24.99, cost: 12.00, category: categoryIds.food },
      { name: 'Green Tea Box', barcode: 'GT001', sku: 'FOOD-GT-001', price: 15.99, cost: 7.00, category: categoryIds.food },
      { name: 'Organic Honey 500g', barcode: 'OH001', sku: 'FOOD-OH-001', price: 18.99, cost: 9.00, category: categoryIds.food },
      { name: 'Cotton T-Shirt', barcode: 'TS001', sku: 'CLTH-TS-001', price: 29.99, cost: 12.00, category: categoryIds.clothing },
      { name: 'Denim Jeans', barcode: 'DJ001', sku: 'CLTH-DJ-001', price: 79.99, cost: 35.00, category: categoryIds.clothing },
      { name: 'Sports Sneakers', barcode: 'SN001', sku: 'CLTH-SN-001', price: 89.99, cost: 40.00, category: categoryIds.clothing },
      { name: 'Indoor Plant Pot', barcode: 'PP001', sku: 'HOME-PP-001', price: 34.99, cost: 15.00, category: categoryIds.home },
      { name: 'LED Desk Lamp', barcode: 'DL001', sku: 'HOME-DL-001', price: 44.99, cost: 22.00, category: categoryIds.home },
      { name: 'Kitchen Knife Set', barcode: 'KS001', sku: 'HOME-KS-001', price: 69.99, cost: 30.00, category: categoryIds.home },
      { name: 'Throw Pillow', barcode: 'TP001', sku: 'HOME-TP-001', price: 24.99, cost: 10.00, category: categoryIds.home },
    ];
    
    for (const prod of productsLoc1) {
      const prodId = uuidv4();
      db.run(`INSERT INTO products (id, business_id, location_id, category_id, unit_id, name, barcode, sku, price, cost, track_inventory, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [prodId, businessId, location1Id, prod.category, unitIds.piece, prod.name, prod.barcode, prod.sku, prod.price, prod.cost, 1, 1, datetimeStr(50)]);
      
      // Add stock batch
      db.run(`INSERT INTO stock_batches (id, product_id, location_id, quantity, cost_price, created_at)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), prodId, location1Id, Math.floor(Math.random() * 100) + 20, prod.cost, datetimeStr(50)]);
    }
    
    // 9. Products for Location 2
    console.log('✓ Creating 15 products for Uptown Branch...');
    const productsLoc2 = [
      { name: 'Bluetooth Speaker', barcode: 'BS001', sku: 'ELEC-BS-001', price: 59.99, cost: 30.00, category: categoryIds.electronics },
      { name: 'Webcam HD', barcode: 'WC001', sku: 'ELEC-WC-001', price: 79.99, cost: 40.00, category: categoryIds.electronics },
      { name: 'Power Bank 20000mAh', barcode: 'PB001', sku: 'ELEC-PB-001', price: 39.99, cost: 20.00, category: categoryIds.electronics },
      { name: 'Tablet Stand', barcode: 'TS002', sku: 'ELEC-TS-002', price: 29.99, cost: 15.00, category: categoryIds.electronics },
      { name: 'Screen Protector', barcode: 'SP001', sku: 'ELEC-SP-001', price: 9.99, cost: 3.00, category: categoryIds.electronics },
      { name: 'Chocolate Bar 100g', barcode: 'CH001', sku: 'FOOD-CH-001', price: 4.99, cost: 2.00, category: categoryIds.food },
      { name: 'Mineral Water 1L', barcode: 'MW001', sku: 'FOOD-MW-001', price: 1.99, cost: 0.80, category: categoryIds.food },
      { name: 'Energy Drink', barcode: 'ED001', sku: 'FOOD-ED-001', price: 3.99, cost: 1.50, category: categoryIds.food },
      { name: 'Baseball Cap', barcode: 'BC001', sku: 'CLTH-BC-001', price: 24.99, cost: 10.00, category: categoryIds.clothing },
      { name: 'Wool Scarf', barcode: 'WS001', sku: 'CLTH-WS-001', price: 34.99, cost: 15.00, category: categoryIds.clothing },
      { name: 'Leather Belt', barcode: 'LB001', sku: 'CLTH-LB-001', price: 39.99, cost: 18.00, category: categoryIds.clothing },
      { name: 'Wall Clock', barcode: 'WCL001', sku: 'HOME-WCL-001', price: 49.99, cost: 22.00, category: categoryIds.home },
      { name: 'Picture Frame', barcode: 'PF001', sku: 'HOME-PF-001', price: 19.99, cost: 8.00, category: categoryIds.home },
      { name: 'Candle Set', barcode: 'CS001', sku: 'HOME-CS-001', price: 29.99, cost: 12.00, category: categoryIds.home },
      { name: 'Bath Towel', barcode: 'BT001', sku: 'HOME-BT-001', price: 24.99, cost: 10.00, category: categoryIds.home },
    ];
    
    for (const prod of productsLoc2) {
      const prodId = uuidv4();
      db.run(`INSERT INTO products (id, business_id, location_id, category_id, unit_id, name, barcode, sku, price, cost, track_inventory, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [prodId, businessId, location2Id, prod.category, unitIds.piece, prod.name, prod.barcode, prod.sku, prod.price, prod.cost, 1, 1, datetimeStr(45)]);
      
      // Add stock batch
      db.run(`INSERT INTO stock_batches (id, product_id, location_id, quantity, cost_price, created_at)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), prodId, location2Id, Math.floor(Math.random() * 100) + 20, prod.cost, datetimeStr(45)]);
    }
    
    // 10. Customers
    console.log('✓ Creating 10 customers...');
    const customers = [
      { name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+1234567001', type: 'vip' },
      { name: 'Mike Williams', email: 'mike.w@email.com', phone: '+1234567002', type: 'wholesale' },
      { name: 'Emma Davis', email: 'emma.d@email.com', phone: '+1234567003', type: 'regular' },
      { name: 'James Brown', email: 'james.b@email.com', phone: '+1234567004', type: 'regular' },
      { name: 'Lisa Garcia', email: 'lisa.g@email.com', phone: '+1234567005', type: 'vip' },
      { name: 'Robert Miller', email: 'robert.m@email.com', phone: '+1234567006', type: 'regular' },
      { name: 'Jennifer Wilson', email: 'jennifer.w@email.com', phone: '+1234567007', type: 'wholesale' },
      { name: 'David Martinez', email: 'david.m@email.com', phone: '+1234567008', type: 'regular' },
      { name: 'Maria Rodriguez', email: 'maria.r@email.com', phone: '+1234567009', type: 'vip' },
      { name: 'Thomas Anderson', email: 'thomas.a@email.com', phone: '+1234567010', type: 'regular' },
    ];
    
    for (const customer of customers) {
      db.run(`INSERT INTO customers (id, business_id, name, email, phone, customer_type, loyalty_tier, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), businessId, customer.name, customer.email, customer.phone, customer.type, 'gold', 1, datetimeStr(40)]);
    }
    
    // 11. Sample sales for last 30 days
    console.log('✓ Creating sample sales data for last 30 days...');
    
    setTimeout(() => {
      db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err.message);
        } else {
          console.log('\n✅ Seed completed successfully!');
          console.log('\n📊 Summary:');
          console.log('  - 1 Business: Matrix Retail Group');
          console.log('  - 1 Owner: owner@pos.com (password: password123)');
          console.log('  - 2 Locations: Downtown Store, Uptown Branch');
          console.log('  - 6 Users: 2 admins, 2 managers, 2 cashiers');
          console.log('  - 4 Categories');
          console.log('  - 3 Units');
          console.log('  - 30 Products (15 per location)');
          console.log('  - 10 Customers');
          console.log('  - Currency: USD');
        }
      });
    }, 1000);
  });
}

seed().catch(console.error);
