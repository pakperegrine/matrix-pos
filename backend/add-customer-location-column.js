const mysql = require('mysql2/promise');
require('dotenv').config();

async function addLocationIdColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '123',
    database: process.env.DB_DATABASE || 'matrix_pos'
  });

  try {
    console.log('Connected to MySQL database');

    // Check if column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'location_id'
    `, [process.env.DB_DATABASE || 'matrix_pos']);

    if (columns.length > 0) {
      console.log('✓ location_id column already exists in customers table');
    } else {
      console.log('Adding location_id column to customers table...');
      await connection.execute(`
        ALTER TABLE customers 
        ADD COLUMN location_id VARCHAR(36) NULL AFTER business_id
      `);
      console.log('✓ location_id column added successfully');
    }

    // Now assign location_id to customers based on business locations
    console.log('\nAssigning location_id to customers...');
    
    // Get all locations
    const [locations] = await connection.execute(`
      SELECT id, business_id, name 
      FROM locations 
      ORDER BY business_id, created_at
    `);

    console.log(`Found ${locations.length} locations`);

    // Get customers without location_id
    const [customers] = await connection.execute(`
      SELECT id, business_id, name 
      FROM customers 
      WHERE location_id IS NULL
    `);

    console.log(`Found ${customers.length} customers without location_id`);

    if (customers.length === 0) {
      console.log('✓ All customers already have location_id assigned');
      await connection.end();
      return;
    }

    // Group locations by business_id
    const locationsByBusiness = {};
    locations.forEach(loc => {
      if (!locationsByBusiness[loc.business_id]) {
        locationsByBusiness[loc.business_id] = [];
      }
      locationsByBusiness[loc.business_id].push(loc);
    });

    // Assign customers to locations (distribute evenly)
    let updated = 0;
    for (const customer of customers) {
      const businessLocations = locationsByBusiness[customer.business_id];
      
      if (!businessLocations || businessLocations.length === 0) {
        console.log(`⚠ No locations found for business ${customer.business_id}, customer: ${customer.name}`);
        continue;
      }

      // Assign to first location (or distribute round-robin)
      const locationIndex = updated % businessLocations.length;
      const assignedLocation = businessLocations[locationIndex];

      await connection.execute(
        'UPDATE customers SET location_id = ? WHERE id = ?',
        [assignedLocation.id, customer.id]
      );

      console.log(`✓ Assigned customer "${customer.name}" to location "${assignedLocation.name}"`);
      updated++;
    }

    console.log(`\n✓ Updated ${updated} customers with location_id`);

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

addLocationIdColumn()
  .then(() => {
    console.log('\n✓ Migration completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n✗ Migration failed:', err);
    process.exit(1);
  });
