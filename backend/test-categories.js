const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECTION_STRING, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 5,
  retryWrites: true,
  retryReads: true,
  heartbeatFrequencyMS: 10000,
  autoIndex: true,
  autoCreate: true
});

const Category = require('./models/Category');

async function testCategories() {
  try {
    console.log('Testing categories aggregation...');
    
    // Test the same aggregation as in the controller
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          product_count: {
            $size: {
              $filter: {
                input: '$products',
                cond: { $eq: ['$$this.isActive', true] }
              }
            }
          }
        }
      },
      {
        $project: {
          products: 0
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);
    
    console.log('Categories found:', categories.length);
    console.log('Sample category:', JSON.stringify(categories[0], null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    await mongoose.connection.close();
  }
}

testCategories();