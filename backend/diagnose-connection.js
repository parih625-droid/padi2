// diagnose-connection.js
// Script to diagnose database connection issues

const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

console.log('=== Database Connection Diagnosis ===');
console.log('Current time:', new Date().toISOString());
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('DB_CONNECTION_STRING set:', !!process.env.DB_CONNECTION_STRING);

if (!process.env.DB_CONNECTION_STRING) {
  console.error('❌ DB_CONNECTION_STRING is not set in environment variables');
  process.exit(1);
}

// Extract and log non-sensitive parts of connection string
const connectionStringParts = process.env.DB_CONNECTION_STRING.split('@');
if (connectionStringParts.length > 1) {
  const hostAndDb = connectionStringParts[1];
  console.log('MongoDB Host and Database:', hostAndDb);
}

// Connection options for diagnosis - using more generous timeouts for remote connections
// Note: Only using supported options for current MongoDB driver version
const options = {
  serverSelectionTimeoutMS: 30000, // 30 seconds for remote connections
  connectTimeoutMS: 30000,         // 30 seconds
  socketTimeoutMS: 45000,          // 45 seconds
  maxPoolSize: 5,                  // Reasonable pool size
  minPoolSize: 1,
  retryWrites: true,
  retryReads: true,
  heartbeatFrequencyMS: 10000,     // 10 seconds
  // Removed unsupported options
};

console.log('Attempting connection with improved options:', options);

async function diagnoseConnection() {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.DB_CONNECTION_STRING, options);
    
    console.log('✅ Connection successful');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    console.log('Port:', conn.connection.port);
    console.log('Ready state:', conn.connection.readyState);
    
    // Test basic operations
    console.log('Testing basic database operations...');
    
    // Try to list collections
    console.log('Retrieving collection list...');
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('✅ Database collections:', collections.map(c => c.name));
    
    // Try to run a simple command
    console.log('Testing server status...');
    const status = await conn.connection.db.admin().serverStatus();
    console.log('✅ Database server status retrieved');
    
    // Test creating and retrieving a document
    console.log('Testing document operations...');
    const testCollection = conn.connection.db.collection('connection_test');
    
    // Insert a test document
    const testDoc = { 
      test: 'connection', 
      timestamp: new Date(),
      purpose: 'diagnostic test'
    };
    
    const insertResult = await testCollection.insertOne(testDoc);
    console.log('✅ Test document inserted with ID:', insertResult.insertedId);
    
    // Retrieve the test document
    const retrievedDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    if (retrievedDoc) {
      console.log('✅ Test document successfully retrieved');
    } else {
      console.warn('⚠️  Could not retrieve test document');
    }
    
    // Clean up test document
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Test document cleaned up');
    
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    console.log('🎉 All tests passed - database connection is working properly');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);
    
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    
    // Specific error handling
    if (error.name === 'MongoServerSelectionError') {
      console.error('\n🔧 Troubleshooting tips:');
      console.error('1. Check if your MongoDB server is running');
      console.error('2. Verify the connection string is correct');
      console.error('3. Ensure network connectivity to the database server');
      console.error('4. Check firewall settings if connecting to a remote database');
      console.error('5. Verify MongoDB is listening on the correct IP and port');
    } else if (error.name === 'MongoNetworkTimeoutError') {
      console.error('\n🔧 Troubleshooting tips for network timeout:');
      console.error('1. Your network connection to the database may be slow or unstable');
      console.error('2. The database server might be under heavy load');
      console.error('3. Firewall or security groups might be blocking the connection');
      console.error('4. Check if the database server has sufficient resources');
      console.error('5. Consider increasing timeout values in production');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n🔧 Connection refused - troubleshooting tips:');
      console.error('1. MongoDB server is not running on the specified host/port');
      console.error('2. Incorrect host or port in connection string');
      console.error('3. Firewall blocking connections to MongoDB port');
    }
    
    // Try to close connection if it's still open
    if (mongoose.connection.readyState !== 0) {
      try {
        await mongoose.connection.close();
        console.log('Connection closed after error');
      } catch (closeError) {
        console.error('Error closing connection:', closeError.message);
      }
    }
    
    process.exit(1);
  }
}

diagnoseConnection();