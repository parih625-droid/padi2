// Script to check if the database on VPS is empty
const mongoose = require('mongoose');
require('dotenv').config();

// Use the same connection string as the backend
const connectionString = process.env.DB_CONNECTION_STRING;

console.log('Checking database content...');
console.log('Connection string:', connectionString ? 'Set' : 'Not set');

if (!connectionString) {
  console.error('❌ DB_CONNECTION_STRING environment variable is not set');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(connectionString, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 10000,
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

db.once('open', async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Get list of collections
    const collections = await db.db.listCollections().toArray();
    console.log('\n📋 Collections in database:');
    
    if (collections.length === 0) {
      console.log('  (No collections found - database is empty)');
    } else {
      for (const collection of collections) {
        // Get document count for each collection
        const count = await db.db.collection(collection.name).countDocuments();
        console.log(`  ${collection.name}: ${count} documents`);
      }
    }
    
    // Check specific collections that should exist in this e-commerce app
    const expectedCollections = ['users', 'products', 'categories', 'orders', 'carts'];
    
    console.log('\n🔍 Checking expected collections:');
    for (const collectionName of expectedCollections) {
      try {
        const count = await db.db.collection(collectionName).countDocuments();
        console.log(`  ${collectionName}: ${count} documents`);
      } catch (error) {
        console.log(`  ${collectionName}: Collection does not exist`);
      }
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
});