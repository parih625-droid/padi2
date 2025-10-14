// check-categories.js
// Script to check categories in MongoDB

const mongoose = require('mongoose');
const Category = require('./models/Category');

async function checkCategories() {
  try {
    // Connect to MongoDB
    const connectionString = process.env.DB_CONNECTION_STRING || 'mongodb://localhost:27017/ecommerce_db';
    console.log('Connecting to:', connectionString);
    
    await mongoose.connect(connectionString, { 
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 20000,
      connectTimeoutMS: 10000
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Count categories
    const count = await Category.countDocuments();
    console.log('Total categories:', count);
    
    // Get all categories
    const categories = await Category.find().sort({ name: 1 });
    console.log('Categories found:', categories.length);
    
    if (categories.length > 0) {
      console.log('\nCategories:');
      categories.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.name} (${cat._id})`);
      });
    } else {
      console.log('No categories found');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCategories();