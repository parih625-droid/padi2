// test-routes.js
// Simple test file to verify route imports

const express = require('express');
const app = express();

// Test importing all route files
try {
  const authRoutes = require('./routes/auth');
  console.log('✅ Auth routes imported successfully');
} catch (error) {
  console.error('❌ Error importing auth routes:', error.message);
}

try {
  const productRoutes = require('./routes/products');
  console.log('✅ Product routes imported successfully');
} catch (error) {
  console.error('❌ Error importing product routes:', error.message);
}

try {
  const categoryRoutes = require('./routes/categories');
  console.log('✅ Category routes imported successfully');
} catch (error) {
  console.error('❌ Error importing category routes:', error.message);
}

try {
  const orderRoutes = require('./routes/orders');
  console.log('✅ Order routes imported successfully');
} catch (error) {
  console.error('❌ Error importing order routes:', error.message);
}

try {
  const cartRoutes = require('./routes/cart');
  console.log('✅ Cart routes imported successfully');
} catch (error) {
  console.error('❌ Error importing cart routes:', error.message);
}

console.log('Route import test completed');