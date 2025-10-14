const axios = require('axios');

async function testHealth() {
  try {
    console.log('Testing health endpoint...');
    const response = await axios.get('http://localhost:5000/api/health');
    console.log('Health response:', response.data);
  } catch (error) {
    console.error('Health test failed:', error.message);
  }
}

testHealth();