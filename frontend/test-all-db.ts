import 'dotenv/config';
import { connectDB } from './src/lib/mongodb';
import { ApiEndpoint } from './src/models/ApiEndpoint';
import { join } from 'path';

const ALLOWED_MODULES = [
  'axios', 'form-data', 'sharp', 'crypto', 'path', 'fs', 'url',
  'querystring', 'buffer', 'stream', 'util', 'zlib',
  'node-fetch', 'cheerio', 'lodash', 'moment', 'dayjs',
  'uuid', 'validator', 'sanitize-html', 'marked', 'csv-parse',
  'qrcode', 'jimp', 'pdf-lib', 'qs', 'dateformat',
  '@google/generative-ai', 'https-proxy-agent',
];

async function check() {
  await connectDB();
  const endpoints = await ApiEndpoint.find({});
  let foundUnreplaced = 0;

  const nodeModulesPath = join(process.cwd(), 'node_modules');
  const builtInModules = ['crypto', 'path', 'fs', 'url', 'querystring', 'buffer', 'stream', 'util', 'zlib'];

  for (const ep of endpoints) {
    let convertedCode = ep.code;
    
    // basic mock of convertImportsToRequire
    convertedCode = convertedCode.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?/g, 'const $1 = require("$2");');

    for (const mod of ALLOWED_MODULES) {
      if (!builtInModules.includes(mod)) {
        const regex = new RegExp(`require\\s*\\(\\s*['"]${mod}['"]\\s*\\)`, 'g');
        const absPath = join(nodeModulesPath, mod).replace(/\\/g, '\\\\');
        convertedCode = convertedCode.replace(regex, `require('${absPath}')`);
      }
    }

    if (convertedCode.includes("require('axios')") || convertedCode.includes('require("axios")')) {
      console.log(`Endpoint ${ep.path} STILL has require('axios')!`);
      foundUnreplaced++;
    }
  }

  console.log(`Finished checking ${endpoints.length} endpoints. Found ${foundUnreplaced} unreplaced.`);
  process.exit(0);
}
check();
