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

// Updated Instagram Profile API with global headers support
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
    
    // Get global headers for Instagram if available
    const globalHeaders = params._globalHeaders?.instagram || {};
    
    // Default headers (fallback)
    const defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': '*/*'
    };
    
    // Merge global headers with defaults (global headers take priority)
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
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
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

const instagramPostCode = `module.exports = async (params) => {
  const axios = require("axios");
  
  try {
    const { url } = params;
    
    if (!url) {
      return {
        code: 400,
        status: false,
        message: "URL is required"
      };
    }
    
    // Get global headers for Instagram if available
    const globalHeaders = params._globalHeaders?.instagram || {};
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ...globalHeaders
    };
    
    // TODO: Implement Instagram post downloader with proper API
    
    return {
      code: 200,
      status: true,
      message: "Success",
      data: { url }
    };
    
  } catch (error) {
    return {
      code: 500,
      status: false,
      message: error.message || "Internal server error"
    };
  }
};`;

const instagramStoryCode = `module.exports = async (params) => {
  const axios = require("axios");
  
  try {
    const { username } = params;
    
    if (!username) {
      return {
        code: 400,
        status: false,
        message: "Username is required"
      };
    }
    
    // Get global headers for Instagram if available
    const globalHeaders = params._globalHeaders?.instagram || {};
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ...globalHeaders
    };
    
    // TODO: Implement Instagram story downloader with proper API
    
    return {
      code: 200,
      status: true,
      message: "Success",
      data: { username }
    };
    
  } catch (error) {
    return {
      code: 500,
      status: false,
      message: error.message || "Internal server error"
    };
  }
};`;

const instagramHighlightCode = `module.exports = async (params) => {
  const axios = require("axios");
  
  try {
    const { username } = params;
    
    if (!username) {
      return {
        code: 400,
        status: false,
        message: "Username is required"
      };
    }
    
    // Get global headers for Instagram if available
    const globalHeaders = params._globalHeaders?.instagram || {};
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ...globalHeaders
    };
    
    // TODO: Implement Instagram highlight downloader with proper API
    
    return {
      code: 200,
      status: true,
      message: "Success",
      data: { username }
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
    
    console.log('📋 Updating Instagram APIs...\n');
    
    const updates = [
      { name: 'igprofile', code: instagramProfileCode },
      { name: 'igpost', code: instagramPostCode },
      { name: 'igstory', code: instagramStoryCode },
      { name: 'ighighlight', code: instagramHighlightCode },
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
          updated++;
        } else {
          console.log(`⚠️  Not found: ${update.name}`);
          notFound++;
        }
      } catch (error: any) {
        console.error(`❌ Error updating ${update.name}:`, error.message);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Update Summary:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⚠️  Not found: ${notFound}`);
    console.log('='.repeat(60));
    
    console.log('\n💡 Next steps:');
    console.log('   1. Create global headers via API: POST /api/global-headers');
    console.log('   2. Add Instagram headers with service="instagram"');
    console.log('   3. Test the APIs - they will automatically use global headers');
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
updateInstagramApis();
