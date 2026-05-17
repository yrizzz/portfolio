import { connectDB } from './src/lib/mongodb';
import { ApiEndpoint } from './src/models/ApiEndpoint';
import * as Apis from './utils/api/index.js';

async function run() {
  await connectDB();
  
  const skipList = ['igdl', 'igstory', 'ighighlight', 'igprofile', 'igpost'];
  
  let updatedCount = 0;

  for (const [key, apiDef] of Object.entries(Apis)) {
    if (skipList.includes(key)) {
      console.log(`Skipping ${key}...`);
      continue;
    }
    
    if (!apiDef || !apiDef.name) {
      console.log(`Warning: ${key} is not a valid API definition`);
      continue;
    }

    try {
      const originalCode = apiDef.code.toString();
      
      // We will inject common imports that were present at the top of the files.
      // We check if the original code string starts with async (params) => {
      // Then we inject inside.
      
      let fixedCode = originalCode;
      if (originalCode.startsWith('async (params) => {')) {
        fixedCode = `module.exports = async (params) => {\n` +
          `  const axios = require('axios');\n` +
          `  const { Buffer } = require('buffer');\n` +
          `  const FormData = require('form-data');\n` +
          `  const cheerio = require('cheerio');\n` +
          `  const qs = require('qs');\n` +
          `  const { GoogleGenerativeAI } = require('@google/generative-ai');\n` +
          originalCode.replace(/^async\s*\(params\)\s*=>\s*\{/, '');
      } else if (originalCode.startsWith('async params => {')) {
         // Next.js compiler sometimes strips parentheses
         fixedCode = `module.exports = async (params) => {\n` +
          `  const axios = require('axios');\n` +
          `  const { Buffer } = require('buffer');\n` +
          `  const FormData = require('form-data');\n` +
          `  const cheerio = require('cheerio');\n` +
          `  const qs = require('qs');\n` +
          `  const { GoogleGenerativeAI } = require('@google/generative-ai');\n` +
          originalCode.replace(/^async\s*params\s*=>\s*\{/, '');
      } else {
         // Fallback just wrap it or whatever
         fixedCode = `module.exports = ${originalCode}`;
      }
      
      const dbEndpoint = await ApiEndpoint.findOne({ path: apiDef.path });
      if (dbEndpoint) {
        dbEndpoint.code = fixedCode;
        if (apiDef.params) {
          dbEndpoint.params = typeof apiDef.params === 'string' ? apiDef.params : JSON.stringify(apiDef.params);
        }
        await dbEndpoint.save();
        console.log(`Updated: ${apiDef.name} (${apiDef.path})`);
        updatedCount++;
      } else {
        console.log(`Not found in DB (skipping): ${apiDef.name} (${apiDef.path})`);
      }
    } catch (err) {
      console.error(`Error processing ${key}:`, err.message);
    }
  }
  
  console.log(`\nSuccessfully updated ${updatedCount} API endpoints.`);
  process.exit(0);
}

run();
