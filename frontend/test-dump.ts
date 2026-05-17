import { connectDB } from './src/lib/mongodb';
import { ApiEndpoint } from './src/models/ApiEndpoint';
async function test() {
  await connectDB();
  const res = await ApiEndpoint.findOne({ name: { $regex: 'dikti', $options: 'i' } }).lean();
  console.log(res.code);
  process.exit(0);
}
test();
