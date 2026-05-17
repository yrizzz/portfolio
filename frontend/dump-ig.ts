import 'dotenv/config';
import fs from 'fs';
import { connectDB } from './src/lib/mongodb';
import { ApiEndpoint } from './src/models/ApiEndpoint';

async function check() {
  await connectDB();
  const endpoints = await ApiEndpoint.find({ path: /ig/i });
  for (const ep of endpoints) {
    fs.writeFileSync(`dump_${ep.path.replace(/\//g, '_')}.js`, ep.code);
  }
  process.exit(0);
}
check();
