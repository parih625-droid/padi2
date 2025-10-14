// export-data.js
// Script to export data from MongoDB Atlas to JSON files

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// Import models
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');

console.log('Exporting data from MongoDB Atlas...');

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

// Export data function
const exportData = async () => {
  try {
    await connectDB();
    
    // Create export directory
    const exportDir = path.join(__dirname, 'exported_data');
    await fs.mkdir(exportDir, { recursive: true });
    
    // Export categories
    console.log('Exporting categories...');
    const categories = await Category.find({});
    await fs.writeFile(
      path.join(exportDir, 'categories.json'),
      JSON.stringify(categories, null, 2)
    );
    console.log(`✅ Exported ${categories.length} categories`);
    
    // Export products
    console.log('Exporting products...');
    const products = await Product.find({}).populate('category');
    await fs.writeFile(
      path.join(exportDir, 'products.json'),
      JSON.stringify(products, null, 2)
    );
    console.log(`✅ Exported ${products.length} products`);
    
    // Export users (without passwords for security)
    console.log('Exporting users...');
    const users = await User.find({}, { password: 0 }); // Exclude passwords
    await fs.writeFile(
      path.join(exportDir, 'users.json'),
      JSON.stringify(users, null, 2)
    );
    console.log(`✅ Exported ${users.length} users`);
    
    console.log('\n🎉 Data export completed successfully!');
    console.log(`📁 Exported data is located in: ${exportDir}`);
    console.log('\n👤 Admin login: admin@padidekhoy.ir / Re1317821Za');
    console.log('👤 Customer login: john@example.com / password123');
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error exporting data:', error.message);
    process.exit(1);
  }
};

// Run export
exportData();