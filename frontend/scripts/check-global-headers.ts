import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not found in environment variables');
  }
  
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  
  await mongoose.connect(MONGODB_URI);
}

async function checkGlobalHeaders() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    console.log('📋 Checking global headers collection...\n');
    
    // Check if collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const hasCollection = collections.some(col => col.name === 'globalheaders');
    
    console.log(`Collection 'globalheaders' exists: ${hasCollection ? '✅' : '❌'}\n`);
    
    if (!hasCollection) {
      console.log('⚠️  Collection does not exist. Run seed script first.');
      process.exit(0);
    }
    
    // Get all documents
    const GlobalHeader = mongoose.connection.collection('globalheaders');
    const headers = await GlobalHeader.find({}).toArray();
    
    console.log(`📊 Total documents: ${headers.length}\n`);
    
    if (headers.length === 0) {
      console.log('❌ No global headers found in database!');
      console.log('\n💡 Run this command to seed Instagram headers:');
      console.log('   npx tsx scripts/seed-instagram-headers.ts\n');
    } else {
      console.log('✅ Global headers found:\n');
      headers.forEach((header, index) => {
        console.log(`${index + 1}. ${header.name}`);
        console.log(`   User: ${header.userId}`);
        console.log(`   Service: ${header.service}`);
        console.log(`   Active: ${header.isActive}`);
        console.log(`   Headers count: ${header.headers ? Object.keys(header.headers).length : 0}`);
        console.log(`   Created: ${header.createdAt}`);
        console.log('');
      });
    }
    
    // Check users
    console.log('👥 Checking users...\n');
    const User = mongoose.connection.collection('users');
    const users = await User.find({}).toArray();
    
    console.log(`Total users: ${users.length}`);
    const adminUsers = users.filter((u: any) => u.role === 'ADMIN');
    console.log(`Admin users: ${adminUsers.length}\n`);
    
    if (adminUsers.length > 0) {
      console.log('Admin users:');
      adminUsers.forEach((user: any) => {
        console.log(`  - ${user.email} (${user.name || 'No name'})`);
      });
    }
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
checkGlobalHeaders();
