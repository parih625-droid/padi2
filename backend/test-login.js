// test-login.js
// Script to test admin login credentials

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

console.log('Testing admin login credentials...');

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

// Test login function
const testLogin = async () => {
  try {
    await connectDB();
    
    // Find the admin user
    console.log('Looking for admin user...');
    const adminUser = await User.findOne({ email: 'admin@padidekhoy.ir' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      await mongoose.connection.close();
      process.exit(1);
    }
    
    console.log(`✅ Admin user found: ${adminUser.name}`);
    
    // Test password
    const testPassword = 'Re1317821Za';
    console.log('Testing password...');
    const isMatch = await bcrypt.compare(testPassword, adminUser.password);
    
    if (isMatch) {
      console.log('✅ Password is correct!');
      console.log('✅ Admin credentials are working properly');
    } else {
      console.log('❌ Password is incorrect');
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing login:', error.message);
    process.exit(1);
  }
};

// Run test
testLogin();