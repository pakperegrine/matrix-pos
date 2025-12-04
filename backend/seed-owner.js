const Database = require('better-sqlite3');
const argon2 = require('argon2');
const { v4: uuid } = require('uuid');

async function seedOwner() {
  console.log('🔐 Creating owner account and setting up business...\n');

  const db = new Database('./dev.sqlite');

  try {
    // Apply migration
    console.log('📋 Applying owner management migration...');
    const migration = require('fs').readFileSync('../migrations/005_owner_management.sql', 'utf-8');
    
    // Split and execute SQL statements
    const statements = migration.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      if (stmt.trim()) {
        try {
          db.exec(stmt);
        } catch (err) {
          // Ignore "duplicate column" errors
          if (!err.message.includes('duplicate column')) {
            console.error('SQL Error:', err.message);
          }
        }
      }
    }
    console.log('✅ Migration applied\n');

    // Check if owner exists
    const existingOwner = db.prepare('SELECT * FROM users WHERE role = ?').get('owner');
    
    if (existingOwner) {
      console.log('✅ Owner account already exists');
      console.log('   Email: owner@pos.com');
      console.log('   Password: Owner123*\n');
      
      // Update business
      const business = db.prepare('SELECT * FROM businesses LIMIT 1').get();
      if (business) {
        db.prepare('UPDATE businesses SET owner_id = ?, status = ?, subscription_plan = ? WHERE id = ?')
          .run(existingOwner.id, 'active', 'premium', business.id);
        console.log('✅ Business updated');
      }
      
      db.close();
      return;
    }

    // Create owner user
    const passwordHash = await argon2.hash('Owner123*');
    const ownerId = uuid();
    const business = db.prepare('SELECT * FROM businesses LIMIT 1').get();
    
    if (!business) {
      console.error('❌ No business found. Please run seed.js first.');
      db.close();
      return;
    }

    const userStmt = db.prepare(`
      INSERT INTO users (id, business_id, name, email, password_hash, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    userStmt.run(
      ownerId,
      business.id,
      'Business Owner',
      'owner@pos.com',
      passwordHash,
      'owner',
      'active'
    );

    console.log('✅ Owner account created successfully!');
    console.log('\n📧 Owner Login Credentials:');
    console.log('   Email: owner@pos.com');
    console.log('   Password: Owner123*');
    console.log('   Role: owner');
    console.log('   Business ID:', business.id);

    // Update business with owner
    db.prepare('UPDATE businesses SET owner_id = ?, status = ?, subscription_plan = ? WHERE id = ?')
      .run(ownerId, 'active', 'premium', business.id);

    console.log('\n✅ Business updated with owner\n');

    // Create a sample location
    const locationId = uuid();
    const locationStmt = db.prepare(`
      INSERT INTO locations (id, business_id, name, code, city, state, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    locationStmt.run(
      locationId,
      business.id,
      'Main Store',
      'MAIN',
      'New York',
      'NY',
      'active'
    );

    console.log('✅ Created sample location: Main Store\n');

    db.close();
    console.log('🎉 Owner setup complete!');
    console.log('\n📱 Access the owner dashboard at: http://localhost:4200/owner');
  } catch (err) {
    console.error('❌ Error:', err);
    db.close();
    process.exit(1);
  }
}

seedOwner();
