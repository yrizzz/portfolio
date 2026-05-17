import { connectDB } from './src/lib/mongodb';
import { ApiEndpoint } from './src/models/ApiEndpoint';
import fs from 'fs';

async function run() {
  await connectDB();
  
  const gtranslate = await ApiEndpoint.findOne({ path: '/v1/tool/gtranslate' });
  if (gtranslate) {
    const realScript = fs.readFileSync('./utils/api/tool/translate.js', 'utf-8');
    gtranslate.code = realScript;
    await gtranslate.save();
    console.log('Fixed gtranslate!');
  }
  
  process.exit(0);
}
run();
