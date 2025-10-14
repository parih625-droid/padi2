const { pool } = require('./config/database');
const User = require('./models/User');

async function testUsersFetch() {
  try {
    console.log('Testing database connection...');
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    connection.release();
    
    console.log('Testing User.getAll()');
    const users = await User.getAll(50, 0);
    console.log('Users found:', users);
    console.log('Number of users:', users.length);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testUsersFetch();