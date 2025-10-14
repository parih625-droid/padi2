const Order = require('./models/Order');

async function testOrderModel() {
  try {
    console.log('Testing Order.getAll() directly...');
    
    const orders = await Order.getAll(50, 0);
    console.log('Orders retrieved:', orders.length);
    console.log('Orders:', JSON.stringify(orders, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testOrderModel();