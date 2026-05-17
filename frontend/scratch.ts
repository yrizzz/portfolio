import { connectDB } from './src/lib/mongodb';
import { ApiEndpoint } from './src/models/ApiEndpoint';
async function run() {
  await connectDB();
  const res = await ApiEndpoint.findOne({ name: 'Google Translate' }).lean();
  console.log(res.code);
  process.exit(0);
}
run();
