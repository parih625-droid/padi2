// test-mongodb-local.js
// Script to test local MongoDB connection

const mongoose = require('mongoose');

async function testLocalMongoDB() {
  try {
    console.log('Testing local MongoDB connection...');
    
    // Connect to local MongoDB
    const conn = await mongoose.connect('mongodb://localhost:27017/ecommerce_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to local MongoDB successfully');
    console.log('Database name:', conn.connection.name);
    console.log('Host:', conn.connection.host);
    console.log('Port:', conn.connection.port);
    
    // Create a simple test model
    const testSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    
    // Insert a test document
    const testDoc = new TestModel({ name: 'MongoDB Test' });
    await testDoc.save();
    console.log('✅ Test document inserted successfully');
    
    // Retrieve the document
    const retrievedDoc = await TestModel.findOne({ name: 'MongoDB Test' });
    console.log('✅ Test document retrieved successfully:', retrievedDoc.name);
    
    // Clean up
    await TestModel.deleteMany({});
    console.log('✅ Test data cleaned up');
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ MongoDB test failed:');
    console.error('Error message:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Troubleshooting tips:');
      console.error('   - Make sure MongoDB service is running');
      console.error('   - Check if MongoDB is installed correctly');
      console.error('   - Verify MongoDB is listening on port 27017');
    }
  }
}

testLocalMongoDB();