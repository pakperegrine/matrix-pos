const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateCustomerLocations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '123',
    database: process.env.DB_DATABASE || 'matrix_pos'
  });

  try {
    console.log('Connected to MySQL database');

    // Get all locations
    const [locations] = await connection.execute(
      'SELECT id, business_id, name FROM locations ORDER BY created_at ASC'
    );
    console.log(`Found ${locations.length} locations`);

    if (locations.length === 0) {
      console.log('No locations found. Please create locations first.');
      return;
    }

    // Get all customers without location_id
    const [customers] = await connection.execute(
      'SELECT id, business_id, name FROM customers WHERE location_id IS NULL'
    );
    console.log(`Found ${customers.length} customers without location_id`);

    if (customers.length === 0) {
      console.log('All customers already have location_id assigned.');
      return;
    }

    // Distribute customers evenly across locations
    let updateCount = 0;
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      // Find location for this customer's business
      const businessLocations = locations.filter(loc => loc.business_id === customer.business_id);
      
      if (businessLocations.length === 0) {
        console.log(`No location found for customer ${customer.name} (business: ${customer.business_id})`);
        continue;
      }

      // Round-robin distribution
      const locationIndex = i % businessLocations.length;
      const assignedLocation = businessLocations[locationIndex];

      await connection.execute(
        'UPDATE customers SET location_id = ? WHERE id = ?',
        [assignedLocation.id, customer.id]
      );
      
      updateCount++;
      console.log(`✓ Assigned ${customer.name} to location: ${assignedLocation.name}`);
    }

    console.log(`\n✅ Updated ${updateCount} customers with location_id`);

    // Verify the update
    const [verification] = await connection.execute(
      'SELECT location_id, COUNT(*) as count FROM customers GROUP BY location_id'
    );
    console.log('\nCustomers per location:');
    verification.forEach(row => {
      const location = locations.find(loc => loc.id === row.location_id);
      console.log(`  ${location ? location.name : 'NULL'}: ${row.count} customers`);
    });

  } catch (error) {
    console.error('Error updating customer locations:', error);
  } finally {
    await connection.end();
  }
}

updateCustomerLocations();
