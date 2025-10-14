const axios = require('axios');

async function testOrdersAPI() {
  try {
    console.log('Testing orders API...');
    
    // First login to get a valid token
    console.log('Attempting login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    
    console.log('Login successful');
    console.log('Token:', loginResponse.data.token);
    
    // Decode the token to see what's in it
    const tokenParts = loginResponse.data.token.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    console.log('Decoded token payload:', payload);
    
    // Use the token to call the orders API
    console.log('Calling orders API...');
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
      console.error('Response headers:', error.response.headers);
    }
  }
}

testOrdersAPI();