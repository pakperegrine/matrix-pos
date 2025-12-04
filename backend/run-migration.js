const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'dev.sqlite');
const migrationPath = path.join(__dirname, '..', 'migrations', '006_add_sale_date_column.sql');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the database.');
});

const sql = fs.readFileSync(migrationPath, 'utf8');

// Split SQL statements by semicolon and execute them one by one
const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

db.serialize(() => {
  statements.forEach((statement, index) => {
    db.run(statement, (err) => {
      if (err) {
        console.error(`Error executing statement ${index + 1}:`, err.message);
        console.error('Statement:', statement.trim());
      } else {
        console.log(`✓ Executed statement ${index + 1}`);
      }
    });
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('\n✓ Migration completed successfully!');
  }
});
