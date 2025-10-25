require('dotenv').config();
const { connectNeonDB } = require('./config/neon');
const User = require('./models/User');

async function createTestUser() {
  try {
    console.log('Connecting to database...');
    await connectNeonDB();
    
    // Initialize user table
    await User.createTable();
    console.log('✅ User table initialized');
    
    // Check if user exists
    const existingUser = await User.findByEmail('rishiatole4545@gmail.com');
    if (existingUser) {
      console.log('✅ User already exists:', existingUser.email);
      console.log('User ID:', existingUser.id);
      return;
    }
    
    // Create user
    const userData = {
      email: 'rishiatole4545@gmail.com',
      password: 'password123', // This will be hashed by the User.create method
      first_name: 'Hrishikesh',
      last_name: 'Atole'
    };
    
    const user = await User.create(userData);
    console.log('✅ Test user created successfully:', user.email);
    console.log('Login with:', userData.email, '/', userData.password);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    process.exit(0);
  }
}

createTestUser();