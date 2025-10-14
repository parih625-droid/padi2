// test-category-fetch.js
// Script to test fetching categories from MongoDB

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');

console.log('Testing MongoDB connection and category fetching...');
console.log('DB_CONNECTION_STRING:', process.env.DB_CONNECTION_STRING || 'Not set');

// If no connection string is set, use a default local one for testing
const connectionString = process.env.DB_CONNECTION_STRING || 'mongodb://localhost:27017/ecommerce_db';

console.log('Using connection string:', connectionString);

const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose.connect(connectionString, options)
  .then(async () => {
    console.log('✅ Connected successfully to MongoDB');
    console.log('Database name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    
    try {
      // Try to fetch categories
      console.log('Fetching categories...');
      const categories = await Category.find().sort({ name: 1 });
      console.log(`✅ Found ${categories.length} categories`);
      
      if (categories.length > 0) {
        console.log('First 5 categories:');
        categories.slice(0, 5).forEach((category, index) => {
          console.log(`  ${index + 1}. ${category.name}`);
        });
      } else {
        console.log('No categories found in the database');
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error.message);
    } finally {
      mongoose.connection.close();
      process.exit(0);
    }
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check your connection string');
    console.log('3. Verify your database credentials');
    process.exit(1);
  });