import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

// Define GlobalHeader schema
const globalHeaderSchema = new mongoose.Schema({
  userId: String,
  name: String,
  description: String,
  service: String,
  headers: mongoose.Schema.Types.Mixed, // Accept both Map and Object
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}, { collection: 'globalheaders', timestamps: true });

const GlobalHeader = mongoose.models.GlobalHeader || mongoose.model('GlobalHeader', globalHeaderSchema);

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

async function testApiLogic() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    const userEmail = 'arisedyhandoko@gmail.com';
    
    console.log(`📋 Simulating API call for user: ${userEmail}\n`);
    
    // Simulate API logic
    const query: any = { userId: userEmail };
    
    const headers = await GlobalHeader.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Found ${headers.length} header(s)\n`);
    
    // Convert Map to Object for JSON serialization
    const headersWithParsed = headers.map((header: any) => {
      let headersObj = {};
      
      if (header.headers) {
        // Check if it's a Map or already an Object
        if (header.headers instanceof Map) {
          headersObj = Object.fromEntries(header.headers);
        } else if (typeof header.headers === 'object') {
          headersObj = header.headers;
        }
      }
      
      return {
        ...header,
        _id: undefined, // Remove _id
        id: header._id?.toString(),
        headers: headersObj,
      };
    });
    
    console.log('✅ API Response:');
    console.log(JSON.stringify({
      success: true,
      headers: headersWithParsed
    }, null, 2));
    
    console.log('\n📊 Summary:');
    console.log(`   Total headers: ${headersWithParsed.length}`);
    headersWithParsed.forEach((h: any) => {
      console.log(`   - ${h.name} (${h.service}): ${Object.keys(h.headers).length} headers`);
    });
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
testApiLogic();
