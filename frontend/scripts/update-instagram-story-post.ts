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

// Instagram Story - PURE global headers
const instagramStoryCode = `module.exports = async (params) => {
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
    
    // Get global headers for Instagram (REQUIRED)
    const globalHeaders = params._globalHeaders?.instagram;
    
    if (!globalHeaders || Object.keys(globalHeaders).length === 0) {
      return {
        code: 400,
        status: false,
        message: "Instagram headers not configured. Please add Instagram headers in Global Headers settings."
      };
    }
    
    // Use ONLY global headers
    const headers = globalHeaders;
    
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
    
    // Get stories
    const storyParams = qs.stringify({
      'variables': JSON.stringify({"user_id": userId, "include_chaining": false, "include_reel": true, "include_suggested_users": false, "include_logged_out_extras": false, "include_highlight_reels": false, "include_live_status": true}),
      'doc_id': '7770222023030604'
    });
    
    const storyResponse = await axios.post('https://www.instagram.com/graphql/query', storyParams, {
      headers
    });
    
    const reelMedia = storyResponse.data.data?.user?.reel?.items || [];
    
    return {
      code: 200,
      status: true,
      message: "Success",
      data: {
        username,
        userId,
        stories: reelMedia.map((item: any) => ({
          id: item.id,
          type: item.__typename,
          displayUrl: item.display_url,
          videoUrl: item.video_versions?.[0]?.url,
          takenAt: item.taken_at_timestamp
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

// Instagram Post - PURE global headers
const instagramPostCode = `module.exports = async (params) => {
  const axios = require("axios");
  const qs = require("qs");
  
  try {
    const { url } = params;
    
    if (!url) {
      return {
        code: 400,
        status: false,
        message: "URL is required"
      };
    }
    
    // Get global headers for Instagram (REQUIRED)
    const globalHeaders = params._globalHeaders?.instagram;
    
    if (!globalHeaders || Object.keys(globalHeaders).length === 0) {
      return {
        code: 400,
        status: false,
        message: "Instagram headers not configured. Please add Instagram headers in Global Headers settings."
      };
    }
    
    // Use ONLY global headers
    const headers = globalHeaders;
    
    // Extract shortcode from URL
    let shortcode = '';
    const urlPatterns = [
      /instagram\\.com\\/p\\/([^\\/\\?]+)/,
      /instagram\\.com\\/reel\\/([^\\/\\?]+)/,
      /instagram\\.com\\/tv\\/([^\\/\\?]+)/
    ];
    
    for (const pattern of urlPatterns) {
      const match = url.match(pattern);
      if (match) {
        shortcode = match[1];
        break;
      }
    }
    
    if (!shortcode) {
      return {
        code: 400,
        status: false,
        message: "Invalid Instagram URL"
      };
    }
    
    // Get post data
    const postParams = qs.stringify({
      'variables': JSON.stringify({"shortcode": shortcode}),
      'doc_id': '8845758582119845'
    });
    
    const postResponse = await axios.post('https://www.instagram.com/graphql/query', postParams, {
      headers
    });
    
    const media = postResponse.data.data?.shortcode_media;
    
    if (!media) {
      return {
        code: 404,
        status: false,
        message: "Post not found"
      };
    }
    
    // Extract media URLs
    const result: any = {
      shortcode: media.shortcode,
      type: media.__typename,
      caption: media.edge_media_to_caption?.edges?.[0]?.node?.text,
      likes: media.edge_media_preview_like?.count,
      comments: media.edge_media_to_comment?.count,
      timestamp: media.taken_at_timestamp
    };
    
    // Handle different media types
    if (media.__typename === 'GraphImage') {
      result.displayUrl = media.display_url;
    } else if (media.__typename === 'GraphVideo') {
      result.displayUrl = media.display_url;
      result.videoUrl = media.video_url;
    } else if (media.__typename === 'GraphSidecar') {
      result.items = media.edge_sidecar_to_children?.edges?.map((edge: any) => ({
        type: edge.node.__typename,
        displayUrl: edge.node.display_url,
        videoUrl: edge.node.video_url
      }));
    }
    
    return {
      code: 200,
      status: true,
      message: "Success",
      data: result
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
    
    console.log('📋 Updating Instagram Story & Post APIs to use PURE global headers...\n');
    
    const updates = [
      { 
        name: 'igstory', 
        code: instagramStoryCode,
        description: 'Instagram Story - PURE global headers (no defaults)'
      },
      { 
        name: 'igpost', 
        code: instagramPostCode,
        description: 'Instagram Post - PURE global headers (no defaults)'
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
    console.log('   1. ❌ Removed ALL default headers');
    console.log('   2. ✅ Now uses ONLY global headers from database');
    console.log('   3. ⚠️  Returns error if global headers not configured');
    console.log('   4. 🔒 More secure - headers managed centrally');
    
    console.log('\n📝 All Instagram APIs now using pure global headers:');
    console.log('   ✅ igprofile');
    console.log('   ✅ ighighlight');
    console.log('   ✅ igstory');
    console.log('   ✅ igpost');
    
    console.log('\n⚠️  IMPORTANT:');
    console.log('   Make sure Instagram headers are configured in:');
    console.log('   /admin/global-headers');
    console.log('   Service: instagram');
    console.log('   Status: Active');
    
    console.log('\n🧪 Test the APIs:');
    console.log('   - igstory: GET /api/v1/socialmedia/igstory?username=instagram');
    console.log('   - igpost: GET /api/v1/socialmedia/igpost?url=https://instagram.com/p/...');
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
updateInstagramApis();
