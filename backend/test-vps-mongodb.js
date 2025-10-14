const mongoose = require('mongoose');

// Test connection to MongoDB on VPS
console.log('Testing connection to MongoDB on VPS (87.107.12.71)...');

// Connection string for MongoDB on your VPS
// Note: This assumes MongoDB is configured to accept external connections
const vpsConnectionString = 'mongodb://padidekhoy:Re1317821Za@87.107.12.71:27017/ecommerce_db';

console.log('Attempting to connect to:', vpsConnectionString);

mongoose.connect(vpsConnectionString, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 5000,
  connectTimeoutMS: 5000
}).then(() => {
  console.log('✅ Successfully connected to MongoDB on VPS!');
  
  // Test a simple query
  mongoose.connection.db.listCollections().toArray((err, collections) => {
    if (err) {
      console.error('Error listing collections:', err);
    } else {
      console.log('Available collections:', collections.map(c => c.name));
    }
    
    mongoose.connection.close();
    console.log('Connection closed.');
    process.exit(0);
  });
}).catch((error) => {
  console.error('❌ Failed to connect to MongoDB on VPS:', error.message);
  console.error('Error code:', error.code);
  
  // Provide troubleshooting tips
  console.log('\nTroubleshooting tips:');
  console.log('1. Make sure MongoDB is running on your VPS');
  console.log('2. Check if MongoDB is configured to accept external connections');
  console.log('3. Verify firewall settings on your VPS allow connections on port 27017');
  console.log('4. Ensure the user "padidekhoy" exists with the correct password');
  console.log('5. Check if MongoDB bindIp is set to 0.0.0.0 in mongod.conf');
  
  process.exit(1);
});