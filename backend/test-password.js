const argon2 = require('argon2');
const mysql = require('mysql2/promise');

async function test() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '123',
    database: 'matrix_pos'
  });
  
  const [rows] = await conn.execute('SELECT email, password_hash FROM users WHERE email = ?', ['owner@pos.com']);
  
  if (rows.length > 0) {
    const user = rows[0];
    console.log('Email:', user.email);
    console.log('Hash preview:', user.password_hash.substring(0, 50) + '...');
    console.log('Hash length:', user.password_hash.length);
    
    try {
      const valid = await argon2.verify(user.password_hash, 'password123');
      console.log('\nPassword verification:', valid ? '✅ VALID' : '❌ INVALID');
      
      if (!valid) {
        console.log('\n🔄 Testing hash generation...');
        const newHash = await argon2.hash('password123');
        console.log('New hash preview:', newHash.substring(0, 50) + '...');
        const testValid = await argon2.verify(newHash, 'password123');
        console.log('New hash verification:', testValid ? '✅ VALID' : '❌ INVALID');
      }
    } catch (err) {
      console.log('❌ Error verifying:', err.message);
    }
  } else {
    console.log('❌ User not found');
  }
  
  await conn.end();
}

test();
