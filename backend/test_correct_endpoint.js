const axios = require('axios');

async function testCorrectEndpoint() {
  try {
    console.log('Testing correct endpoint: /api/orders/admin/all');
    
    // Use a valid token from previous test
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc1ODc5MjUxOSwiZXhwIjoxNzU5Mzk3MzE5fQ.OAbRmMoW7urWvwlxsaNiJdXsA6fCgx5uFnsTiruPQAc';
    
    const response = await axios.get('http://localhost:5000/api/orders/admin/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testCorrectEndpoint();