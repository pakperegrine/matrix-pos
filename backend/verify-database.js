const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'dev.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

console.log('📊 Database Verification Report\n');
console.log('='.repeat(60));

const queries = [
  { name: 'Businesses', sql: 'SELECT COUNT(*) as count, GROUP_CONCAT(name) as names FROM businesses' },
  { name: 'Users', sql: 'SELECT COUNT(*) as count FROM users' },
  { name: 'Users by Role', sql: 'SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY count DESC' },
  { name: 'Locations', sql: 'SELECT COUNT(*) as count, GROUP_CONCAT(name) as names FROM locations' },
  { name: 'Products', sql: 'SELECT COUNT(*) as count FROM products' },
  { name: 'Products by Location', sql: 'SELECT l.name as location, COUNT(p.id) as count FROM locations l LEFT JOIN products p ON l.id = p.location_id GROUP BY l.id ORDER BY count DESC' },
  { name: 'Customers', sql: 'SELECT COUNT(*) as count FROM customers' },
  { name: 'Categories', sql: 'SELECT COUNT(*) as count, GROUP_CONCAT(name) as names FROM categories' },
  { name: 'Units', sql: 'SELECT COUNT(*) as count, GROUP_CONCAT(name) as names FROM units' },
  { name: 'Currencies', sql: 'SELECT COUNT(*) as count, GROUP_CONCAT(code) as codes FROM currencies' },
  { name: 'Stock Batches', sql: 'SELECT COUNT(*) as count, ROUND(SUM(quantity), 2) as total_qty FROM stock_batches' },
  { name: 'Sale Invoices', sql: 'SELECT COUNT(*) as count FROM sale_invoices' },
];

let completed = 0;

queries.forEach((query) => {
  db.all(query.sql, [], (err, rows) => {
    completed++;
    
    if (err) {
      console.log(`\n❌ ${query.name}: Error - ${err.message}`);
    } else {
      console.log(`\n✓ ${query.name}:`);
      if (rows.length > 0) {
        if (query.name.includes('by')) {
          rows.forEach(row => {
            console.log(`  - ${row.role || row.location}: ${row.count}`);
          });
        } else {
          const row = rows[0];
          console.log(`  Count: ${row.count}`);
          if (row.names) console.log(`  Names: ${row.names}`);
          if (row.codes) console.log(`  Codes: ${row.codes}`);
          if (row.total_qty) console.log(`  Total Quantity: ${row.total_qty}`);
        }
      } else {
        console.log('  No data found');
      }
    }
    
    if (completed === queries.length) {
      console.log('\n' + '='.repeat(60));
      
      // Get sample data
      db.get('SELECT * FROM users WHERE role = "owner" LIMIT 1', [], (err, owner) => {
        if (owner) {
          console.log('\n🔑 Sample Login Credentials:');
          console.log(`  Email: ${owner.email}`);
          console.log(`  Password: password123`);
          console.log(`  Role: ${owner.role}`);
          console.log(`  Business ID: ${owner.business_id}`);
        }
        
        db.all('SELECT name, email, role, location_id FROM users ORDER BY role, name', [], (err, users) => {
          if (users && users.length > 0) {
            console.log('\n👥 All Users:');
            users.forEach(u => {
              console.log(`  - ${u.name} (${u.email}) - ${u.role} - Location: ${u.location_id || 'All'}`);
            });
          }
          
          db.close();
        });
      });
    }
  });
});
