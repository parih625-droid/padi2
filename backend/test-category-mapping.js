// test-category-mapping.js
// Script to test category mapping logic

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');

console.log('Testing category mapping logic...');

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

// Test mapping function
const testCategoryMapping = async () => {
  try {
    await connectDB();
    
    // Get all categories from database
    const categoriesData = await Category.find({});
    console.log('All categories from database:');
    categoriesData.forEach(cat => {
      console.log(`- ${cat.name} (${cat.id})`);
    });
    
    // Define the category mapping (same as in frontend)
    const categoryMapping = [
      {
        name: 'لبنیات', // Match with actual category name
        label: 'انواع لبنیات'
      },
      {
        name: 'نوشیدنی‌ها', // Fixed to match exact category name in database
        label: 'نوشیدنی ها'
      },
      {
        name: 'حبوبات', // Match with actual category name
        label: 'حبوبات'
      },
      {
        name: 'شوینده‌ها و لوازم بهداشتی', // Updated to match exact category name in database
        label: 'شوینده‌ها و لوازم بهداشتی'
      }
    ];
    
    console.log('\nTesting category mapping:');
    const mappedCategories = categoryMapping.map((mapping, index) => {
      // Find the matching category by name
      const matchingCategory = categoriesData.find(
        cat => cat.name === mapping.name
      );
      
      console.log(`Mapping ${mapping.name}: ${matchingCategory ? 'FOUND' : 'NOT FOUND'}`);
      if (matchingCategory) {
        console.log(`  ID: ${matchingCategory.id}`);
      }
      
      return {
        id: index + 1,
        label: mapping.label,
        categoryId: matchingCategory ? matchingCategory.id : null,
        categoryName: mapping.name
      };
    });
    
    console.log('\nMapped categories:');
    mappedCategories.forEach(cat => {
      console.log(`- ${cat.categoryName}: ${cat.categoryId ? 'VALID' : 'INVALID'}`);
    });
    
    // Filter out categories without valid IDs
    const validCategories = mappedCategories.filter(cat => cat.categoryId);
    console.log(`\nValid categories count: ${validCategories.length}`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing category mapping:', error.message);
    process.exit(1);
  }
};

// Run test
testCategoryMapping();