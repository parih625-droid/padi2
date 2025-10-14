const axios = require('axios');

async function testEndpoint() {
  try {
    console.log('Testing test endpoint...');
    const response = await axios.get('http://localhost:5000/api/test-orders');
    console.log('Test response:', response.data);
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testEndpoint();