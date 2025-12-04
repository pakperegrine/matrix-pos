const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');
const path = require('path');

const sqliteDb = path.join(__dirname, '..', 'dev.sqlite');

const mysqlConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '123',
  database: 'matrix_pos'
};

// Column mappings for tables with schema differences
// Exclude auto-generated timestamp columns
const columnMappings = {
  businesses: ['id', 'name', 'owner_id', 'status', 'business_type', 'subscription_plan', 'subscription_expires'],
  users: ['id', 'business_id', 'name', 'email', 'password_hash', 'role', 'location_id', 'status', 'permissions', 'last_login', 'created_by'],
  locations: ['id', 'business_id', 'name', 'code', 'address', 'city', 'state', 'postal_code', 'country', 'phone', 'email', 'manager_id', 'status', 'opening_hours', 'settings'],
  customers: ['id', 'business_id', 'name', 'email', 'phone', 'address', 'city', 'country', 'postal_code', 'date_of_birth', 'customer_type', 'credit_limit', 'current_balance', 'loyalty_points', 'loyalty_tier', 'total_purchases', 'purchase_count', 'discount_percentage', 'notes', 'is_active', 'last_purchase_date']
};

async function migrate() {
  console.log('🔄 Starting SQLite to MySQL migration...\n');
  
  const mysqlConn = await mysql.createConnection(mysqlConfig);
  const sqliteDbConn = new sqlite3.Database(sqliteDb);
  
  const tables = [
    'businesses',
    'currencies',
    'locations',
    'users',
    'customers',
    'products',
    'stock_batches',
    'discounts',
    'settings'
  ];
  
  try {
    // Clear existing data
    console.log('🗑️  Clearing existing MySQL data...');
    await mysqlConn.execute('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of tables) {
      try {
        await mysqlConn.execute(`TRUNCATE TABLE ${table}`);
      } catch (err) {
        console.log(`   ⚠️  Could not truncate ${table}: ${err.message}`);
      }
    }
    await mysqlConn.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Cleared\n');
    
    for (const table of tables) {
      console.log(`📋 Migrating table: ${table}`);
      
      const rows = await new Promise((resolve, reject) => {
        sqliteDbConn.all(`SELECT * FROM ${table}`, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      
      if (rows.length === 0) {
        console.log(`   ⚠️  No data found in ${table}`);
        continue;
      }
      
      console.log(`   Found ${rows.length} rows`);
      
      let successCount = 0;
      for (const row of rows) {
        // Use column mapping if available, otherwise use all columns
        const allowedColumns = columnMappings[table] || Object.keys(row);
        const columns = Object.keys(row).filter(col => allowedColumns.includes(col));
        const values = columns.map(col => row[col]);
        
        // Convert SQLite booleans (0/1) to MySQL format
        const mysqlValues = values.map(v => {
          if (v === null || v === undefined) return null;
          if (typeof v === 'boolean') return v ? 1 : 0;
          return v;
        });
        
        const placeholders = columns.map(() => '?').join(', ');
        const columnList = columns.map(c => `\`${c}\``).join(', ');
        
        const sql = `INSERT INTO ${table} (${columnList}) VALUES (${placeholders})`;
        
        try {
          await mysqlConn.execute(sql, mysqlValues);
          successCount++;
        } catch (err) {
          console.log(`   ⚠️  Error inserting row: ${err.message}`);
        }
      }
      
      console.log(`   ✅ Migrated ${successCount}/${rows.length} rows\n`);
    }
    
    console.log('✅ Migration completed successfully!\n');
    console.log('='.repeat(60));
    console.log('🔑 Login Credentials:');
    console.log('   Email: owner@pos.com');
    console.log('   Password: password123');
    console.log('   Database: matrix_pos (MySQL)');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    sqliteDbConn.close();
    await mysqlConn.end();
  }
}

migrate();
