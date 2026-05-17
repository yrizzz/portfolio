import { connectDB } from './src/lib/mongodb';
import { ApiEndpoint } from './src/models/ApiEndpoint';
import fs from 'fs';
import path from 'path';

function findFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(file));
    } else if (file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

async function run() {
  await connectDB();
  const files = findFiles('./utils/api');
  let count = 0;

  for (const file of files) {
    if (file.includes('index.js') || file.includes('handler.js') || file.includes('instagram.js') || file.includes('igstory.js') || file.includes('ighighlight.js') || file.includes('igprofile.js') || file.includes('igpost.js')) {
      continue;
    }

    const content = fs.readFileSync(file, 'utf-8');
    
    // Find "path": "/v1/tool/imageBg"
    const pathMatch = content.match(/["']?path["']?\s*:\s*["']([^"']+)["']/);
    if (!pathMatch) {
      console.log('No path found in', file);
      continue;
    }
    const apiPath = pathMatch[1];

    // Find "code: async (data) => {" or "code: async (params) => {"
    const codeMatch = content.match(/code\s*:\s*(async\s*\([^)]*\)\s*=>\s*\{[\s\S]*\}\s*),?\s*$/);
    let rawCode = '';
    
    if (codeMatch) {
      rawCode = codeMatch[1];
    } else {
      // maybe it ends with just '}' without a comma
      const codeMatch2 = content.match(/code\s*:\s*(async\s*\([^)]*\)\s*=>\s*\{[\s\S]*\})\s*\}\s*$/);
      if (codeMatch2) {
        rawCode = codeMatch2[1];
      } else {
        console.log('Could not extract code for', file);
        continue;
      }
    }

    // Now inject our requires
    let fixedCode = `module.exports = ` + rawCode.replace(/^async\s*\(([^)]*)\)\s*=>\s*\{/, `async ($1) => {\n` +
      `  const axios = require('axios');\n` +
      `  const { Buffer } = require('buffer');\n` +
      `  const FormData = require('form-data');\n` +
      `  const cheerio = require('cheerio');\n` +
      `  const qs = require('qs');\n` +
      `  const sharp = require('sharp');\n` +
      `  const { HttpsProxyAgent } = require('https-proxy-agent');\n` +
      `  const { GoogleGenerativeAI } = require('@google/generative-ai');\n`
    );

    const ep = await ApiEndpoint.findOne({ path: apiPath });
    if (ep) {
      ep.code = fixedCode;
      await ep.save();
      console.log('Fixed from raw:', apiPath);
      count++;
    }
  }

  console.log(`Fixed ${count} APIs using raw source!`);
  process.exit(0);
}
run();
