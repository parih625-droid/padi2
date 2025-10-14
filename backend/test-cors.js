const axios = require('axios');

async function testCors() {
  try {
    console.log('Testing CORS with origin header...');
    
    // Test with a fake origin to simulate browser request
    const response = await axios.get('http://87.107.12.71:5000/api/categories?with_products=true', {
      headers: {
        'Origin': 'https://padidekhoy.ir'
      }
    });
    
    console.log('Success:', response.status);
    console.log('CORS headers in response:', response.headers['access-control-allow-origin']);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('CORS headers in response:', error.response.headers['access-control-allow-origin']);
    }
  }
}

testCors();