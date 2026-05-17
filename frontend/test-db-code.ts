import { connectDB } from './src/lib/mongodb';
import { ApiEndpoint } from './src/models/ApiEndpoint';

async function run() {
  await connectDB();
  const ep = await ApiEndpoint.findOne({ path: '/v1/tool/imageBg' });
  console.log(ep.code.substring(0, 300));
  process.exit(0);
}
run();
