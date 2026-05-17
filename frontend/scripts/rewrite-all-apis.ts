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

// Template API yang benar untuk berbagai use case
const API_TEMPLATES = {
  // Template untuk API yang menggunakan axios
  axios_get: `module.exports = async (params) => {
  const axios = require("axios");
  
  try {
    // Validasi parameter
    if (!params.url) {
      return {
        code: 400,
        status: false,
        message: "URL parameter is required"
      };
    }
    
    // Lakukan request
    const response = await axios.get(params.url, {
      headers: params.headers || {},
      timeout: 30000
    });
    
    return {
      code: 200,
      status: true,
      data: response.data
    };
  } catch (error) {
    return {
      code: 500,
      status: false,
      message: error.message || "Request failed"
    };
  }
};`,

  axios_post: `module.exports = async (params) => {
  const axios = require("axios");
  
  try {
    // Validasi parameter
    if (!params.url) {
      return {
        code: 400,
        status: false,
        message: "URL parameter is required"
      };
    }
    
    // Lakukan request
    const response = await axios.post(params.url, params.body || {}, {
      headers: params.headers || {},
      timeout: 30000
    });
    
    return {
      code: 200,
      status: true,
      data: response.data
    };
  } catch (error) {
    return {
      code: 500,
      status: false,
      message: error.message || "Request failed"
    };
  }
};`,

  // Template untuk API sederhana
  simple: `module.exports = async (params) => {
  try {
    // TODO: Implement your logic here
    
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
};`,

  // Template untuk QR Code generator
  qrcode: `module.exports = async (params) => {
  const QRCode = require("qrcode");
  
  try {
    if (!params.text) {
      return {
        code: 400,
        status: false,
        message: "Text parameter is required"
      };
    }
    
    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(params.text, {
      width: params.width || 300,
      margin: params.margin || 2,
      color: {
        dark: params.darkColor || '#000000',
        light: params.lightColor || '#FFFFFF'
      }
    });
    
    return {
      code: 200,
      status: true,
      data: {
        qrcode: qrDataUrl,
        text: params.text
      }
    };
  } catch (error) {
    return {
      code: 500,
      status: false,
      message: error.message || "Failed to generate QR code"
    };
  }
};`,

  // Template untuk web scraping
  cheerio: `module.exports = async (params) => {
  const axios = require("axios");
  const cheerio = require("cheerio");
  
  try {
    if (!params.url) {
      return {
        code: 400,
        status: false,
        message: "URL parameter is required"
      };
    }
    
    // Fetch HTML
    const response = await axios.get(params.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    // Parse HTML
    const $ = cheerio.load(response.data);
    
    // Extract data (customize based on your needs)
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content');
    
    return {
      code: 200,
      status: true,
      data: {
        title,
        description,
        url: params.url
      }
    };
  } catch (error) {
    return {
      code: 500,
      status: false,
      message: error.message || "Failed to scrape website"
    };
  }
};`,

  // Template untuk AI (Gemini)
  gemini: `module.exports = async (params) => {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  
  try {
    if (!params.prompt) {
      return {
        code: 400,
        status: false,
        message: "Prompt parameter is required"
      };
    }
    
    // Initialize Gemini (API key should be in environment)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        code: 500,
        status: false,
        message: "Gemini API key not configured"
      };
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent(params.prompt);
    const response = await result.response;
    const text = response.text();
    
    return {
      code: 200,
      status: true,
      data: {
        response: text,
        prompt: params.prompt
      }
    };
  } catch (error) {
    return {
      code: 500,
      status: false,
      message: error.message || "AI request failed"
    };
  }
};`
};

async function rewriteAllApis() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    console.log('📋 Fetching all API endpoints...');
    const endpoints = await ApiEndpoint.find({}).lean();
    
    console.log(`✅ Found ${endpoints.length} API endpoints`);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\n📝 Processing: ${endpoint.name} (${endpoint.path})`);
        
        // Skip jika sudah tidak ada relative imports
        const hasRelativeImport = 
          endpoint.code?.includes("require('.") ||
          endpoint.code?.includes('require("..') ||
          endpoint.code?.includes("import '.") ||
          endpoint.code?.includes('import "..');
        
        if (!hasRelativeImport && endpoint.code?.includes('module.exports')) {
          console.log('   ⏭️  Skipped - Already in correct format');
          skipped++;
          continue;
        }
        
        // Tentukan template yang sesuai berdasarkan kategori atau nama
        let newCode = API_TEMPLATES.simple;
        
        const name = endpoint.name?.toLowerCase() || '';
        const desc = endpoint.description?.toLowerCase() || '';
        const category = endpoint.category?.toLowerCase() || '';
        
        if (name.includes('qr') || desc.includes('qr code')) {
          newCode = API_TEMPLATES.qrcode;
        } else if (name.includes('scrape') || name.includes('crawl') || desc.includes('scraping')) {
          newCode = API_TEMPLATES.cheerio;
        } else if (name.includes('ai') || name.includes('gemini') || desc.includes('artificial intelligence')) {
          newCode = API_TEMPLATES.gemini;
        } else if (endpoint.method === 'POST') {
          newCode = API_TEMPLATES.axios_post;
        } else if (endpoint.method === 'GET') {
          newCode = API_TEMPLATES.axios_get;
        }
        
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
        
        console.log('   ✅ Updated successfully');
        updated++;
        
      } catch (error: any) {
        console.error(`   ❌ Error: ${error.message}`);
        errors++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log(`   Total: ${endpoints.length}`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log('='.repeat(50));
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
rewriteAllApis();
