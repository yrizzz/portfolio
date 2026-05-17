import { connectDB } from './src/lib/mongodb';
import { ApiEndpoint } from './src/models/ApiEndpoint';
import dikti from './utils/api/random/dikti.js';

async function run() {
  await connectDB();
  
  // Extract the function body as string
  const codeString = `module.exports = ${dikti.code.toString()}`;
  
  const result = await ApiEndpoint.findOneAndUpdate(
    { name: { $regex: 'dikti', $options: 'i' } },
    { 
      code: codeString,
      params: JSON.stringify(dikti.params),
      description: dikti.description
    },
    { new: true }
  );
  
  console.log("Updated API:", result?.name);
  process.exit(0);
}

run();
