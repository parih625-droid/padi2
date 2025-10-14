// test-env.js
// Script to test environment variables on Render

console.log('Testing Environment Variables...');
console.log('==============================');

console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('PORT:', process.env.PORT || 'Not set');
console.log('DB_CONNECTION_STRING:', process.env.DB_CONNECTION_STRING ? 'Set (length: ' + process.env.DB_CONNECTION_STRING.length + ')' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set (length: ' + process.env.JWT_SECRET.length + ')' : 'Not set');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');

if (!process.env.DB_CONNECTION_STRING) {
  console.log('\n❌ CRITICAL: DB_CONNECTION_STRING is not set!');
  console.log('Please set this in your Render environment variables.');
  console.log('Example: mongodb+srv://username:password@cluster.mongodb.net/database_name');
}

if (!process.env.JWT_SECRET) {
  console.log('\n❌ CRITICAL: JWT_SECRET is not set!');
  console.log('Please set this in your Render environment variables.');
  console.log('Example: a_random_string_at_least_32_characters_long');
}

console.log('\n✅ Environment variable check completed.');