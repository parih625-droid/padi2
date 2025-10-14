const { pool } = require('./config/database');

async function checkOrders() {
  try {
    console.log('Checking orders in database...');
    const [rows] = await pool.execute('SELECT id, status, customer_name, total_price, created_at FROM orders ORDER BY created_at DESC');
    console.log('Orders in database:');
    console.table(rows);
    console.log('Total orders:', rows.length);
    
    // Count by status
    const [statusCounts] = await pool.execute('SELECT status, COUNT(*) as count FROM orders GROUP BY status');
    console.log('Orders by status:');
    console.table(statusCounts);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

checkOrders();