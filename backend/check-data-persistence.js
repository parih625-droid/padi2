// check-data-persistence.js
// Script to check if data is being properly saved and retrieved

const mongoose = require('mongoose');
const connectDB = require('./config/mongodb');
require('dotenv').config({ path: __dirname + '/.env' });

async function checkDataPersistence() {
  console.log('=== Data Persistence Check ===');
  console.log('Current time:', new Date().toISOString());
  
  try {
    // Connect to database
    console.log('Connecting to database...');
    await connectDB();
    
    // Check connection status
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ Database not connected');
      process.exit(1);
    }
    
    console.log('✅ Database connected');
    
    // Import models
    const User = require('./models/User');
    const Product = require('./models/Product');
    const Category = require('./models/Category');
    const Order = require('./models/Order');
    
    // Count documents in each collection
    console.log('Counting documents in collections...');
    
    const userCount = await User.countDocuments();
    console.log(`Users: ${userCount}`);
    
    const productCount = await Product.countDocuments();
    console.log(`Products: ${productCount}`);
    
    const categoryCount = await Category.countDocuments();
    console.log(`Categories: ${categoryCount}`);
    
    const orderCount = await Order.countDocuments();
    console.log(`Orders: ${orderCount}`);
    
    // Check if any collections are unexpectedly empty
    if (userCount === 0) {
      console.warn('⚠️  No users found in database');
    }
    
    if (productCount === 0) {
      console.warn('⚠️  No products found in database');
    }
    
    if (categoryCount === 0) {
      console.warn('⚠️  No categories found in database');
    }
    
    // Try to insert a test document
    console.log('Testing document insertion...');
    const testCategory = new Category({
      name: 'Test Category',
      description: 'Temporary category for testing data persistence'
    });
    
    await testCategory.save();
    console.log('✅ Test category created');
    
    // Retrieve the test document
    const retrievedCategory = await Category.findById(testCategory._id);
    if (retrievedCategory) {
      console.log('✅ Test category successfully retrieved');
    } else {
      console.error('❌ Could not retrieve test category');
    }
    
    // Clean up test document
    await Category.findByIdAndDelete(testCategory._id);
    console.log('✅ Test category cleaned up');
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    
    console.log('\n🎉 Data persistence check completed successfully');
    console.log(`Summary: ${userCount} users, ${productCount} products, ${categoryCount} categories, ${orderCount} orders`);
    
  } catch (error) {
    console.error('❌ Data persistence check failed:', error.message);
    console.error('Error stack:', error.stack);
    
    // Try to close connection if it's still open
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
}

checkDataPersistence();