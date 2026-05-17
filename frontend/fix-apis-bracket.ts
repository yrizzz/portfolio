import { connectDB } from './src/lib/mongodb';
import { ApiEndpoint } from './src/models/ApiEndpoint';
import fs from 'fs';
import path from 'path';

function findFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    if (fs.statSync(file).isDirectory()) {
      results = results.concat(findFiles(file));
    } else if (file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

function extractFunctionString(content) {
  const codeIdx = content.indexOf('code:');
  if (codeIdx === -1) return null;
  
  const startIdx = content.indexOf('{', codeIdx);
  if (startIdx === -1) return null;
  
  let brackets = 1;
  let endIdx = -1;
  for (let i = startIdx + 1; i < content.length; i++) {
    if (content[i] === '{') brackets++;
    if (content[i] === '}') brackets--;
    if (brackets === 0) {
      endIdx = i;
      break;
    }
  }
  
  if (endIdx !== -1) {
    // We want the part starting before the {
    // E.g., 'async (data) => {'
    const prefixStr = content.substring(codeIdx + 5, startIdx).trim();
    return prefixStr + ' ' + content.substring(startIdx, endIdx + 1);
  }
  return null;
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
    
    const pathMatch = content.match(/["']?path["']?\s*:\s*["']([^"']+)["']/);
    if (!pathMatch) continue;
    const apiPath = pathMatch[1];

    let rawCode = extractFunctionString(content);
    if (!rawCode) {
      console.log('Failed to extract', apiPath);
      continue;
    }

    // Now inject our requires
    let fixedCode = `module.exports = ` + rawCode.replace(/^(async\s*\([^)]*\)\s*=>\s*\{|async\s+function\s*\([^)]*\)\s*\{|async\s+\w+\s*=>\s*\{|async\s*\([^)]*\)\s*=>\s*\{)/, `$1\n` +
      `  const axios = require('axios');\n` +
      `  const { Buffer } = require('buffer');\n` +
      `  const FormData = require('form-data');\n` +
      `  const cheerio = require('cheerio');\n` +
      `  const qs = require('qs');\n` +
      `  const sharp = require('sharp');\n` +
      `  const { HttpsProxyAgent } = require('https-proxy-agent');\n` +
      `  const { GoogleGenerativeAI } = require('@google/generative-ai');\n`
    );

    // Make sure we caught it, if not, just append at the start of the block
    if (fixedCode === `module.exports = ` + rawCode) {
       // regex failed, try a generic string replace for the first {
       fixedCode = `module.exports = ` + rawCode.replace('{', `{\n` +
          `  const axios = require('axios');\n` +
          `  const { Buffer } = require('buffer');\n` +
          `  const FormData = require('form-data');\n` +
          `  const cheerio = require('cheerio');\n` +
          `  const qs = require('qs');\n` +
          `  const sharp = require('sharp');\n` +
          `  const { HttpsProxyAgent } = require('https-proxy-agent');\n` +
          `  const { GoogleGenerativeAI } = require('@google/generative-ai');\n`
       );
    }

    const ep = await ApiEndpoint.findOne({ path: apiPath });
    if (ep) {
      ep.code = fixedCode;
      await ep.save();
      console.log('Fixed', apiPath);
      count++;
    }
  }

  console.log(`Successfully fixed ${count} APIs!`);
  process.exit(0);
}
run();
