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

async function migrate() {
  console.log('🔄 Starting SQLite to MySQL migration...\n');
  
  const mysqlConn = await mysql.createConnection(mysqlConfig);
  const sqliteDbConn = new sqlite3.Database(sqliteDb);
  
  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await mysqlConn.execute('SET FOREIGN_KEY_CHECKS = 0');
  await mysqlConn.execute('TRUNCATE TABLE stock_batches');
  await mysqlConn.execute('TRUNCATE TABLE products');
  await mysqlConn.execute('TRUNCATE TABLE customers');
  await mysqlConn.execute('TRUNCATE TABLE users');
  await mysqlConn.execute('TRUNCATE TABLE locations');
  await mysqlConn.execute('TRUNCATE TABLE currencies');
  await mysqlConn.execute('TRUNCATE TABLE businesses');
  await mysqlConn.execute('SET FOREIGN_KEY_CHECKS = 1');
  console.log('✅ Cleared\n');
  
  // Column mappings for tables with different schemas
  const columnMappings = {
    users: ['id', 'business_id', 'name', 'email', 'password_hash', 'role', 'location_id', 'status', 'permissions', 'last_login', 'created_by', 'updated_at'],
    locations: ['id', 'business_id', 'name', 'code', 'address', 'city', 'state', 'postal_code', 'country', 'phone', 'email', 'manager_id', 'status', 'opening_hours', 'settings', 'created_at', 'updated_at'],
    businesses: ['id', 'name', 'owner_id', 'status', 'business_type', 'registration_date', 'subscription_plan', 'subscription_expires']
  };
  
  const tables = [
    'businesses',
    'currencies',
    'locations',
    'users',
    'customers',
    'products',
    'stock_batches'
  ];
  
  try {
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
      
      let inserted = 0;
      for (const row of rows) {
        // Use mapped columns if available, otherwise all columns
        const columns = columnMappings[table] || Object.keys(row);
        const values = columns.map(col => row[col]);
        
        // Convert SQLite booleans (0/1) to MySQL format
        const mysqlValues = values.map(v => {
          if (v === null || v === undefined) return null;
          if (typeof v === 'boolean') return v ? 1 : 0;
          return v;
        });
        
        const placeholders = columns.map(() => '?').join(', ');
        const columnList = columns.map(c => `\`${c}\``).join(', ');
        
        const sql = `INSERT IGNORE INTO ${table} (${columnList}) VALUES (${placeholders})`;
        
        try {
          const [result] = await mysqlConn.execute(sql, mysqlValues);
          if (result.affectedRows > 0) inserted++;
        } catch (err) {
          console.log(`   ⚠️  Error inserting row: ${err.message}`);
        }
      }
      
      console.log(`   ✅ Migrated ${inserted}/${rows.length} rows\n`);
    }
    
    console.log('✅ Migration completed successfully!\n');
    console.log('=' .repeat(60));
    console.log('🔑 Login Credentials:');
    console.log('   Email: owner@pos.com');
    console.log('   Password: password123');
    console.log('   Database: matrix_pos (MySQL)');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    sqliteDbConn.close();
    await mysqlConn.end();
  }
}

migrate();
