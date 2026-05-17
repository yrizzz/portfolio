import 'dotenv/config';
import fs from 'fs';
import { connectDB } from './src/lib/mongodb';
import { ApiEndpoint } from './src/models/ApiEndpoint';

async function fixIGGlobal() {
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
    
    // If there's an axios call to igprofile with yrizzz.my.id, replace it so it uses global headers correctly!
    // But since the API already proxies internal calls, we can just ensure the headers exist.

    // Inject required dependencies and GLOBAL headers block
    let fixedCode = `module.exports = ` + rawCode.replace(/^async\s*\(([^)]*)\)\s*=>\s*\{/, `async ($1) => {\n` +
      `  const axios = require('axios');\n` +
      `  const qs = require('qs');\n` +
      `  const _globalHeaders = $1._globalHeaders?.instagram;\n` +
      `  if (!_globalHeaders || Object.keys(_globalHeaders).length === 0) {\n` +
      `    return { code: 400, status: false, message: "Instagram headers not configured. Please add Instagram headers in Global Headers settings." };\n` +
      `  }\n` +
      `  const headerInstagram = _globalHeaders;\n`
    );

    const ep = await ApiEndpoint.findOne({ path: apiPath });
    if (ep) {
      ep.code = fixedCode;
      await ep.save();
      console.log('Fixed DB code for:', apiPath);
    } else {
      console.log('Endpoint not found in DB:', apiPath);
    }
  }
  
  console.log("All IG APIs fixed to use Global Headers!");
  process.exit(0);
}

fixIGGlobal();
