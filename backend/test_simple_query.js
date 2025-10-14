const { pool } = require('./config/database');

async function testSimpleQuery() {
  try {
    console.log('Testing simple database query without parameters...');
    
    // First try a simple query without parameters
    const [rows] = await pool.execute(
      'SELECT o.*, u.name as user_name, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC'
    );
    
    console.log('Simple query executed successfully, rows found:', rows.length);
    console.log('Sample rows:', rows.slice(0, 2));
    
    // Now try with parameters
    console.log('\nTesting query with parameters...');
    const [rows2] = await pool.execute(
      'SELECT o.*, u.name as user_name, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 10 OFFSET 0'
    );
    
    console.log('Parameterized query executed successfully, rows found:', rows2.length);
    console.log('Sample rows:', rows2.slice(0, 2));
    
  } catch (error) {
    console.error('=== SIMPLE QUERY ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
  }
}

testSimpleQuery();