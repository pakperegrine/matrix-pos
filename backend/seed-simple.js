const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const argon2 = require('argon2');

async function seed() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '123',
    database: 'matrix_pos'
  });
  
  try {
    console.log('🌱 Seeding database...\n');
    
    const businessId = uuidv4();
    const ownerId = uuidv4();
    const loc1 = uuidv4();
    const loc2 = uuidv4();
    const pass = await argon2.hash('password123');
    
    // Business
    await conn.execute('INSERT INTO businesses (id, name, business_type, subscription_plan, status) VALUES (?, ?, ?, ?, ?)',
      [businessId, 'Matrix POS', 'retail', 'premium', 'active']);
    console.log('✓ Business created');
    
    // Owner
    await conn.execute('INSERT INTO users (id, business_id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [ownerId, businessId, 'Owner', 'owner@pos.com', pass, 'owner', 'active']);
    console.log('✓ Owner created');
    
    // Locations
    await conn.execute('INSERT INTO locations (id, business_id, code, name, city, status) VALUES (?, ?, ?, ?, ?, ?)',
      [loc1, businessId, 'LOC1', 'Downtown Store', 'New York', 'active']);
    await conn.execute('INSERT INTO locations (id, business_id, code, name, city, status) VALUES (?, ?, ?, ?, ?, ?)',
      [loc2, businessId, 'LOC2', 'Uptown Branch', 'New York', 'active']);
    console.log('✓ 2 Locations created');
    
    // Users (3 per location)
    const users = [
      ['Alice', 'alice@pos.com', 'admin', loc1],
      ['Bob', 'bob@pos.com', 'manager', loc1],
      ['Charlie', 'charlie@pos.com', 'cashier', loc1],
      ['David', 'david@pos.com', 'admin', loc2],
      ['Eve', 'eve@pos.com', 'manager', loc2],
      ['Frank', 'frank@pos.com', 'cashier', loc2]
    ];
    
    for (const [name, email, role, loc] of users) {
      await conn.execute('INSERT INTO users (id, business_id, name, email, password_hash, role, location_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), businessId, name, email, pass, role, loc, 'active']);
    }
    console.log('✓ 6 Users created');
    
    // Currency
    await conn.execute('INSERT INTO currencies (id, business_id, code, name, symbol, exchange_rate, is_base, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), businessId, 'USD', 'US Dollar', '$', 1, 1, 1]);
    console.log('✓ Currency created');
    
    // Products (10 per location)
    const prods = [
      ['Mouse', 'M001', 29.99, 15],
      ['Keyboard', 'K001', 49.99, 25],
      ['Monitor', 'MO001', 199.99, 100],
      ['Cable', 'C001', 9.99, 5],
      ['Webcam', 'W001', 79.99, 40],
      ['Headset', 'H001', 59.99, 30],
      ['Speaker', 'S001', 89.99, 45],
      ['Mousepad', 'MP001', 14.99, 7],
      ['USB Hub', 'UH001', 24.99, 12],
      ['Phone Stand', 'PS001', 19.99, 10]
    ];
    
    for (const [name, sku, price, cost] of prods) {
      // Location 1
      const p1 = uuidv4();
      await conn.execute('INSERT INTO products (id, business_id, location_id, name, sku, price, cost, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [p1, businessId, loc1, name, `${sku}-L1`, price, cost, 1]);
      await conn.execute('INSERT INTO stock_batches (id, product_id, location_id, quantity, cost_price) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), p1, loc1, Math.floor(Math.random() * 50) + 20, cost]);
      
      // Location 2
      const p2 = uuidv4();
      await conn.execute('INSERT INTO products (id, business_id, location_id, name, sku, price, cost, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [p2, businessId, loc2, name, `${sku}-L2`, price, cost, 1]);
      await conn.execute('INSERT INTO stock_batches (id, product_id, location_id, quantity, cost_price) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), p2, loc2, Math.floor(Math.random() * 50) + 20, cost]);
    }
    console.log('✓ 20 Products with stock created (10 per location)');
    
    // Customers (5 per location)
    const custs = [
      ['Sarah Johnson', 'sarah@email.com', '+1111'],
      ['Mike Williams', 'mike@email.com', '+2222'],
      ['Emma Davis', 'emma@email.com', '+3333'],
      ['James Brown', 'james@email.com', '+4444'],
      ['Lisa Garcia', 'lisa@email.com', '+5555']
    ];
    
    for (const [name, email, phone] of custs) {
      await conn.execute('INSERT INTO customers (id, business_id, location_id, name, email, phone, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), businessId, loc1, name, email, phone, 1]);
      await conn.execute('INSERT INTO customers (id, business_id, location_id, name, email, phone, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), businessId, loc2, `${name} (L2)`, email.replace('@', '2@'), phone.replace('+', '+9'), 1]);
    }
    console.log('✓ 10 Customers created (5 per location)');
    
    // Settings
    await conn.execute('INSERT INTO settings (id, business_id) VALUES (?, ?)', [uuidv4(), businessId]);
    console.log('✓ Settings created');
    
    console.log('\n✅ Seed complete!');
    console.log('\n📊 Summary:');
    console.log('  Business: Matrix POS');
    console.log('  Owner: owner@pos.com / password123');
    console.log('  Locations: Downtown Store, Uptown Branch');
    console.log('  Users: 6 (all password: password123)');
    console.log('  Products: 20 (10 per location)');
    console.log('  Customers: 10 (5 per location)');
    console.log('\n📍 Location IDs:');
    console.log(`  Downtown: ${loc1}`);
    console.log(`  Uptown: ${loc2}`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    throw err;
  } finally {
    await conn.end();
  }
}

seed();
