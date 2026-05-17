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

// Simulate getAllGlobalHeaders function
async function getAllGlobalHeaders(userId: string): Promise<Record<string, Record<string, string>>> {
  try {
    const GlobalHeader = mongoose.connection.collection('globalheaders');
    
    const headers = await GlobalHeader.find({
      userId,
      isActive: true,
    }).toArray();

    const result: Record<string, Record<string, string>> = {};
    
    for (const header of headers) {
      result[header.service] = header.headers;
    }

    return result;
  } catch (error) {
    console.error('[getAllGlobalHeaders] Error:', error);
    return {};
  }
}

async function simulateSandboxCall() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    // Get admin user
    const User = mongoose.connection.collection('users');
    const adminUser = await User.findOne({ role: 'ADMIN' });
    
    if (!adminUser) {
      console.log('❌ No admin user found');
      process.exit(1);
    }
    
    console.log('✅ Admin user:', adminUser.email);
    console.log('');
    
    // Simulate sandbox logic
    console.log('🧪 Simulating sandbox call...\n');
    
    const testData = { username: 'instagram' };
    const params: Record<string, any> = { ...testData };
    
    console.log('1. Initial params:', params);
    console.log('');
    
    // Inject global headers
    console.log('2. Fetching global headers for:', adminUser.email);
    const globalHeaders = await getAllGlobalHeaders(adminUser.email);
    
    console.log('3. Global headers result:');
    console.log('   Services found:', Object.keys(globalHeaders));
    console.log('   Instagram headers count:', globalHeaders.instagram ? Object.keys(globalHeaders.instagram).length : 0);
    console.log('');
    
    if (Object.keys(globalHeaders).length > 0) {
      params._globalHeaders = globalHeaders;
      console.log('4. ✅ Global headers injected to params');
    } else {
      console.log('4. ❌ No global headers found');
    }
    console.log('');
    
    // Test Instagram API code logic
    console.log('5. Testing Instagram API logic...\n');
    
    const code = `
      const globalHeaders = params._globalHeaders?.instagram;
      
      if (!globalHeaders || Object.keys(globalHeaders).length === 0) {
        return {
          code: 400,
          status: false,
          message: "Instagram headers not configured. Please add Instagram headers in Global Headers settings."
        };
      }
      
      return {
        code: 200,
        status: true,
        message: "Headers found!",
        data: {
          headerCount: Object.keys(globalHeaders).length,
          headerKeys: Object.keys(globalHeaders)
        }
      };
    `;
    
    // Simulate code execution
    const func = new Function('params', code);
    const result = func(params);
    
    console.log('6. API Result:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');
    
    if (result.code === 400) {
      console.log('❌ FAILED: Headers not found in params');
      console.log('');
      console.log('Debug info:');
      console.log('   params._globalHeaders:', params._globalHeaders);
      console.log('   params._globalHeaders?.instagram:', params._globalHeaders?.instagram);
      console.log('   typeof params._globalHeaders:', typeof params._globalHeaders);
      console.log('   Object.keys(params._globalHeaders || {}):', Object.keys(params._globalHeaders || {}));
    } else {
      console.log('✅ SUCCESS: Headers found and working!');
    }
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
simulateSandboxCall();
