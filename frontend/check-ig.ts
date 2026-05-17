import 'dotenv/config';
import { connectDB } from './src/lib/mongodb';
import { ApiEndpoint } from './src/models/ApiEndpoint';

async function check() {
  await connectDB();
  const endpoints = await ApiEndpoint.find({ path: /ig/i });
  for (const ep of endpoints) {
    console.log("=== API: " + ep.name + " (" + ep.path + ") ===");
    console.log(ep.code);
  }
  process.exit(0);
}
check();
