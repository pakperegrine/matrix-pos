const bcrypt = require('bcrypt');

const hash = '$2b$10$orwPV3JyrR31zVW1c.FrTeD.jZgJOSIg0Ltc57HfR/7nQAGc5q7t.';
const password = 'password123';

bcrypt.compare(password, hash).then(result => {
  console.log('Password comparison result:', result);
  console.log('Hash:', hash);
  console.log('Password:', password);
}).catch(err => {
  console.error('Error:', err.message);
});
