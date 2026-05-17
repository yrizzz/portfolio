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

async function debugGlobalHeaders() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    console.log('📋 Fetching global headers...\n');
    
    const GlobalHeader = mongoose.connection.collection('globalheaders');
    const headers = await GlobalHeader.find({}).toArray();
    
    if (headers.length === 0) {
      console.log('❌ No headers found!');
      process.exit(0);
    }
    
    console.log(`Found ${headers.length} header(s)\n`);
    
    headers.forEach((header, index) => {
      console.log(`=== Header ${index + 1} ===`);
      console.log('Raw document:');
      console.log(JSON.stringify(header, null, 2));
      console.log('\n');
      
      console.log('Headers field type:', typeof header.headers);
      console.log('Headers field:', header.headers);
      console.log('\n');
      
      if (header.headers) {
        console.log('Headers keys:', Object.keys(header.headers));
        console.log('Headers values sample:');
        Object.entries(header.headers).slice(0, 3).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      }
      
      console.log('\n' + '='.repeat(60) + '\n');
    });
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
debugGlobalHeaders();
