// test-db-connection.js
// Script to test database connection with current environment variables

require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB Atlas connection...');
console.log('Connection string:', process.env.DB_CONNECTION_STRING);

// Remove deprecated options
const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose.connect(process.env.DB_CONNECTION_STRING, options)
  .then(() => {
    console.log('✅ Connected successfully to MongoDB Atlas');
    console.log('Database name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Check if your IP address is whitelisted in MongoDB Atlas');
    console.log('2. Verify your username and password are correct');
    console.log('3. Ensure your MongoDB Atlas cluster is running');
    console.log('4. Check your internet connection');
    process.exit(1);
  });
