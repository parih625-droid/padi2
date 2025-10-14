const { pool } = require('./config/database');

async function checkUsers() {
  try {
    console.log('Checking users in database...');
    const [rows] = await pool.execute('SELECT id, name, email, role FROM users');
    console.log('Users in database:');
    console.table(rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

checkUsers();