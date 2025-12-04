const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'dev.sqlite');
const schemaPath = path.join(__dirname, '..', 'migrations', '000_complete_schema.sql');

console.log('🔄 Resetting database...\n');

// Delete existing database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('✓ Old database deleted');
}

// Create new database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error creating database:', err.message);
    process.exit(1);
  }
  console.log('✓ New database created');
});

// Read and execute schema
const schema = fs.readFileSync(schemaPath, 'utf8');
const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);

console.log(`✓ Executing ${statements.length} SQL statements...\n`);

db.serialize(() => {
  let successCount = 0;
  let errorCount = 0;
  
  statements.forEach((statement, index) => {
    db.run(statement, (err) => {
      if (err) {
        console.error(`❌ Statement ${index + 1} failed:`, err.message);
        errorCount++;
      } else {
        successCount++;
      }
    });
  });
  
  setTimeout(() => {
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log(`\n✅ Schema applied: ${successCount} successful, ${errorCount} failed`);
        console.log('\n📝 Run "node seed-complete.js" to populate with sample data');
      }
    });
  }, 500);
});
