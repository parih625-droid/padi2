const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const Product = require('./models/Product');

// Load environment variables
dotenv.config({ path: __dirname + '/.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Test product creation
const testProductCreation = async () => {
  try {
    // Connect to database
    await connectDB();

    // Get a category
    const category = await Category.findOne();
    if (!category) {
      console.log('❌ No categories found');
      process.exit(1);
    }

    console.log(`Using category: ${category.name} (${category._id})`);

    // Create a test product
    const product = new Product({
      name: 'Test Product',
      description: 'This is a test product',
      price: 29.99,
      category: category._id,
      stockQuantity: 10
    });

    await product.save();
    console.log('✅ Product created successfully');
    console.log('Product ID:', product._id);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating product:', error.message);
    process.exit(1);
  }
};

testProductCreation();