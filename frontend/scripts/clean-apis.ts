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

// Keywords untuk identifikasi API yang tidak perlu
const USELESS_KEYWORDS = [
  'example',
  'test',
  'demo',
  'sample',
  'dummy',
  'placeholder',
  'template',
  'todo',
  'coming soon',
  'under construction',
  'not implemented'
];

// Kategori yang tidak perlu
const USELESS_CATEGORIES = [
  'example',
  'test',
  'demo',
  'sample'
];

function isUselessApi(endpoint: any): { useless: boolean; reason: string } {
  const name = endpoint.name?.toLowerCase() || '';
  const desc = endpoint.description?.toLowerCase() || '';
  const category = endpoint.category?.toLowerCase() || '';
  const code = endpoint.code?.toLowerCase() || '';
  const path = endpoint.path?.toLowerCase() || '';
  
  // Check category
  if (USELESS_CATEGORIES.includes(category)) {
    return { useless: true, reason: `Category: ${category}` };
  }
  
  // Check name
  for (const keyword of USELESS_KEYWORDS) {
    if (name.includes(keyword)) {
      return { useless: true, reason: `Name contains: ${keyword}` };
    }
  }
  
  // Check description
  for (const keyword of USELESS_KEYWORDS) {
    if (desc.includes(keyword)) {
      return { useless: true, reason: `Description contains: ${keyword}` };
    }
  }
  
  // Check path
  for (const keyword of USELESS_KEYWORDS) {
    if (path.includes(keyword)) {
      return { useless: true, reason: `Path contains: ${keyword}` };
    }
  }
  
  // Check if code has TODO or placeholder
  if (code.includes('todo:') || code.includes('// todo') || code.includes('implement')) {
    return { useless: true, reason: 'Code contains TODO/placeholder' };
  }
  
  // Check if disabled
  if (endpoint.enabled === false) {
    return { useless: true, reason: 'API is disabled' };
  }
  
  // Check if status is rejected or pending
  if (endpoint.status === 'rejected' || endpoint.status === 'pending') {
    return { useless: true, reason: `Status: ${endpoint.status}` };
  }
  
  return { useless: false, reason: '' };
}

async function cleanApis() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    console.log('📋 Fetching all API endpoints...');
    const endpoints = await ApiEndpoint.find({}).lean();
    
    console.log(`✅ Found ${endpoints.length} API endpoints\n`);
    
    const toDelete: any[] = [];
    const toKeep: any[] = [];
    
    // Analyze each endpoint
    for (const endpoint of endpoints) {
      const check = isUselessApi(endpoint);
      
      if (check.useless) {
        toDelete.push({ endpoint, reason: check.reason });
      } else {
        toKeep.push(endpoint);
      }
    }
    
    console.log('📊 Analysis Results:');
    console.log(`   ✅ Keep: ${toKeep.length} APIs`);
    console.log(`   🗑️  Delete: ${toDelete.length} APIs\n`);
    
    if (toDelete.length > 0) {
      console.log('🗑️  APIs to be deleted:\n');
      toDelete.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.endpoint.name}`);
        console.log(`      Path: ${item.endpoint.path}`);
        console.log(`      Reason: ${item.reason}`);
        console.log(`      Category: ${item.endpoint.category}`);
        console.log(`      Status: ${item.endpoint.status}`);
        console.log('');
      });
      
      // Delete useless APIs
      console.log('🔥 Deleting useless APIs...');
      const idsToDelete = toDelete.map(item => item.endpoint._id);
      const result = await ApiEndpoint.deleteMany({ _id: { $in: idsToDelete } });
      
      console.log(`✅ Deleted ${result.deletedCount} APIs\n`);
    } else {
      console.log('✅ No useless APIs found!\n');
    }
    
    if (toKeep.length > 0) {
      console.log('✅ APIs that will be kept:\n');
      toKeep.forEach((endpoint, index) => {
        console.log(`   ${index + 1}. ${endpoint.name} (${endpoint.path})`);
        console.log(`      Category: ${endpoint.category} | Status: ${endpoint.status}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Final Summary:');
    console.log(`   Total APIs before: ${endpoints.length}`);
    console.log(`   🗑️  Deleted: ${toDelete.length}`);
    console.log(`   ✅ Remaining: ${toKeep.length}`);
    console.log('='.repeat(60));
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
cleanApis();
