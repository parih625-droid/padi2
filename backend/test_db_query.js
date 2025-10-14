const { pool } = require('./config/database');

async function testQuery() {
  try {
    console.log('Testing database query...');
    const [rows] = await pool.execute(`
      SELECT o.*, u.name as user_name, u.email as user_email 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `);
    console.log('Query executed successfully, rows found:', rows.length);
    console.log('Sample rows:', rows.slice(0, 2));
  } catch (error) {
    console.error('=== DATABASE QUERY ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
  }
}

testQuery();