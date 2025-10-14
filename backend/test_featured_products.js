const { pool } = require('./config/database');

async function testFeaturedProducts() {
  try {
    console.log('Testing featured products query...');
    
    // Test the exact query used in getFeatured method
    const limit = 8;
    const safeLimit = Math.min(Math.max(parseInt(limit) || 8, 1), 50);
    const [rows] = await pool.execute(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_active = TRUE 
      ORDER BY p.created_at DESC 
      LIMIT ${safeLimit}
    `);
    
    console.log('Featured products query executed successfully, rows found:', rows.length);
    console.log('Sample rows:', rows.slice(0, 2));
    
    // Test the product_images query for each product
    if (rows.length > 0) {
      console.log('\nTesting product images query...');
      const [images] = await pool.execute(`
        SELECT image_url FROM product_images 
        WHERE product_id = ? 
        ORDER BY is_primary DESC, id ASC
      `, [rows[0].id]);
      
      console.log('Product images query executed successfully, images found:', images.length);
      console.log('Sample images:', images);
    }
    
  } catch (error) {
    console.error('=== FEATURED PRODUCTS QUERY ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
  }
}

testFeaturedProducts();