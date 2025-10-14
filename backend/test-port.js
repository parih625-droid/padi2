// test-port.js
// Script to test if a port is accessible

require('dotenv').config();

const net = require('net');

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 3306;

console.log(`Testing connection to ${host}:${port} with 5-second timeout`);

const socket = new net.Socket();

const timeout = setTimeout(() => {
  console.log(`❌ Connection timeout - Port ${port} is not accessible on ${host} (5-second timeout)`);
  process.exit(1);
}, 5000); // 5 second timeout

socket.connect(port, host, () => {
  clearTimeout(timeout);
  console.log(`✅ Port ${port} is accessible on ${host}`);
  socket.destroy();
  process.exit(0);
});

socket.on('error', (err) => {
  clearTimeout(timeout);
  console.log(`❌ Connection failed - Port ${port} is not accessible on ${host}`);
  console.log(`Error: ${err.message}`);
  process.exit(1);
});