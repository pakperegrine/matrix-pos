const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const argon2 = require('argon2');

const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '123',
  database: 'matrix_pos'
};

async function seed() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🌱 Starting MySQL seed...\n');
    
    // IDs
    const businessId = uuidv4();
    const ownerId = uuidv4();
    const location1Id = uuidv4();
    const location2Id = uuidv4();
    
    // Hash password
    const passwordHash = await argon2.hash('password123');
    
    // 1. Business
    console.log('✓ Creating business...');
    await connection.execute(
      `INSERT INTO businesses (id, name, business_type, subscription_plan, status)
       VALUES (?, ?, ?, ?, ?)`,
      [businessId, 'Matrix Retail Group', 'retail', 'premium', 'active']
    );
    
    // 2. Owner User
    console.log('✓ Creating owner account...');
    await connection.execute(
      `INSERT INTO users (id, business_id, name, email, password_hash, role, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ownerId, businessId, 'John Owner', 'owner@pos.com', passwordHash, 'owner', 'active']
    );
    
    // 3. Locations
    console.log('✓ Creating 2 locations...');
    await connection.execute(
      `INSERT INTO locations (id, business_id, code, name, address, city, state, country, postal_code, phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [location1Id, businessId, 'LOC001', 'Downtown Store', '456 Broadway', 'New York', 'NY', 'USA', '10013', '+1234567891', 'active']
    );
    
    await connection.execute(
      `INSERT INTO locations (id, business_id, code, name, address, city, state, country, postal_code, phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [location2Id, businessId, 'LOC002', 'Uptown Branch', '789 5th Avenue', 'New York', 'NY', 'USA', '10021', '+1234567892', 'active']
    );
    
    // 4. Users for each location
    console.log('✓ Creating users for each location...');
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
      await connection.execute(
        `INSERT INTO users (id, business_id, name, email, password_hash, role, location_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user.id, businessId, user.name, user.email, passwordHash, user.role, user.location, 'active']
      );
    }
    
    // Update location managers
    await connection.execute(`UPDATE locations SET manager_id = ? WHERE id = ?`, [users[1].id, location1Id]);
    await connection.execute(`UPDATE locations SET manager_id = ? WHERE id = ?`, [users[4].id, location2Id]);
    
    // 5. Currency
    console.log('✓ Creating base currency...');
    await connection.execute(
      `INSERT INTO currencies (id, business_id, code, name, symbol, exchange_rate, is_base, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), businessId, 'USD', 'US Dollar', '$', 1.000000, 1, 1]
    );
    
    // 6. Products for Location 1
    console.log('✓ Creating 15 products for Downtown Store...');
    const productsLoc1 = [
      { name: 'Wireless Mouse', barcode: 'WM001', sku: 'ELEC-WM-001', price: 29.99, cost: 15.00 },
      { name: 'USB Keyboard', barcode: 'KB001', sku: 'ELEC-KB-001', price: 49.99, cost: 25.00 },
      { name: 'HDMI Cable 2m', barcode: 'HD001', sku: 'ELEC-HD-001', price: 12.99, cost: 6.00 },
      { name: 'Laptop Stand', barcode: 'LS001', sku: 'ELEC-LS-001', price: 39.99, cost: 20.00 },
      { name: 'Phone Charger', barcode: 'PC001', sku: 'ELEC-PC-001', price: 19.99, cost: 8.00 },
      { name: 'Coffee Beans 1kg', barcode: 'CB001', sku: 'FOOD-CB-001', price: 24.99, cost: 12.00 },
      { name: 'Green Tea Box', barcode: 'GT001', sku: 'FOOD-GT-001', price: 15.99, cost: 7.00 },
      { name: 'Organic Honey 500g', barcode: 'OH001', sku: 'FOOD-OH-001', price: 18.99, cost: 9.00 },
      { name: 'Cotton T-Shirt', barcode: 'TS001', sku: 'CLTH-TS-001', price: 29.99, cost: 12.00 },
      { name: 'Denim Jeans', barcode: 'DJ001', sku: 'CLTH-DJ-001', price: 79.99, cost: 35.00 },
      { name: 'Sports Sneakers', barcode: 'SN001', sku: 'CLTH-SN-001', price: 89.99, cost: 40.00 },
      { name: 'Indoor Plant Pot', barcode: 'PP001', sku: 'HOME-PP-001', price: 34.99, cost: 15.00 },
      { name: 'LED Desk Lamp', barcode: 'DL001', sku: 'HOME-DL-001', price: 44.99, cost: 22.00 },
      { name: 'Kitchen Knife Set', barcode: 'KS001', sku: 'HOME-KS-001', price: 69.99, cost: 30.00 },
      { name: 'Throw Pillow', barcode: 'TP001', sku: 'HOME-TP-001', price: 24.99, cost: 10.00 },
    ];
    
    for (const prod of productsLoc1) {
      const prodId = uuidv4();
      await connection.execute(
        `INSERT INTO products (id, business_id, location_id, name, barcode, sku, price, cost, track_inventory, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [prodId, businessId, location1Id, prod.name, prod.barcode, prod.sku, prod.price, prod.cost, 1, 1]
      );
      
      // Add stock batch
      const quantity = Math.floor(Math.random() * 100) + 20;
      await connection.execute(
        `INSERT INTO stock_batches (id, product_id, location_id, batch_number, quantity, cost_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), prodId, location1Id, `BATCH-${prod.sku}`, quantity, prod.cost]
      );
    }
    
    // 7. Products for Location 2
    console.log('✓ Creating 15 products for Uptown Branch...');
    const productsLoc2 = [
      { name: 'Bluetooth Speaker', barcode: 'BS001', sku: 'ELEC-BS-001', price: 59.99, cost: 30.00 },
      { name: 'Webcam HD', barcode: 'WC001', sku: 'ELEC-WC-001', price: 79.99, cost: 40.00 },
      { name: 'Power Bank 20000mAh', barcode: 'PB001', sku: 'ELEC-PB-001', price: 39.99, cost: 20.00 },
      { name: 'Tablet Stand', barcode: 'TS002', sku: 'ELEC-TS-002', price: 29.99, cost: 15.00 },
      { name: 'Screen Protector', barcode: 'SP001', sku: 'ELEC-SP-001', price: 9.99, cost: 3.00 },
      { name: 'Chocolate Bar 100g', barcode: 'CH001', sku: 'FOOD-CH-001', price: 4.99, cost: 2.00 },
      { name: 'Mineral Water 1L', barcode: 'MW001', sku: 'FOOD-MW-001', price: 1.99, cost: 0.80 },
      { name: 'Energy Drink', barcode: 'ED001', sku: 'FOOD-ED-001', price: 3.99, cost: 1.50 },
      { name: 'Baseball Cap', barcode: 'BC001', sku: 'CLTH-BC-001', price: 24.99, cost: 10.00 },
      { name: 'Wool Scarf', barcode: 'WS001', sku: 'CLTH-WS-001', price: 34.99, cost: 15.00 },
      { name: 'Leather Belt', barcode: 'LB001', sku: 'CLTH-LB-001', price: 39.99, cost: 18.00 },
      { name: 'Wall Clock', barcode: 'WCL001', sku: 'HOME-WCL-001', price: 49.99, cost: 22.00 },
      { name: 'Picture Frame', barcode: 'PF001', sku: 'HOME-PF-001', price: 19.99, cost: 8.00 },
      { name: 'Candle Set', barcode: 'CS001', sku: 'HOME-CS-001', price: 29.99, cost: 12.00 },
      { name: 'Bath Towel', barcode: 'BT001', sku: 'HOME-BT-001', price: 24.99, cost: 10.00 },
    ];
    
    for (const prod of productsLoc2) {
      const prodId = uuidv4();
      await connection.execute(
        `INSERT INTO products (id, business_id, location_id, name, barcode, sku, price, cost, track_inventory, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [prodId, businessId, location2Id, prod.name, prod.barcode, prod.sku, prod.price, prod.cost, 1, 1]
      );
      
      // Add stock batch
      const quantity = Math.floor(Math.random() * 100) + 20;
      await connection.execute(
        `INSERT INTO stock_batches (id, product_id, location_id, batch_number, quantity, cost_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), prodId, location2Id, `BATCH-${prod.sku}`, quantity, prod.cost]
      );
    }
    
    // 8. Customers (5 for each location)
    console.log('✓ Creating 10 customers (5 per location)...');
    const customersLoc1 = [
      { name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+1234567001', type: 'vip' },
      { name: 'Mike Williams', email: 'mike.w@email.com', phone: '+1234567002', type: 'wholesale' },
      { name: 'Emma Davis', email: 'emma.d@email.com', phone: '+1234567003', type: 'regular' },
      { name: 'James Brown', email: 'james.b@email.com', phone: '+1234567004', type: 'regular' },
      { name: 'Lisa Garcia', email: 'lisa.g@email.com', phone: '+1234567005', type: 'vip' },
    ];
    
    const customersLoc2 = [
      { name: 'Robert Miller', email: 'robert.m@email.com', phone: '+1234567006', type: 'regular' },
      { name: 'Jennifer Wilson', email: 'jennifer.w@email.com', phone: '+1234567007', type: 'wholesale' },
      { name: 'David Martinez', email: 'david.m@email.com', phone: '+1234567008', type: 'regular' },
      { name: 'Maria Rodriguez', email: 'maria.r@email.com', phone: '+1234567009', type: 'vip' },
      { name: 'Thomas Anderson', email: 'thomas.a@email.com', phone: '+1234567010', type: 'regular' },
    ];
    
    for (const customer of customersLoc1) {
      await connection.execute(
        `INSERT INTO customers (id, business_id, location_id, name, email, phone, customer_type, loyalty_tier, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), businessId, location1Id, customer.name, customer.email, customer.phone, customer.type, 'gold', 1]
      );
    }
    
    for (const customer of customersLoc2) {
      await connection.execute(
        `INSERT INTO customers (id, business_id, location_id, name, email, phone, customer_type, loyalty_tier, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), businessId, location2Id, customer.name, customer.email, customer.phone, customer.type, 'gold', 1]
      );
    }
    
    // 9. Settings
    console.log('✓ Creating settings...');
    await connection.execute(
      `INSERT INTO settings (id, business_id, setting_key, setting_value)
       VALUES (?, ?, ?, ?)`,
      [uuidv4(), businessId, 'tax_rate', '0.08']
    );
    
    await connection.execute(
      `INSERT INTO settings (id, business_id, setting_key, setting_value)
       VALUES (?, ?, ?, ?)`,
      [uuidv4(), businessId, 'receipt_footer', 'Thank you for your business!']
    );
    
    console.log('\n✅ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log('  - 1 Business: Matrix Retail Group');
    console.log('  - 1 Owner: owner@pos.com (password: password123)');
    console.log('  - 2 Locations: Downtown Store (LOC001), Uptown Branch (LOC002)');
    console.log('  - 6 Users: 2 admins, 2 managers, 2 cashiers (all password: password123)');
    console.log('  - 30 Products (15 per location with stock)');
    console.log('  - 10 Customers (5 per location)');
    console.log('  - 1 Currency: USD (base)');
    console.log('  - Settings: tax_rate, receipt_footer');
    console.log('\n🔑 Login Credentials:');
    console.log('  Owner:    owner@pos.com / password123');
    console.log('  Location 1:');
    console.log('    - alice.admin@pos.com / password123 (admin)');
    console.log('    - bob.manager@pos.com / password123 (manager)');
    console.log('    - charlie.cashier@pos.com / password123 (cashier)');
    console.log('  Location 2:');
    console.log('    - david.admin@pos.com / password123 (admin)');
    console.log('    - eve.manager@pos.com / password123 (manager)');
    console.log('    - frank.cashier@pos.com / password123 (cashier)');
    
    console.log('\n📍 Location IDs:');
    console.log(`  Downtown Store: ${location1Id}`);
    console.log(`  Uptown Branch: ${location2Id}`);
    
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    console.error(error);
    throw error;
  } finally {
    await connection.end();
  }
}

seed().catch(console.error);
