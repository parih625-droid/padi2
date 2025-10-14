const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection configuration
// Use Render environment variables with fallbacks to .env values
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
  connectTimeout: 30000, // 30 seconds
  acquireTimeout: 30000, // 30 seconds
  timeout: 30000 // 30 seconds
};

console.log('Database configuration:');
console.log('- Host:', dbConfig.host);
console.log('- Port:', dbConfig.port);
console.log('- Database:', dbConfig.database);
console.log('- User:', dbConfig.user ? 'Set' : 'Not set');

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Create initial connection pool without database specified (for creating database)
const initialPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000, // 30 seconds
  acquireTimeout: 30000, // 30 seconds
  timeout: 30000 // 30 seconds
});

// Test database connection
const testConnection = async () => {
  try {
    console.log('Attempting to connect to database...');
    
    // First, connect without database to create it if needed
    const initialConnection = await initialPool.getConnection();
    console.log('✅ Initial connection established');
    
    // Create database if it doesn't exist (use query instead of execute)
    await initialConnection.query(`CREATE DATABASE IF NOT EXISTS ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`, [dbConfig.database]);
    console.log(`✅ Database '${dbConfig.database}' ready`);
    initialConnection.release();
    
    // Now test connection to the specific database
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error syscall:', error.syscall);
    throw error;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();

    // Use the database (use query instead of execute for USE command)
    await connection.query(`USE ??`, [dbConfig.database]);

    // Create Categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(191) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('customer', 'admin') DEFAULT 'customer',
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create Products table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url VARCHAR(300),
        category_id INT,
        stock_quantity INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        sales_count INT DEFAULT 0,
        is_amazing_offer BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create Product Images table for multiple images
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        image_url VARCHAR(300) NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create Cart table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cart (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create Orders table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        shipping_address TEXT NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create Order Items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Add sales_count column if it doesn't exist
    try {
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN sales_count INT DEFAULT 0
      `);
      console.log('✅ Added sales_count column to products table');
    } catch (error) {
      // Column might already exist, which is fine
      if (!error.message.includes('Duplicate column name')) {
        console.error('Error adding sales_count column:', error.message);
      } else {
        console.log('✅ sales_count column already exists');
      }
    }

    console.log('✅ Database tables initialized successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

// Insert sample data
const insertSampleData = async () => {
  try {
    const connection = await pool.getConnection();

    // Check if data already exists
    const [categories] = await connection.execute('SELECT COUNT(*) as count FROM categories');
    if (categories[0].count > 0) {
      console.log('✅ Sample data already exists');
      connection.release();
      return;
    }

    // Insert sample categories
    await connection.execute(`
      INSERT INTO categories (name, description) VALUES 
      ('Electronics', 'Electronic devices and gadgets'),
      ('Clothing', 'Men and women clothing'),
      ('Books', 'Books and educational materials'),
      ('Home & Garden', 'Home improvement and garden supplies'),
      ('Sports', 'Sports and fitness equipment')
    `);

    // Insert sample products
    await connection.execute(`
      INSERT INTO products (name, description, price, image_url, category_id, stock_quantity) VALUES 
      ('Smartphone', 'Latest model smartphone with advanced features', 699.99, '/uploads/smartphone.jpg', 1, 50),
      ('Laptop', 'High-performance laptop for work and gaming', 1299.99, '/uploads/laptop.jpg', 1, 30),
      ('T-Shirt', 'Comfortable cotton t-shirt', 19.99, '/uploads/tshirt.jpg', 2, 100),
      ('Jeans', 'Classic blue jeans', 49.99, '/uploads/jeans.jpg', 2, 75),
      ('Programming Book', 'Learn web development', 39.99, '/uploads/book.jpg', 3, 25),
      ('Garden Tools Set', 'Complete set of garden tools', 89.99, '/uploads/garden-tools.jpg', 4, 40),
      ('Running Shoes', 'Professional running shoes', 129.99, '/uploads/running-shoes.jpg', 5, 60)
    `);

    // Insert admin user (password: admin123)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await connection.execute(`
      INSERT INTO users (name, email, password, role) VALUES 
      ('Admin User', 'admin@ecommerce.com', ?, 'admin')
    `, [hashedPassword]);

    console.log('✅ Sample data inserted successfully');
    console.log('👤 Admin login: admin@ecommerce.com / admin123');
    connection.release();
  } catch (error) {
    console.error('❌ Sample data insertion failed:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
  insertSampleData
};