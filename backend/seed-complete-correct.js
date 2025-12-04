/**
 * Complete Seed File for Matrix POS
 * Date: 2025-12-04
 * Purpose: Seed database with correct schema-aligned data
 */

const { DataSource } = require('typeorm');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

async function seed() {
  // Database connection configuration
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123',
    database: process.env.DB_NAME || 'matrix_pos',
    entities: [__dirname + '/src/entities/*.entity{.ts,.js}'],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connected successfully');

    // ============================================================
    // 1. SEED BUSINESSES
    // ============================================================
    console.log('Seeding businesses...');
    
    const business = dataSource.getRepository(Business).create({
      id: 'business-1',
      name: 'Matrix Retail Store',
      business_type: 'retail',
      status: 'active',
      registration_number: 'REG-2024-001',
      tax_number: 'TAX-123456',
      email: 'contact@matrixpos.com',
      phone: '+1-555-0100',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postal_code: '10001',
      website: 'https://matrixpos.com',
      subscription_plan: 'premium',
      subscription_status: 'active',
      registration_date: new Date('2024-01-01'),
    });

    await dataSource.getRepository(Business).save(business);
    console.log('✓ Business created: Matrix Retail Store');

    // ============================================================
    // 2. SEED LOCATIONS
    // ============================================================
    console.log('Seeding locations...');
    
    const locations = [
      {
        id: 'location-central',
        business_id: 'business-1',
        code: 'CENTRAL',
        name: 'Central Store',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postal_code: '10001',
        phone: '+1-555-0101',
        email: 'central@matrixpos.com',
        timezone: 'America/New_York',
        currency: 'USD',
        tax_rate: 8.875,
        status: 'active',
        opening_date: new Date('2024-01-15'),
      },
      {
        id: 'location-west',
        business_id: 'business-1',
        code: 'WEST',
        name: 'West Side Branch',
        address: '456 West Avenue',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        postal_code: '90001',
        phone: '+1-555-0102',
        email: 'west@matrixpos.com',
        timezone: 'America/Los_Angeles',
        currency: 'USD',
        tax_rate: 9.5,
        status: 'active',
        opening_date: new Date('2024-02-01'),
      },
    ];

    for (const locationData of locations) {
      const location = dataSource.getRepository(Location).create(locationData);
      await dataSource.getRepository(Location).save(location);
      console.log(`✓ Location created: ${locationData.name}`);
    }

    // ============================================================
    // 3. SEED USERS
    // ============================================================
    console.log('Seeding users...');
    
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        id: 'user-owner',
        business_id: 'business-1',
        name: 'John Owner',
        email: 'owner@matrixpos.com',
        password_hash: passwordHash,
        role: 'owner',
        status: 'active',
        permissions: JSON.stringify({ all: true }),
      },
      {
        id: 'user-admin',
        business_id: 'business-1',
        name: 'Admin User',
        email: 'admin@matrixpos.com',
        password_hash: passwordHash,
        role: 'admin',
        location_id: 'location-central',
        status: 'active',
        permissions: JSON.stringify({ 
          products: true, 
          sales: true, 
          customers: true, 
          reports: true 
        }),
      },
      {
        id: 'user-cashier',
        business_id: 'business-1',
        name: 'Jane Cashier',
        email: 'cashier@matrixpos.com',
        password_hash: passwordHash,
        role: 'cashier',
        location_id: 'location-central',
        status: 'active',
        permissions: JSON.stringify({ pos: true, sales: true }),
      },
    ];

    for (const userData of users) {
      const user = dataSource.getRepository(User).create(userData);
      await dataSource.getRepository(User).save(user);
      console.log(`✓ User created: ${userData.name} (${userData.role})`);
    }

    // Update business owner_id
    business.owner_id = 'user-owner';
    await dataSource.getRepository(Business).save(business);

    // ============================================================
    // 4. SEED CURRENCIES
    // ============================================================
    console.log('Seeding currencies...');
    
    const currencies = [
      {
        id: uuidv4(),
        business_id: 'business-1',
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        exchange_rate: 1.0,
        is_base: 1,
        is_active: 1,
      },
      {
        id: uuidv4(),
        business_id: 'business-1',
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        exchange_rate: 0.85,
        is_base: 0,
        is_active: 1,
      },
      {
        id: uuidv4(),
        business_id: 'business-1',
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        exchange_rate: 0.73,
        is_base: 0,
        is_active: 1,
      },
    ];

    for (const currencyData of currencies) {
      const currency = dataSource.getRepository(Currency).create(currencyData);
      await dataSource.getRepository(Currency).save(currency);
      console.log(`✓ Currency created: ${currencyData.code}`);
    }

    // ============================================================
    // 5. SEED CUSTOMERS
    // ============================================================
    console.log('Seeding customers...');
    
    const customers = [
      {
        id: uuidv4(),
        business_id: 'business-1',
        location_id: 'location-central',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '+1-555-1001',
        address: '789 Oak Street',
        city: 'New York',
        country: 'USA',
        postal_code: '10002',
        customer_type: 'vip',
        credit_limit: 5000,
        loyalty_points: 1500,
        loyalty_tier: 'silver',
        discount_percentage: 5,
        is_active: 1,
      },
      {
        id: uuidv4(),
        business_id: 'business-1',
        location_id: 'location-central',
        name: 'Bob Smith',
        email: 'bob@example.com',
        phone: '+1-555-1002',
        address: '321 Pine Avenue',
        city: 'New York',
        country: 'USA',
        postal_code: '10003',
        customer_type: 'regular',
        credit_limit: 1000,
        loyalty_points: 500,
        loyalty_tier: 'bronze',
        discount_percentage: 0,
        is_active: 1,
      },
      {
        id: uuidv4(),
        business_id: 'business-1',
        location_id: 'location-west',
        name: 'Carol Williams',
        email: 'carol@example.com',
        phone: '+1-555-1003',
        address: '654 Elm Street',
        city: 'Los Angeles',
        country: 'USA',
        postal_code: '90002',
        customer_type: 'wholesale',
        credit_limit: 10000,
        loyalty_points: 8500,
        loyalty_tier: 'gold',
        discount_percentage: 15,
        is_active: 1,
      },
    ];

    for (const customerData of customers) {
      const customer = dataSource.getRepository(Customer).create(customerData);
      await dataSource.getRepository(Customer).save(customer);
      console.log(`✓ Customer created: ${customerData.name}`);
    }

    // ============================================================
    // 6. SEED PRODUCTS
    // ============================================================
    console.log('Seeding products...');
    
    const products = [
      {
        id: uuidv4(),
        business_id: 'business-1',
        scope: 'central',
        name: 'Laptop - Dell XPS 13',
        sku: 'DELL-XPS-13',
        barcode: '1234567890123',
        price: 999.99,
        cost: 750.00,
        track_inventory: 1,
        allow_negative_stock: 0,
        status: 1,
      },
      {
        id: uuidv4(),
        business_id: 'business-1',
        scope: 'central',
        name: 'Mouse - Logitech MX Master',
        sku: 'LOG-MX-MASTER',
        barcode: '1234567890124',
        price: 99.99,
        cost: 65.00,
        track_inventory: 1,
        allow_negative_stock: 0,
        status: 1,
      },
      {
        id: uuidv4(),
        business_id: 'business-1',
        scope: 'central',
        name: 'Keyboard - Mechanical RGB',
        sku: 'KB-MECH-RGB',
        barcode: '1234567890125',
        price: 149.99,
        cost: 90.00,
        track_inventory: 1,
        allow_negative_stock: 0,
        status: 1,
      },
      {
        id: uuidv4(),
        business_id: 'business-1',
        scope: 'location',
        location_id: 'location-central',
        name: 'USB Cable - Type C',
        sku: 'USB-C-CABLE',
        barcode: '1234567890126',
        price: 19.99,
        cost: 8.00,
        track_inventory: 1,
        allow_negative_stock: 1,
        status: 1,
      },
      {
        id: uuidv4(),
        business_id: 'business-1',
        scope: 'central',
        name: 'Monitor - 27" 4K',
        sku: 'MON-27-4K',
        barcode: '1234567890127',
        price: 449.99,
        cost: 320.00,
        track_inventory: 1,
        allow_negative_stock: 0,
        status: 1,
      },
    ];

    for (const productData of products) {
      const product = dataSource.getRepository(Product).create(productData);
      await dataSource.getRepository(Product).save(product);
      console.log(`✓ Product created: ${productData.name}`);
    }

    // ============================================================
    // 7. SEED DISCOUNTS
    // ============================================================
    console.log('Seeding discounts...');
    
    const discounts = [
      {
        id: uuidv4(),
        business_id: 'business-1',
        name: '10% Off Storewide',
        code: 'SAVE10',
        description: 'Get 10% off your entire purchase',
        discount_type: 'percentage',
        value_type: 'percentage',
        discount_value: 10,
        applies_to: 'all_products',
        minimum_purchase: 0,
        application_method: 'coupon_code',
        valid_from: new Date('2024-01-01'),
        valid_until: new Date('2024-12-31'),
        priority: 5,
        can_combine: 1,
        is_active: 1,
      },
      {
        id: uuidv4(),
        business_id: 'business-1',
        name: '$50 Off Orders Over $500',
        code: 'SAVE50',
        description: 'Save $50 on orders over $500',
        discount_type: 'fixed_amount',
        value_type: 'fixed',
        discount_value: 50,
        applies_to: 'all_products',
        minimum_purchase: 500,
        application_method: 'coupon_code',
        valid_from: new Date('2024-01-01'),
        valid_until: new Date('2024-12-31'),
        priority: 10,
        can_combine: 0,
        is_active: 1,
      },
      {
        id: uuidv4(),
        business_id: 'business-1',
        name: 'Buy 2 Get 1 Free',
        code: 'B2G1',
        description: 'Buy 2 items, get 1 free',
        discount_type: 'buy_x_get_y',
        value_type: 'percentage',
        discount_value: 0,
        applies_to: 'all_products',
        buy_quantity: 2,
        get_quantity: 1,
        get_discount_percentage: 100,
        application_method: 'automatic',
        valid_from: new Date('2024-01-01'),
        valid_until: new Date('2024-12-31'),
        priority: 8,
        can_combine: 0,
        is_active: 1,
      },
      {
        id: uuidv4(),
        business_id: 'business-1',
        location_id: 'location-central',
        name: 'VIP Customer Discount',
        description: 'Special discount for VIP customers',
        discount_type: 'percentage',
        value_type: 'percentage',
        discount_value: 15,
        applies_to: 'customers',
        application_method: 'automatic',
        priority: 12,
        can_combine: 1,
        is_active: 1,
      },
    ];

    for (const discountData of discounts) {
      const discount = dataSource.getRepository(Discount).create(discountData);
      await dataSource.getRepository(Discount).save(discount);
      console.log(`✓ Discount created: ${discountData.name}`);
    }

    // ============================================================
    // SEED COMPLETED
    // ============================================================
    console.log('\n✅ Database seeded successfully!');
    console.log('\nDefault Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Owner:   owner@matrixpos.com / password123');
    console.log('Admin:   admin@matrixpos.com / password123');
    console.log('Cashier: cashier@matrixpos.com / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await dataSource.destroy();
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

// Run the seed function
seed();
