const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login endpoint');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    
    console.log('Login successful');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Login failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testLogin();