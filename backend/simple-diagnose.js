// Simple diagnostic script to check database connection and data
const mongoose = require('mongoose');
require('dotenv').config();

console.log('=== Simple Database Diagnostic ===');
console.log('DB connection string:', process.env.DB_CONNECTION_STRING ? 'Set' : 'Not set');

// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECTION_STRING, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 10000,
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

db.once('open', async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Import models
    const Category = require('./models/Category');
    const Product = require('./models/Product');
    const User = require('./models/User');
    const Order = require('./models/Order');
    const Cart = require('./models/Cart');
    
    // Count documents in each collection
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments();
    const orderCount = await Order.countDocuments();
    const cartCount = await Cart.countDocuments();
    
    console.log('\n📊 Document Counts:');
    console.log('  Categories:', categoryCount);
    console.log('  Products:', productCount);
    console.log('  Users:', userCount);
    console.log('  Orders:', orderCount);
    console.log('  Carts:', cartCount);
    
    // Show sample data if collections are not empty
    if (categoryCount > 0) {
      console.log('\n📂 Sample Categories:');
      const categories = await Category.find().limit(5);
      categories.forEach(cat => {
        console.log(`  - ${cat.name}`);
      });
    }
    
    if (productCount > 0) {
      console.log('\n📦 Sample Products:');
      const products = await Product.find().limit(5);
      products.forEach(prod => {
        console.log(`  - ${prod.name} (${prod.price})`);
      });
    }
    
    if (userCount > 0) {
      console.log('\n👤 Sample Users:');
      const users = await User.find().limit(5);
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email})`);
      });
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Diagnostic completed');
    
  } catch (error) {
    console.error('❌ Error during diagnostic:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
});