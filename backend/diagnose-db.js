// Diagnostic script to check database connection and data persistence issues
const mongoose = require('mongoose');
require('dotenv').config();

console.log('=== Database Diagnostic Tool ===');
console.log('Node environment:', process.env.NODE_ENV || 'Not set');
console.log('DB connection string:', process.env.DB_CONNECTION_STRING ? 'Set' : 'Not set');

if (!process.env.DB_CONNECTION_STRING) {
  console.error('❌ DB_CONNECTION_STRING is not set in environment variables');
  process.exit(1);
}

// Extract database name from connection string
const dbUrl = new URL(process.env.DB_CONNECTION_STRING);
const dbName = dbUrl.pathname.substring(1);
console.log('Database name:', dbName);
console.log('Database host:', dbUrl.hostname);
console.log('Database port:', dbUrl.port || '27017');

// Connect to MongoDB with detailed options
mongoose.connect(process.env.DB_CONNECTION_STRING, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  minPoolSize: 1,
  retryWrites: true,
  retryReads: true
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

db.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
});

db.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

db.once('open', async () => {
  console.log('📁 Database connection opened');
  
  try {
    // Get database statistics
    const dbStats = await db.db.stats();
    console.log('\n📊 Database Statistics:');
    console.log('  Database:', dbStats.db);
    console.log('  Collections:', dbStats.collections);
    console.log('  Objects:', dbStats.objects);
    console.log('  Data Size:', dbStats.dataSize, 'bytes');
    console.log('  Storage Size:', dbStats.storageSize, 'bytes');
    
    // List all collections
    const collections = await db.db.listCollections().toArray();
    console.log('\n📋 Collections:');
    
    if (collections.length === 0) {
      console.log('  No collections found');
    } else {
      for (const collection of collections) {
        const stats = await db.db.collection(collection.name).stats();
        const count = await db.db.collection(collection.name).countDocuments();
        console.log(`  ${collection.name}:`);
        console.log(`    Documents: ${count}`);
        console.log(`    Size: ${stats.size} bytes`);
        console.log(`    Storage: ${stats.storageSize} bytes`);
        
        // Show sample documents if collection is not empty
        if (count > 0) {
          console.log(`    Sample documents:`);
          const samples = await db.db.collection(collection.name).find().limit(3).toArray();
          samples.forEach((doc, index) => {
            console.log(`      ${index + 1}. ${doc._id} - ${doc.name || doc.email || 'No name field'}`);
          });
        }
      }
    }
    
    // Check if this is the expected database
    console.log('\n🔍 Verifying database:');
    if (dbName !== 'ecommerce_db') {
      console.warn('  ⚠️  Database name is not "ecommerce_db" - this might be a different database instance');
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database diagnostic completed');
    
  } catch (error) {
    console.error('❌ Error during database diagnostic:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
});