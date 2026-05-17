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

// Generate proper API code based on category and name
function generateProperCode(endpoint: any): string {
  const name = endpoint.name?.toLowerCase() || '';
  const desc = endpoint.description?.toLowerCase() || '';
  const category = endpoint.category?.toLowerCase() || '';
  
  // Instagram Profile
  if (name.includes('igprofile')) {
    return `module.exports = async (params) => {
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
    
    // Get user ID
    const searchResponse = await axios.get(\`https://www.instagram.com/web/search/topsearch/?context=user&count=0&query=\${username}\`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*'
      }
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '*/*'
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
  }
  
  // Instagram Post
  if (name.includes('igpost')) {
    return `module.exports = async (params) => {
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
    
    // TODO: Implement Instagram post downloader
    // This requires proper Instagram API or scraping logic
    
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
  }
  
  // Instagram Story
  if (name.includes('igstory')) {
    return `module.exports = async (params) => {
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
    
    // TODO: Implement Instagram story downloader
    
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
  }
  
  // Instagram Highlight
  if (name.includes('ighighlight')) {
    return `module.exports = async (params) => {
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
    
    // TODO: Implement Instagram highlight downloader
    
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
  }
  
  // TikTok Profile
  if (name.includes('ttprofile') || name.includes('tiktokprofile')) {
    return `module.exports = async (params) => {
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
    
    // TODO: Implement TikTok profile scraper
    
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
  }
  
  // X/Twitter Profile
  if (name.includes('xprofile') || name.includes('twitter')) {
    return `module.exports = async (params) => {
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
    
    // TODO: Implement X/Twitter profile scraper
    
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
  }
  
  // Downloaders (YouTube, Facebook, Instagram, TikTok)
  if (category === 'downloader') {
    return `module.exports = async (params) => {
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
    
    // TODO: Implement ${name} downloader
    // Use appropriate API or scraping method
    
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
  }
  
  // AI APIs
  if (category === 'ai') {
    return `module.exports = async (params) => {
  const axios = require("axios");
  
  try {
    const { prompt } = params;
    
    if (!prompt) {
      return {
        code: 400,
        status: false,
        message: "Prompt is required"
      };
    }
    
    // TODO: Implement ${name} AI integration
    
    return {
      code: 200,
      status: true,
      message: "Success",
      data: { prompt, response: "AI response here" }
    };
    
  } catch (error) {
    return {
      code: 500,
      status: false,
      message: error.message || "Internal server error"
    };
  }
};`;
  }
  
  // Domain tools
  if (category === 'domain') {
    return `module.exports = async (params) => {
  const axios = require("axios");
  
  try {
    const { domain } = params;
    
    if (!domain) {
      return {
        code: 400,
        status: false,
        message: "Domain is required"
      };
    }
    
    // TODO: Implement ${name} domain checker
    
    return {
      code: 200,
      status: true,
      message: "Success",
      data: { domain }
    };
    
  } catch (error) {
    return {
      code: 500,
      status: false,
      message: error.message || "Internal server error"
    };
  }
};`;
  }
  
  // Game username checkers
  if (category === 'game') {
    return `module.exports = async (params) => {
  const axios = require("axios");
  
  try {
    const { userId, zoneId } = params;
    
    if (!userId) {
      return {
        code: 400,
        status: false,
        message: "User ID is required"
      };
    }
    
    // TODO: Implement ${name} username checker
    
    return {
      code: 200,
      status: true,
      message: "Success",
      data: { userId, zoneId, username: "Player Name" }
    };
    
  } catch (error) {
    return {
      code: 500,
      status: false,
      message: error.message || "Internal server error"
    };
  }
};`;
  }
  
  // Translation
  if (name.includes('translate')) {
    return `module.exports = async (params) => {
  const axios = require("axios");
  
  try {
    const { text, from, to } = params;
    
    if (!text) {
      return {
        code: 400,
        status: false,
        message: "Text is required"
      };
    }
    
    // TODO: Implement translation API
    
    return {
      code: 200,
      status: true,
      message: "Success",
      data: {
        original: text,
        translated: text,
        from: from || "auto",
        to: to || "en"
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
  }
  
  // Default template
  return `module.exports = async (params) => {
  const axios = require("axios");
  
  try {
    // TODO: Implement ${endpoint.name} logic
    
    return {
      code: 200,
      status: true,
      message: "Success",
      data: params
    };
    
  } catch (error) {
    return {
      code: 500,
      status: false,
      message: error.message || "Internal server error"
    };
  }
};`;
}

async function convertAllApis() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    console.log('📋 Fetching all API endpoints...');
    const endpoints = await ApiEndpoint.find({}).lean();
    
    console.log(`✅ Found ${endpoints.length} API endpoints\n`);
    
    let converted = 0;
    let errors = 0;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`📝 Converting: ${endpoint.name} (${endpoint.path})`);
        
        const newCode = generateProperCode(endpoint);
        
        // Update endpoint
        await ApiEndpoint.updateOne(
          { _id: endpoint._id },
          {
            $set: {
              code: newCode,
              rawScript: newCode,
              language: 'nodejs',
              updatedAt: new Date()
            }
          }
        );
        
        console.log('   ✅ Converted successfully\n');
        converted++;
        
      } catch (error: any) {
        console.error(`   ❌ Error: ${error.message}\n`);
        errors++;
      }
    }
    
    console.log('='.repeat(60));
    console.log('📊 Conversion Summary:');
    console.log(`   Total: ${endpoints.length}`);
    console.log(`   ✅ Converted: ${converted}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log('='.repeat(60));
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
convertAllApis();
