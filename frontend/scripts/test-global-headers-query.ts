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

async function testGlobalHeadersQuery() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    console.log('📋 Testing global headers query...\n');
    
    // Get admin user
    const User = mongoose.connection.collection('users');
    const adminUser = await User.findOne({ role: 'ADMIN' });
    
    if (!adminUser) {
      console.log('❌ No admin user found');
      process.exit(1);
    }
    
    console.log('✅ Admin user found:');
    console.log('   Email:', adminUser.email);
    console.log('   Name:', adminUser.name);
    console.log('');
    
    // Query global headers
    const GlobalHeader = mongoose.connection.collection('globalheaders');
    
    console.log('🔍 Querying global headers with userId:', adminUser.email);
    const headers = await GlobalHeader.find({ userId: adminUser.email }).toArray();
    
    console.log(`📊 Found ${headers.length} header(s)\n`);
    
    if (headers.length > 0) {
      headers.forEach((header, index) => {
        console.log(`${index + 1}. ${header.name}`);
        console.log(`   Service: ${header.service}`);
        console.log(`   Active: ${header.isActive}`);
        console.log(`   Headers count: ${Object.keys(header.headers || {}).length}`);
        console.log('');
      });
      
      // Test getAllGlobalHeaders logic
      console.log('🧪 Testing getAllGlobalHeaders logic...\n');
      
      const result: Record<string, Record<string, string>> = {};
      
      for (const header of headers) {
        if (header.isActive) {
          result[header.service] = header.headers;
        }
      }
      
      console.log('Result object:');
      console.log(JSON.stringify(result, null, 2));
      
      console.log('\n✅ Global headers would be injected as:');
      console.log('params._globalHeaders =', JSON.stringify(Object.keys(result)));
      
    } else {
      console.log('❌ No global headers found!');
      console.log('\n💡 Possible issues:');
      console.log('   1. userId in globalheaders does not match user email');
      console.log('   2. Headers not created yet');
      console.log('   3. Wrong collection name');
    }
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
testGlobalHeadersQuery();
