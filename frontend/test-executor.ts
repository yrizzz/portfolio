import { join } from 'path';

const ALLOWED_MODULES = [
  'axios', 'form-data', 'sharp', 'crypto', 'path', 'fs', 'url',
  'querystring', 'buffer', 'stream', 'util', 'zlib',
  'node-fetch', 'cheerio', 'lodash', 'moment', 'dayjs',
  'uuid', 'validator', 'sanitize-html', 'marked', 'csv-parse',
  'qrcode', 'jimp', 'pdf-lib', 'qs', 'dateformat',
  '@google/generative-ai', 'https-proxy-agent',
];

let convertedCode = `
  const axios = require("axios");
  const qs = require('qs');
`;

const nodeModulesPath = join(process.cwd(), 'node_modules');
const builtInModules = ['crypto', 'path', 'fs', 'url', 'querystring', 'buffer', 'stream', 'util', 'zlib'];

for (const mod of ALLOWED_MODULES) {
  if (!builtInModules.includes(mod)) {
    const regex = new RegExp(`require\\s*\\(\\s*['"]${mod}['"]\\s*\\)`, 'g');
    const absPath = join(nodeModulesPath, mod).replace(/\\/g, '\\\\');
    convertedCode = convertedCode.replace(regex, `require('${absPath}')`);
  }
}

console.log("Converted code:");
console.log(convertedCode);
