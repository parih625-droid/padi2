// test-render-config.js
// Script to test Render deployment configuration

require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing Render deployment configuration...');

// Test environment variables
console.log('Environment Variables Check:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('- PORT:', process.env.PORT || 'Not set (defaulting to 5000)');
console.log('- DB_CONNECTION_STRING:', process.env.DB_CONNECTION_STRING ? 'Set' : 'Not set');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');

// Test MongoDB connection
const testMongoDBConnection = async () => {
  try {
    if (!process.env.DB_CONNECTION_STRING) {
      console.log('❌ DB_CONNECTION_STRING not set, skipping MongoDB test');
      return;
    }
    
    console.log('\nTesting MongoDB connection...');
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    };
    
    const conn = await mongoose.connect(process.env.DB_CONNECTION_STRING, options);
    console.log('✅ MongoDB connected successfully');
    console.log('   Host:', conn.connection.host);
    console.log('   Database:', conn.connection.name);
    
    // Test a simple query
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('   Collections count:', collections.length);
    
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
};

// Run tests
const runTests = async () => {
  await testMongoDBConnection();
  console.log('\n🎉 Configuration test completed!');
};

runTests();