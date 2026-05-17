import { connectDB } from './src/lib/mongodb';
import { ApiEndpoint } from './src/models/ApiEndpoint';

async function run() {
  await connectDB();
  const endpoints = await ApiEndpoint.find({});
  for (let ep of endpoints) {
    if (ep.code && ep.code.includes('require(\'axios\')') && !ep.code.includes('require(\'sharp\')')) {
      ep.code = ep.code.replace(
        "const axios = require('axios');", 
        "const axios = require('axios');\n  const sharp = require('sharp');\n  const { HttpsProxyAgent } = require('https-proxy-agent');"
      );
      await ep.save();
      console.log('Fixed', ep.path);
    }
  }
  console.log('Done');
  process.exit(0);
}
run();
