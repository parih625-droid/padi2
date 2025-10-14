const axios = require('axios');

async function testUsersAPI() {
  try {
    // First login to get a token
    console.log('Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    
    console.log('Login successful, token:', loginResponse.data.token.substring(0, 50) + '...');
    
    // Use the token to fetch users
    const token = loginResponse.data.token;
    console.log('Fetching users...');
    
    const usersResponse = await axios.get('http://localhost:5000/api/auth/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Users response status:', usersResponse.status);
    console.log('Users response data:', JSON.stringify(usersResponse.data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testUsersAPI();