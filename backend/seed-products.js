const axios = require('axios');

// Sample products to seed
const sampleProducts = [
  // Electronics
  { name: 'Wireless Mouse', sku: 'ELEC-001', barcode: '1234567890123', price: 29.99, cost: 15.50, category_id: 'electronics', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'USB-C Cable 2m', sku: 'ELEC-002', barcode: '1234567890124', price: 12.99, cost: 6.00, category_id: 'electronics', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Bluetooth Headphones', sku: 'ELEC-003', barcode: '1234567890125', price: 79.99, cost: 42.00, category_id: 'electronics', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Wireless Keyboard', sku: 'ELEC-004', barcode: '1234567890126', price: 45.99, cost: 24.00, category_id: 'electronics', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'USB Flash Drive 32GB', sku: 'ELEC-005', barcode: '1234567890127', price: 15.99, cost: 8.00, category_id: 'electronics', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'HDMI Cable 3m', sku: 'ELEC-006', barcode: '1234567890128', price: 18.99, cost: 9.50, category_id: 'electronics', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Phone Stand', sku: 'ELEC-007', barcode: '1234567890129', price: 9.99, cost: 4.50, category_id: 'electronics', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Laptop Sleeve 15"', sku: 'ELEC-008', barcode: '1234567890130', price: 24.99, cost: 12.00, category_id: 'electronics', unit_id: 'pcs', track_inventory: true, is_active: 1 },

  // Food & Beverage
  { name: 'Organic Coffee Beans', sku: 'FOOD-001', barcode: '2234567890123', price: 16.99, cost: 8.50, category_id: 'food', unit_id: 'kg', track_inventory: true, is_active: 1 },
  { name: 'Green Tea (100 bags)', sku: 'FOOD-002', barcode: '2234567890124', price: 12.99, cost: 6.00, category_id: 'food', unit_id: 'box', track_inventory: true, is_active: 1 },
  { name: 'Chocolate Bar', sku: 'FOOD-003', barcode: '2234567890125', price: 3.99, cost: 1.80, category_id: 'food', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Energy Drink', sku: 'FOOD-004', barcode: '2234567890126', price: 2.99, cost: 1.20, category_id: 'food', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Bottled Water 1L', sku: 'FOOD-005', barcode: '2234567890127', price: 1.49, cost: 0.60, category_id: 'food', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Trail Mix 500g', sku: 'FOOD-006', barcode: '2234567890128', price: 8.99, cost: 4.50, category_id: 'food', unit_id: 'pack', track_inventory: true, is_active: 1 },

  // Office Supplies
  { name: 'Ballpoint Pens (Pack of 10)', sku: 'OFF-001', barcode: '3234567890123', price: 6.99, cost: 3.20, category_id: 'office', unit_id: 'pack', track_inventory: true, is_active: 1 },
  { name: 'Spiral Notebook A4', sku: 'OFF-002', barcode: '3234567890124', price: 4.99, cost: 2.30, category_id: 'office', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Sticky Notes (Pack of 6)', sku: 'OFF-003', barcode: '3234567890125', price: 7.99, cost: 3.80, category_id: 'office', unit_id: 'pack', track_inventory: true, is_active: 1 },
  { name: 'Desk Organizer', sku: 'OFF-004', barcode: '3234567890126', price: 19.99, cost: 10.00, category_id: 'office', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Stapler', sku: 'OFF-005', barcode: '3234567890127', price: 8.99, cost: 4.50, category_id: 'office', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Paper Clips (Box of 100)', sku: 'OFF-006', barcode: '3234567890128', price: 2.99, cost: 1.20, category_id: 'office', unit_id: 'box', track_inventory: true, is_active: 1 },
  { name: 'Highlighters (Set of 4)', sku: 'OFF-007', barcode: '3234567890129', price: 5.99, cost: 2.80, category_id: 'office', unit_id: 'pack', track_inventory: true, is_active: 1 },

  // Clothing
  { name: 'Cotton T-Shirt (White)', sku: 'CLO-001', barcode: '4234567890123', price: 19.99, cost: 9.00, category_id: 'clothing', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Denim Jeans', sku: 'CLO-002', barcode: '4234567890124', price: 49.99, cost: 25.00, category_id: 'clothing', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Running Socks (3-Pack)', sku: 'CLO-003', barcode: '4234567890125', price: 12.99, cost: 6.00, category_id: 'clothing', unit_id: 'pack', track_inventory: true, is_active: 1 },
  { name: 'Baseball Cap', sku: 'CLO-004', barcode: '4234567890126', price: 24.99, cost: 12.00, category_id: 'clothing', unit_id: 'pcs', track_inventory: true, is_active: 1 },

  // Health & Beauty
  { name: 'Hand Sanitizer 500ml', sku: 'HLT-001', barcode: '5234567890123', price: 8.99, cost: 4.20, category_id: 'health', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Face Masks (Box of 50)', sku: 'HLT-002', barcode: '5234567890124', price: 19.99, cost: 10.00, category_id: 'health', unit_id: 'box', track_inventory: true, is_active: 1 },
  { name: 'Shampoo 400ml', sku: 'HLT-003', barcode: '5234567890125', price: 12.99, cost: 6.50, category_id: 'health', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Toothbrush (2-Pack)', sku: 'HLT-004', barcode: '5234567890126', price: 6.99, cost: 3.20, category_id: 'health', unit_id: 'pack', track_inventory: true, is_active: 1 },

  // Sports & Outdoors
  { name: 'Yoga Mat', sku: 'SPT-001', barcode: '6234567890123', price: 34.99, cost: 18.00, category_id: 'sports', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Water Bottle 750ml', sku: 'SPT-002', barcode: '6234567890124', price: 14.99, cost: 7.50, category_id: 'sports', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Resistance Bands Set', sku: 'SPT-003', barcode: '6234567890125', price: 24.99, cost: 12.00, category_id: 'sports', unit_id: 'pack', track_inventory: true, is_active: 1 },
  { name: 'Tennis Balls (3-Pack)', sku: 'SPT-004', barcode: '6234567890126', price: 8.99, cost: 4.20, category_id: 'sports', unit_id: 'pack', track_inventory: true, is_active: 1 },

  // Books & Media
  { name: 'Blank Journal', sku: 'BK-001', barcode: '7234567890123', price: 14.99, cost: 7.00, category_id: 'books', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Coloring Book', sku: 'BK-002', barcode: '7234567890124', price: 9.99, cost: 4.80, category_id: 'books', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Bookmark Set (5-Pack)', sku: 'BK-003', barcode: '7234567890125', price: 5.99, cost: 2.50, category_id: 'books', unit_id: 'pack', track_inventory: true, is_active: 1 },

  // Toys & Games
  { name: 'Puzzle 1000 Pieces', sku: 'TOY-001', barcode: '8234567890123', price: 19.99, cost: 10.00, category_id: 'toys', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Playing Cards Deck', sku: 'TOY-002', barcode: '8234567890124', price: 5.99, cost: 2.80, category_id: 'toys', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Board Game', sku: 'TOY-003', barcode: '8234567890125', price: 34.99, cost: 18.00, category_id: 'toys', unit_id: 'pcs', track_inventory: true, is_active: 1 },

  // Automotive
  { name: 'Car Air Freshener', sku: 'AUTO-001', barcode: '9234567890123', price: 4.99, cost: 2.20, category_id: 'automotive', unit_id: 'pcs', track_inventory: true, is_active: 1 },
  { name: 'Microfiber Cloth (3-Pack)', sku: 'AUTO-002', barcode: '9234567890124', price: 8.99, cost: 4.20, category_id: 'automotive', unit_id: 'pack', track_inventory: true, is_active: 1 },
  { name: 'Phone Car Mount', sku: 'AUTO-003', barcode: '9234567890125', price: 16.99, cost: 8.50, category_id: 'automotive', unit_id: 'pcs', track_inventory: true, is_active: 1 }
];

async function seedProducts() {
  const API_URL = 'http://localhost:3000/api';
  
  // You'll need to get a valid JWT token first
  // For demo purposes, using a placeholder - replace with actual token
  const token = 'YOUR_JWT_TOKEN_HERE';
  
  console.log('🌱 Starting to seed products...\n');
  
  let successCount = 0;
  let errorCount = 0;

  for (const product of sampleProducts) {
    try {
      const response = await axios.post(`${API_URL}/products`, product, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      successCount++;
      console.log(`✅ Created: ${product.name} (${product.sku})`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Failed: ${product.name} - ${error.response?.data?.message || error.message}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${errorCount}`);
  console.log(`   Total: ${sampleProducts.length}`);
}

// If running directly (not imported)
if (require.main === module) {
  if (process.argv[2]) {
    // Token provided as command line argument
    const token = process.argv[2];
    seedProducts().catch(console.error);
  } else {
    console.log('⚠️  Please provide JWT token as argument:');
    console.log('   node seed-products.js YOUR_JWT_TOKEN');
    console.log('\nTo get a token:');
    console.log('   1. Login via /api/auth/login endpoint');
    console.log('   2. Copy the access_token from response');
    console.log('   3. Run: node seed-products.js <token>');
  }
}

module.exports = { sampleProducts };
