const User = require('./models/User');

async function testUserFind() {
  try {
    console.log('Testing User.findById(1)');
    const user = await User.findById(1);
    console.log('User found:', user);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testUserFind();