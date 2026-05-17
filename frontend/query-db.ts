import { connectDB } from './src/lib/mongodb';
import { ApiEndpoint } from './src/models/ApiEndpoint';
async function run() {
  await connectDB();
  const eps = await ApiEndpoint.find({ path: { $regex: 'translate', $options: 'i' } });
  console.log(JSON.stringify(eps, null, 2));
  process.exit(0);
}
run();
