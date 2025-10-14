const { pool } = require('./config/database');

async function testParameterizedQuery() {
  try {
    console.log('Testing parameterized query with explicit number conversion...');
    
    // Convert to explicit numbers
    const limit = Number(50);
    const offset = Number(0);
    
    console.log('Limit:', limit, 'type:', typeof limit);
    console.log('Offset:', offset, 'type:', typeof offset);
    
    const [rows] = await pool.execute(
      'SELECT o.*, u.name as user_name, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    
    console.log('Parameterized query executed successfully, rows found:', rows.length);
    console.log('Sample rows:', rows.slice(0, 2));
    
  } catch (error) {
    console.error('=== PARAMETERIZED QUERY ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
  }
}

testParameterizedQuery();