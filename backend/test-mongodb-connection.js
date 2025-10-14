const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

console.log('Testing MongoDB connection...');
console.log('DB_CONNECTION_STRING:', process.env.DB_CONNECTION_STRING);

mongoose.connect(process.env.DB_CONNECTION_STRING, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 5000,
  connectTimeoutMS: 5000
}).then(() => {
  console.log('✅ Successfully connected to MongoDB');
  mongoose.connection.close();
  process.exit(0);
}).catch((error) => {
  console.error('❌ Failed to connect to MongoDB:', error.message);
  console.error('Error code:', error.code);
  process.exit(1);
});