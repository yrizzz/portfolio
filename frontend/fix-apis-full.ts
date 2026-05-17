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

    let fullCode = `
const axios = require('axios');
const { Buffer } = require('buffer');
const FormData = require('form-data');
const cheerio = require('cheerio');
const qs = require('qs');
const sharp = require('sharp');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { GoogleGenerativeAI } = require('@google/generative-ai');

${content}
`;

    // We must fix top-level await in imageBg.js, imageCv.js, and videoEnhancer.js
    // by moving the await loadSharp() inside the code() function.
    if (file.includes('imageBg.js') || file.includes('imageCv.js')) {
      fullCode = fullCode.replace(/await loadSharp\(\)/g, '');
      fullCode = fullCode.replace(/code:\s*async\s*\(([^)]*)\)\s*=>\s*\{/, 'code: async ($1) => {\n  await loadSharp();');
    }
    if (file.includes('videoEnhancer.js')) {
      fullCode = fullCode.replace(/await loadDependencies\(\);?/g, '');
      fullCode = fullCode.replace(/code:\s*async\s*\(([^)]*)\)\s*=>\s*\{/, 'code: async ($1) => {\n  await loadDependencies();');
    }

    const ep = await ApiEndpoint.findOne({ path: apiPath });
    if (ep) {
      ep.code = fullCode;
      await ep.save();
      console.log('Fixed', apiPath);
      count++;
    }
  }

  console.log(`Successfully fixed ${count} APIs with full source code!`);
  process.exit(0);
}
run();
