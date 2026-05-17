import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

// Define GlobalHeader schema inline
const globalHeaderSchema = new mongoose.Schema({
  userId: String,
  name: String,
  description: String,
  service: String,
  headers: Map,
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

// Instagram headers from utils/endpoint.js
const instagramHeaders = {
  'Cookie': 'datr=4rFhaTk9AhgfVfHcK3iC2uDr; ig_did=C8738CA8-B84E-460F-A8CC-B6E01497A251; ds_user_id=8280630702; ps_l=1; ps_n=1; csrftoken=FCqhHTlNBWHpj5q72pnDIdcIzgdqSOzM; mid=ac4l0wALAAGCTHqIyUiGu8HxnShF; sessionid=8280630702%3AyHPZq7Yu3cRPIt%3A3%3AAYjvQUoVyGCDKWvqC5m7ZnvuvMH4zrxaluzkmTbwlA; dpr=2; rur="NHA\\0548280630702\\0541808207146:01feb2d801958722d3aa2c86767ddb7405b050b6f0598eda4fe2b9140fcb1735f986eecf"; wd=1440x2004',
  'X-Asbd-Id': '359341',
  'X-Fb-Friendly-Name': 'PolarisStoriesV3TrayContainerQuery',
  'X-Bloks-Version-Id': '41a4871badc8ef00114860033dd42edcd50935d511345a5a37fbaa878479ad3c',
  'X-Csrftoken': 'FCqhHTlNBWHpj5q72pnDIdcIzgdqSOzM',
  'X-Fb-Lsd': 'D9mibKcyJZihK45YuXAXLd',
  'X-Ig-App-Id': '1217981644879628',
  'Content-Type': 'application/x-www-form-urlencoded',
  'x-root-field-name': 'xdt_api__v1__feed__user_timeline_graphql_connection'
};

async function seedInstagramHeaders() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    console.log('📋 Checking for admin user...');
    
    // Get admin user
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false, collection: 'users' }));
    const adminUser = await User.findOne({ role: 'ADMIN' }).lean();
    
    if (!adminUser) {
      console.log('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }
    
    console.log(`✅ Found admin user: ${adminUser.email}\n`);
    
    // Check if Instagram headers already exist
    const existing = await GlobalHeader.findOne({
      userId: adminUser.email,
      service: 'instagram'
    });
    
    if (existing) {
      console.log('⚠️  Instagram headers already exist for this user.');
      console.log('   Updating existing headers...\n');
      
      await GlobalHeader.updateOne(
        { _id: existing._id },
        {
          $set: {
            headers: new Map(Object.entries(instagramHeaders)),
            isActive: true,
            updatedAt: new Date()
          }
        }
      );
      
      console.log('✅ Instagram headers updated successfully!');
    } else {
      console.log('📝 Creating new Instagram headers...\n');
      
      await GlobalHeader.create({
        userId: adminUser.email,
        name: 'Instagram Default Headers',
        description: 'Default headers for Instagram API requests',
        service: 'instagram',
        headers: new Map(Object.entries(instagramHeaders)),
        isActive: true
      });
      
      console.log('✅ Instagram headers created successfully!');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   User: ${adminUser.email}`);
    console.log(`   Service: instagram`);
    console.log(`   Headers count: ${Object.keys(instagramHeaders).length}`);
    console.log('='.repeat(60));
    
    console.log('\n💡 Next steps:');
    console.log('   1. Test Instagram APIs - they will now use these headers');
    console.log('   2. Update headers via: PUT /api/global-headers/:id');
    console.log('   3. View headers via: GET /api/global-headers?service=instagram');
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
seedInstagramHeaders();
