import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

// Define ApiEndpoint schema inline
const apiEndpointSchema = new mongoose.Schema({
  name: String,
  description: String,
  method: String,
  path: String,
  category: String,
  language: String,
  code: String,
  rawScript: String,
  params: String,
  exampleCode: String,
  requiresAuth: Boolean,
  rateLimit: Number,
  enabled: Boolean,
  status: String,
  order: Number,
  aiAnalysis: String,
  createdAt: Date,
  updatedAt: Date
}, { collection: 'apiendpoints' });

const ApiEndpoint = mongoose.models.ApiEndpoint || mongoose.model('ApiEndpoint', apiEndpointSchema);

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

// Instagram Profile API with full headers from utils/endpoint.js
const instagramProfileCode = `module.exports = async (params) => {
  const axios = require("axios");
  const qs = require("qs");
  
  try {
    const { username } = params;
    
    if (!username) {
      return {
        code: 400,
        status: false,
        message: "Username is required"
      };
    }
    
    // Default headers from utils/endpoint.js
    const defaultHeaders = {
      'Cookie': 'datr=4rFhaTk9AhgfVfHcK3iC2uDr; ig_did=C8738CA8-B84E-460F-A8CC-B6E01497A251; ds_user_id=8280630702; ps_l=1; ps_n=1; csrftoken=FCqhHTlNBWHpj5q72pnDIdcIzgdqSOzM; mid=ac4l0wALAAGCTHqIyUiGu8HxnShF; sessionid=8280630702%3AyHPZq7Yu3cRPIt%3A3%3AAYjvQUoVyGCDKWvqC5m7ZnvuvMH4zrxaluzkmTbwlA; dpr=2; rur="NHA\\\\0548280630702\\\\0541808207146:01feb2d801958722d3aa2c86767ddb7405b050b6f0598eda4fe2b9140fcb1735f986eecf"; wd=1440x2004',
      'X-Asbd-Id': '359341',
      'X-Fb-Friendly-Name': 'PolarisStoriesV3TrayContainerQuery',
      'X-Bloks-Version-Id': '41a4871badc8ef00114860033dd42edcd50935d511345a5a37fbaa878479ad3c',
      'X-Csrftoken': 'FCqhHTlNBWHpj5q72pnDIdcIzgdqSOzM',
      'X-Fb-Lsd': 'D9mibKcyJZihK45YuXAXLd',
      'X-Ig-App-Id': '1217981644879628',
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-root-field-name': 'xdt_api__v1__feed__user_timeline_graphql_connection',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    
    // Get global headers for Instagram if available (will override defaults)
    const globalHeaders = params._globalHeaders?.instagram || {};
    
    // Merge: global headers override defaults
    const headers = { ...defaultHeaders, ...globalHeaders };
    
    // Get user ID
    const searchResponse = await axios.get(\`https://www.instagram.com/web/search/topsearch/?context=user&count=0&query=\${username}\`, {
      headers
    });
    
    if (!searchResponse.data.users || searchResponse.data.users.length === 0) {
      return {
        code: 404,
        status: false,
        message: "User not found"
      };
    }
    
    const userId = searchResponse.data.users[0].user.id;
    
    // Get profile data
    const profileParams = qs.stringify({
      'variables': JSON.stringify({"id": userId, "render_surface": "PROFILE"}),
      'server_timestamps': 'true',
      'doc_id': '28812098038405011'
    });
    
    const profileResponse = await axios.post('https://www.instagram.com/graphql/query', profileParams, {
      headers
    });
    
    return {
      code: 200,
      status: true,
      message: "Success",
      data: profileResponse.data.data.user
    };
    
  } catch (error) {
    return {
      code: 500,
      status: false,
      message: error.message || "Internal server error"
    };
  }
};`;

// Instagram Highlight API with full headers
const instagramHighlightCode = `module.exports = async (params) => {
  const axios = require("axios");
  const qs = require("qs");
  
  try {
    const { username } = params;
    
    if (!username) {
      return {
        code: 400,
        status: false,
        message: "Username is required"
      };
    }
    
    // Default headers from utils/endpoint.js
    const defaultHeaders = {
      'Cookie': 'datr=4rFhaTk9AhgfVfHcK3iC2uDr; ig_did=C8738CA8-B84E-460F-A8CC-B6E01497A251; ds_user_id=8280630702; ps_l=1; ps_n=1; csrftoken=FCqhHTlNBWHpj5q72pnDIdcIzgdqSOzM; mid=ac4l0wALAAGCTHqIyUiGu8HxnShF; sessionid=8280630702%3AyHPZq7Yu3cRPIt%3A3%3AAYjvQUoVyGCDKWvqC5m7ZnvuvMH4zrxaluzkmTbwlA; dpr=2; rur="NHA\\\\0548280630702\\\\0541808207146:01feb2d801958722d3aa2c86767ddb7405b050b6f0598eda4fe2b9140fcb1735f986eecf"; wd=1440x2004',
      'X-Asbd-Id': '359341',
      'X-Fb-Friendly-Name': 'PolarisStoriesV3TrayContainerQuery',
      'X-Bloks-Version-Id': '41a4871badc8ef00114860033dd42edcd50935d511345a5a37fbaa878479ad3c',
      'X-Csrftoken': 'FCqhHTlNBWHpj5q72pnDIdcIzgdqSOzM',
      'X-Fb-Lsd': 'D9mibKcyJZihK45YuXAXLd',
      'X-Ig-App-Id': '1217981644879628',
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-root-field-name': 'xdt_api__v1__feed__user_timeline_graphql_connection',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    
    // Get global headers for Instagram if available (will override defaults)
    const globalHeaders = params._globalHeaders?.instagram || {};
    
    // Merge: global headers override defaults
    const headers = { ...defaultHeaders, ...globalHeaders };
    
    // Get user ID first
    const searchResponse = await axios.get(\`https://www.instagram.com/web/search/topsearch/?context=user&count=0&query=\${username}\`, {
      headers
    });
    
    if (!searchResponse.data.users || searchResponse.data.users.length === 0) {
      return {
        code: 404,
        status: false,
        message: "User not found"
      };
    }
    
    const userId = searchResponse.data.users[0].user.id;
    
    // Get highlights
    const highlightParams = qs.stringify({
      'variables': JSON.stringify({"user_id": userId, "include_chaining": true, "include_reel": true, "include_suggested_users": false, "include_logged_out_extras": false, "include_highlight_reels": true}),
      'doc_id': '7770222023030604'
    });
    
    const highlightResponse = await axios.post('https://www.instagram.com/graphql/query', highlightParams, {
      headers
    });
    
    const highlights = highlightResponse.data.data?.user?.edge_highlight_reels?.edges || [];
    
    return {
      code: 200,
      status: true,
      message: "Success",
      data: {
        username,
        userId,
        highlights: highlights.map((edge: any) => ({
          id: edge.node.id,
          title: edge.node.title,
          cover: edge.node.cover_media?.thumbnail_src
        }))
      }
    };
    
  } catch (error) {
    return {
      code: 500,
      status: false,
      message: error.message || "Internal server error"
    };
  }
};`;

async function updateInstagramApis() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    console.log('📋 Updating Instagram APIs with full headers...\n');
    
    const updates = [
      { 
        name: 'igprofile', 
        code: instagramProfileCode,
        description: 'Instagram Profile with full headers from utils/endpoint.js'
      },
      { 
        name: 'ighighlight', 
        code: instagramHighlightCode,
        description: 'Instagram Highlight with full headers from utils/endpoint.js'
      },
    ];
    
    let updated = 0;
    let notFound = 0;
    
    for (const update of updates) {
      try {
        const result = await ApiEndpoint.updateOne(
          { name: update.name },
          {
            $set: {
              code: update.code,
              rawScript: update.code,
              updatedAt: new Date()
            }
          }
        );
        
        if (result.matchedCount > 0) {
          console.log(`✅ Updated: ${update.name}`);
          console.log(`   ${update.description}\n`);
          updated++;
        } else {
          console.log(`⚠️  Not found: ${update.name}\n`);
          notFound++;
        }
      } catch (error: any) {
        console.error(`❌ Error updating ${update.name}:`, error.message);
      }
    }
    
    console.log('='.repeat(60));
    console.log('📊 Update Summary:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⚠️  Not found: ${notFound}`);
    console.log('='.repeat(60));
    
    console.log('\n💡 What changed:');
    console.log('   1. Added full headers from utils/endpoint.js as defaults');
    console.log('   2. Global headers from database will override defaults');
    console.log('   3. Added proper User-Agent header');
    console.log('   4. ighighlight now fetches actual highlights data');
    
    console.log('\n🧪 Test the APIs:');
    console.log('   - igprofile: GET /api/v1/socialmedia/igprofile?username=instagram');
    console.log('   - ighighlight: GET /api/v1/socialmedia/ighighlight?username=instagram');
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
updateInstagramApis();
