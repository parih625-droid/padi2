const axios = require('axios');

async function testOrdersAPI() {
  try {
    console.log('Testing orders API...');
    
    // First login to get a valid token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    
    console.log('Login successful, token:', loginResponse.data.token);
    
    // Use the token to call the orders API
    const ordersResponse = await axios.get('http://localhost:5000/api/orders/admin/all', {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('Orders response status:', ordersResponse.status);
    console.log('Orders response data:', JSON.stringify(ordersResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testOrdersAPI();