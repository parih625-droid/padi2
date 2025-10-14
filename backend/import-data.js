// import-data.js
// Script to import data from JSON files to MongoDB Atlas

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

// Import models
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');

console.log('Importing data to MongoDB Atlas...');

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log(`✅ Connected to MongoDB Atlas: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Import data function
const importData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    console.log('Clearing existing data...');
    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    console.log('✅ Existing data cleared');
    
    // Import categories
    console.log('Importing categories...');
    const categoriesData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'exported_data', 'categories.json'), 'utf8')
    );
    
    // Remove _id fields to avoid conflicts
    const categoriesWithoutIds = categoriesData.map(category => {
      const { _id, ...categoryData } = category;
      return categoryData;
    });
    
    const createdCategories = await Category.insertMany(categoriesWithoutIds);
    console.log(`✅ Imported ${createdCategories.length} categories`);
    
    // Create a map of old category IDs to new category IDs
    const categoryMap = {};
    categoriesData.forEach((oldCategory, index) => {
      categoryMap[oldCategory._id] = createdCategories[index]._id;
    });
    
    // Import products
    console.log('Importing products...');
    const productsData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'exported_data', 'products.json'), 'utf8')
    );
    
    // Update category references and remove _id fields
    const productsWithUpdatedCategories = productsData.map(product => {
      const { _id, category, ...productData } = product;
      // Update category reference
      if (category && category._id && categoryMap[category._id]) {
        return {
          ...productData,
          category: categoryMap[category._id]
        };
      }
      return productData;
    });
    
    const createdProducts = await Product.insertMany(productsWithUpdatedCategories);
    console.log(`✅ Imported ${createdProducts.length} products`);
    
    // Import users
    console.log('Importing users...');
    const usersData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'exported_data', 'users.json'), 'utf8')
    );
    
    // Process users - note that exported users don't have passwords for security
    // We'll need to create new passwords for them
    const processedUsers = usersData.map(user => {
      const { _id, ...userData } = user;
      // Check if this is the admin user
      if (userData.email === 'admin@ecommerce.com') {
        // Update admin email and set new password
        return {
          ...userData,
          email: 'admin@padidekhoy.ir',
          password: 'Re1317821Za' // This will be hashed below
        };
      } else {
        // For security, we don't import passwords from exported data
        // You'll need to reset passwords for these users
        return {
          ...userData,
          password: 'defaultPassword123' // This will be hashed below
        };
      }
    });
    
    // Hash passwords
    const usersWithHashedPasswords = await Promise.all(
      processedUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );
    
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`✅ Imported ${createdUsers.length} users`);
    console.log('⚠️  Note: User passwords have been reset. Admin password is "Re1317821Za"');
    console.log('⚠️  Other user passwords have been reset to "defaultPassword123" for security');
    console.log('⚠️  Please advise users to change their passwords after first login');
    
    console.log('\n🎉 Data import completed successfully!');
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing data:', error.message);
    process.exit(1);
  }
};

// Run import
importData();