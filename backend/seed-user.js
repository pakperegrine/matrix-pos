const Database = require('better-sqlite3');
const argon2 = require('argon2');
const { v4: uuid } = require('uuid');

async function seedUser() {
  console.log('🔐 Creating demo user...\n');

  const db = new Database('./dev.sqlite');

  // Create users table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      business_id VARCHAR(255),
      name VARCHAR(255),
      email VARCHAR(255),
      password_hash TEXT
    )
  `);

  // Check if user already exists
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get('pos_repo@gmail.com');
  
  if (existing) {
    console.log('✅ Demo user already exists');
    console.log('   Email: pos_repo@gmail.com');
    console.log('   Password: Pos123*\n');
    db.close();
    return;
  }

  // Hash password
  const passwordHash = await argon2.hash('Pos123*');

  // Insert demo user
  const userId = uuid();
  const stmt = db.prepare(`
    INSERT INTO users (id, business_id, name, email, password_hash)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(userId, 'business-1', 'Admin User', 'pos_repo@gmail.com', passwordHash);

  console.log('✅ Demo user created successfully!');
  console.log('\n📧 Login Credentials:');
  console.log('   Email: pos_repo@gmail.com');
  console.log('   Password: Pos123*');
  console.log('   Business ID: business-1\n');

  db.close();
  console.log('🎉 User seeding complete!');
}

seedUser().catch(err => {
  console.error('❌ Error seeding user:', err);
  process.exit(1);
});
