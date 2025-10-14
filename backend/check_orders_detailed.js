const { pool } = require('./config/database');

async function checkOrdersDetailed() {
  try {
    console.log('Checking orders with user details...');
    const [rows] = await pool.execute(`
      SELECT o.*, u.name as user_name, u.email as user_email 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `);
    console.log('Orders with user details:');
    console.table(rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

checkOrdersDetailed();