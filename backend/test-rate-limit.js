const http = require('http');

// Test the categories endpoint directly
const options = {
  hostname: '87.107.12.71',
  port: 5000,
  path: '/api/categories?with_products=true',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('Testing categories endpoint...');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  res.on('data', (chunk) => {
    console.log(`Body: ${chunk}`);
  });
  
  res.on('end', () => {
    console.log('Request completed');
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();