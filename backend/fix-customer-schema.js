const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixCustomerSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  });

  try {
    console.log('Checking customers table schema...');
    
    // Check if location_id column exists
    const [columns] = await connection.execute(
      `SHOW COLUMNS FROM customers LIKE 'location_id'`
    );
    
    if (columns.length === 0) {
      console.log('Adding location_id column...');
      await connection.execute(
        `ALTER TABLE customers ADD COLUMN location_id VARCHAR(36) NULL AFTER business_id`
      );
      console.log('✅ location_id column added');
      
      // Now assign location_ids
      const [locations] = await connection.execute(
        'SELECT id, name FROM locations ORDER BY created_at ASC LIMIT 2'
      );
      
      if (locations.length >= 2) {
        const [customers] = await connection.execute(
          'SELECT id FROM customers ORDER BY created_at ASC'
        );
        
        const halfPoint = Math.floor(customers.length / 2);
        
        // Assign first half to location 1
        for (let i = 0; i < halfPoint; i++) {
          await connection.execute(
            'UPDATE customers SET location_id = ? WHERE id = ?',
            [locations[0].id, customers[i].id]
          );
        }
        console.log(`✅ Assigned ${halfPoint} customers to ${locations[0].name}`);
        
        // Assign second half to location 2
        for (let i = halfPoint; i < customers.length; i++) {
          await connection.execute(
            'UPDATE customers SET location_id = ? WHERE id = ?',
            [locations[1].id, customers[i].id]
          );
        }
        console.log(`✅ Assigned ${customers.length - halfPoint} customers to ${locations[1].name}`);
      }
    } else {
      console.log('✅ location_id column already exists');
      
      // Check if any customers need location assignment
      const [unassigned] = await connection.execute(
        'SELECT COUNT(*) as count FROM customers WHERE location_id IS NULL'
      );
      
      if (unassigned[0].count > 0) {
        console.log(`Found ${unassigned[0].count} customers without location_id, assigning...`);
        
        const [locations] = await connection.execute(
          'SELECT id, name FROM locations ORDER BY created_at ASC LIMIT 2'
        );
        
        if (locations.length >= 2) {
          const [customers] = await connection.execute(
            'SELECT id FROM customers WHERE location_id IS NULL ORDER BY created_at ASC'
          );
          
          const halfPoint = Math.floor(customers.length / 2);
          
          for (let i = 0; i < halfPoint; i++) {
            await connection.execute(
              'UPDATE customers SET location_id = ? WHERE id = ?',
              [locations[0].id, customers[i].id]
            );
          }
          console.log(`✅ Assigned ${halfPoint} customers to ${locations[0].name}`);
          
          for (let i = halfPoint; i < customers.length; i++) {
            await connection.execute(
              'UPDATE customers SET location_id = ? WHERE id = ?',
              [locations[1].id, customers[i].id]
            );
          }
          console.log(`✅ Assigned ${customers.length - halfPoint} customers to ${locations[1].name}`);
        }
      } else {
        console.log('✅ All customers already have location_id assigned');
      }
    }
    
    // Verify
    const [stats] = await connection.execute(`
      SELECT 
        l.name as location_name,
        COUNT(c.id) as customer_count
      FROM locations l
      LEFT JOIN customers c ON c.location_id = l.id
      GROUP BY l.id, l.name
      ORDER BY l.created_at ASC
    `);
    
    console.log('\n📊 Customer distribution by location:');
    stats.forEach(stat => {
      console.log(`   ${stat.location_name}: ${stat.customer_count} customers`);
    });
    
  } catch (error) {
    console.error('Error fixing customer schema:', error);
  } finally {
    await connection.end();
  }
}

fixCustomerSchema();
