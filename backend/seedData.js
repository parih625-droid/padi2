const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');

// Load environment variables
dotenv.config({ path: __dirname + '/.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Sample data
const categories = [
  {
    name: 'Electronics',
    description: 'Electronic devices and gadgets'
  },
  {
    name: 'Clothing',
    description: 'Men and women clothing'
  },
  {
    name: 'Books',
    description: 'Books and educational materials'
  },
  {
    name: 'Home & Garden',
    description: 'Home improvement and garden supplies'
  },
  {
    name: 'Sports',
    description: 'Sports and fitness equipment'
  }
];

const products = [
  {
    name: 'Smartphone',
    description: 'Latest model smartphone with advanced features',
    price: 699.99,
    images: ['/uploads/smartphone.jpg'],
    stockQuantity: 50,
    isAmazingOffer: false,
    salesCount: 10
  },
  {
    name: 'Laptop',
    description: 'High-performance laptop for work and gaming',
    price: 1299.99,
    images: ['/uploads/laptop.jpg'],
    stockQuantity: 30,
    isAmazingOffer: true,
    salesCount: 5
  },
  {
    name: 'T-Shirt',
    description: 'Comfortable cotton t-shirt',
    price: 19.99,
    images: ['/uploads/tshirt.jpg'],
    stockQuantity: 100,
    isAmazingOffer: false,
    salesCount: 25
  },
  {
    name: 'Jeans',
    description: 'Classic blue jeans',
    price: 49.99,
    images: ['/uploads/jeans.jpg'],
    stockQuantity: 75,
    isAmazingOffer: false,
    salesCount: 15
  },
  {
    name: 'Programming Book',
    description: 'Learn web development with this comprehensive guide',
    price: 39.99,
    images: ['/uploads/book.jpg'],
    stockQuantity: 25,
    isAmazingOffer: false,
    salesCount: 8
  },
  {
    name: 'Garden Tools Set',
    description: 'Complete set of garden tools',
    price: 89.99,
    images: ['/uploads/garden-tools.jpg'],
    stockQuantity: 40,
    isAmazingOffer: true,
    salesCount: 3
  },
  {
    name: 'Running Shoes',
    description: 'Professional running shoes for athletes',
    price: 129.99,
    images: ['/uploads/running-shoes.jpg'],
    stockQuantity: 60,
    isAmazingOffer: false,
    salesCount: 12
  }
];

const users = [
  {
    name: 'Admin User',
    email: 'admin@padidekhoy.ir',
    password: 'Re1317821Za',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'customer'
  }
];

// Seed function - SAFE VERSION (doesn't clear existing data)
const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if data already exists
    const existingCategories = await Category.countDocuments();
    const existingProducts = await Product.countDocuments();
    const existingUsers = await User.countDocuments();
    
    if (existingCategories > 0 || existingProducts > 0 || existingUsers > 0) {
      console.log('⚠️ Database already contains data. Skipping seeding to prevent data loss.');
      console.log(`   Categories: ${existingCategories}`);
      console.log(`   Products: ${existingProducts}`);
      console.log(`   Users: ${existingUsers}`);
      console.log('💡 To re-seed the database, run: npm run seed -- --force');
      process.exit(0);
    }

    console.log('✅ Database is empty. Proceeding with seeding...');

    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ ${createdCategories.length} categories inserted`);

    // Insert products
    const productsWithCategory = products.map((product, index) => {
      // Assign categories in a round-robin fashion
      const categoryIndex = index % createdCategories.length;
      return {
        ...product,
        category: createdCategories[categoryIndex]._id
      };
    });
    
    const createdProducts = await Product.insertMany(productsWithCategory);
    console.log(`✅ ${createdProducts.length} products inserted`);

    // Insert users with hashed passwords
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );
    
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`✅ ${createdUsers.length} users inserted`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n👤 Admin login: admin@padidekhoy.ir / Re1317821Za');
    console.log('👤 Customer login: john@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

// Force seed function - clears existing data and inserts fresh data
const forceSeedData = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('⚠️ FORCE SEEDING - Clearing all existing data...');
    
    // Clear existing data
    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    
    console.log('✅ Existing data cleared');

    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ ${createdCategories.length} categories inserted`);

    // Insert products
    const productsWithCategory = products.map((product, index) => {
      // Assign categories in a round-robin fashion
      const categoryIndex = index % createdCategories.length;
      return {
        ...product,
        category: createdCategories[categoryIndex]._id
      };
    });
    
    const createdProducts = await Product.insertMany(productsWithCategory);
    console.log(`✅ ${createdProducts.length} products inserted`);

    // Insert users with hashed passwords
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );
    
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`✅ ${createdUsers.length} users inserted`);

    console.log('\n🎉 Database force seeding completed successfully!');
    console.log('\n👤 Admin login: admin@padidekhoy.ir / Re1317821Za');
    console.log('👤 Customer login: john@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error force seeding database:', error.message);
    process.exit(1);
  }
};

// Check if force flag is passed
const forceFlagIndex = process.argv.indexOf('--force');
if (forceFlagIndex !== -1) {
  forceSeedData();
} else {
  seedData();
}