// test-mongodb-simple.js
// Simple script to test MongoDB Atlas connection without dotenv

const mongoose = require('mongoose');

// Use the connection string directly (replace with your actual connection string)
const connectionString = 'mongodb+srv://padidekhoy_userdb:Re1317821Za@padidekhoy.ph4t43u.mongodb.net/ecommerce_db?retryWrites=true&w=majority';

async function testMongoDBConnection() {
  console.log('Testing MongoDB Atlas connection...');
  console.log('Connection string:', connectionString);

  try {
    console.log('\nAttempting to connect to MongoDB Atlas...');
    
    // Log connection string details (without sensitive information)
    const connectionStringParts = connectionString.split('@');
    if (connectionStringParts.length > 1) {
      const hostAndDb = connectionStringParts[1];
      console.log('MongoDB Host and Database:', hostAndDb);
    }
    
    // MongoDB connection options
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 10000, // 10 seconds
      connectTimeoutMS: 10000, // 10 seconds
    };
    
    console.log('Connection options:', options);
    
    const conn = await mongoose.connect(connectionString, options);
    
    console.log('✅ MongoDB connected successfully!');
    console.log('   Host:', conn.connection.host);
    console.log('   Database:', conn.connection.name);
    console.log('   Port:', conn.connection.port);
    
    // Test a simple query
    console.log('\nTesting database query...');
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('✅ Database query successful!');
    console.log('   Collections found:', collections.length);
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    
    console.log('\n🎉 All tests passed! MongoDB Atlas connection is working correctly.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('   Error message:', error.message);
    console.error('   Error name:', error.name);
    console.error('   Error code:', error.code);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('\n💡 Troubleshooting tips:');
      console.error('   1. Check if your MongoDB Atlas cluster is running');
      console.error('   2. Verify your IP address is whitelisted in MongoDB Atlas (should include 0.0.0.0/0)');
      console.error('   3. Check your username and password');
      console.error('   4. Ensure your connection string is correctly formatted');
    }
    
    process.exit(1);
  }
}

testMongoDBConnection();