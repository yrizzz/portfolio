import { connectDB } from './src/lib/mongodb';
import { ApiEndpoint } from './src/models/ApiEndpoint';
async function run() {
  await connectDB();
  const eps = await ApiEndpoint.aggregate([
    { $group: { _id: "$path", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);
  console.log(JSON.stringify(eps, null, 2));
  process.exit(0);
}
run();
