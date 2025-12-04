const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function test() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123',
    database: 'matrix_pos'
  });

  const [users] = await connection.execute(
    'SELECT * FROM users WHERE email = ?',
    ['admin@matrixpos.com']
  );

  if (users.length === 0) {
    console.log('User not found!');
    return;
  }

  const user = users[0];
  console.log('User found:', {
    id: user.id,
    email: user.email,
    hash_length: user.password_hash?.length,
    hash_preview: user.password_hash?.substring(0, 30)
  });

  const testPassword = 'password123';
  const isValid = await bcrypt.compare(testPassword, user.password_hash);
  
  console.log('Password test:', testPassword);
  console.log('Password valid:', isValid);

  await connection.end();
}

test().catch(console.error);
