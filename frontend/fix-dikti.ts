import { connectDB } from './src/lib/mongodb';
import { ApiEndpoint } from './src/models/ApiEndpoint';
import dikti from './utils/api/random/dikti.js';

async function run() {
  await connectDB();
  
  const originalCode = dikti.code.toString();
  const fixedCode = `module.exports = async (params) => {\n  const axios = require('axios');\n` + originalCode.replace(/^async\s*\(params\)\s*=>\s*\{/, '');
  
  await ApiEndpoint.findOneAndUpdate(
    { name: { $regex: 'dikti', $options: 'i' } },
    { code: fixedCode }
  );
  console.log("Fixed Dikti API Code");
  process.exit(0);
}
run();
