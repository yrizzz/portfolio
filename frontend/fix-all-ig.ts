import 'dotenv/config';
import fs from 'fs';
import { connectDB } from './src/lib/mongodb';
import { ApiEndpoint } from './src/models/ApiEndpoint';
import { headerInstagram } from './utils/endpoint.js';

async function fixIG() {
  await connectDB();
  
  const files = [
    './utils/api/socialmedia/igprofile.js',
    './utils/api/socialmedia/igpost.js',
    './utils/api/socialmedia/ighighlight.js',
    './utils/api/socialmedia/igstory.js',
    './utils/api/downloader/instagram.js'
  ];

  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.log('File not found:', file);
      continue;
    }
    
    console.log('Processing:', file);
    const content = fs.readFileSync(file, 'utf-8');
    
    // Find the API path
    const pathMatch = content.match(/["']?path["']?\s*:\s*["']([^"']+)["']/);
    if (!pathMatch) {
      console.log('No pathMatch for', file);
      continue;
    }
    const apiPath = pathMatch[1];

    let codeStart = content.indexOf('"code": async');
    if (codeStart === -1) codeStart = content.indexOf('"code": async');
    if (codeStart === -1) codeStart = content.indexOf('code: async');
    if (codeStart === -1) {
      console.log('No codeStart for', file);
      continue;
    }

    let rawCode = content.substring(content.indexOf('async', codeStart));
    const lastBrace = rawCode.lastIndexOf('}');
    if (lastBrace !== -1) {
      rawCode = rawCode.substring(0, lastBrace).trim().replace(/,$/, '');
    }
    
    // Remove console.log(err) because it corrupts JSON output in sandbox
    rawCode = rawCode.replace(/console\.log\(err\)/g, '// console.log(err)');
    rawCode = rawCode.replace(/console\.log\([^)]+\)/g, '// console.log');

    // Add robust check for .match()
    rawCode = rawCode.replace(/let link = data\.match\(([^)]+)\)/g, 
      'let link = data.match($1);\n      if (!link) return { code: 400, status: false, message: "Invalid URL format" };'
    );

    // Inject required dependencies and headers
    let fixedCode = `module.exports = ` + rawCode.replace(/^async\s*\(([^)]*)\)\s*=>\s*\{/, `async ($1) => {\n` +
      `  const axios = require('axios');\n` +
      `  const qs = require('qs');\n` +
      `  const headerInstagram = ${JSON.stringify(headerInstagram)};\n`
    );

    // Some APIs use `headerInstagram` directly, others might use `headers: { ...headerInstagram }`.
    // The JSON stringification covers `headerInstagram` as a variable.

    const ep = await ApiEndpoint.findOne({ path: apiPath });
    if (ep) {
      ep.code = fixedCode;
      await ep.save();
      console.log('Fixed DB code for:', apiPath);
    } else {
      console.log('Endpoint not found in DB:', apiPath);
    }
  }
  
  console.log("All IG APIs fixed!");
  process.exit(0);
}

fixIG();
