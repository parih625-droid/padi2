const Product = require('./models/Product');

async function testControllerFix() {
  try {
    console.log('Testing getFeatured method directly...');
    
    const products = await Product.getFeatured(4);
    console.log('getFeatured executed successfully, products found:', products.length);
    console.log('Sample products:', products.slice(0, 2));
    
  } catch (error) {
    console.error('=== CONTROLLER FIX TEST ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
  }
}

testControllerFix();