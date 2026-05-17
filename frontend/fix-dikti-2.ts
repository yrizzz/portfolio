import { connectDB } from './src/lib/mongodb';
import { ApiEndpoint } from './src/models/ApiEndpoint';

const correctCode = `module.exports = async (params) => {
  const axios = require('axios');
  try {
    const { data } = params;

    const headers = {
        'Host': 'api-pddikti.kemdiktisaintek.go.id',
        'Origin': 'https://pddikti.kemdiktisaintek.go.id',
        'Referer': 'https://pddikti.kemdiktisaintek.go.id/',
        'X-User-IP': ' 103.148.201.72'
    };
    const dikti = await axios.get('https://api-pddikti.kemdiktisaintek.go.id/pencarian/mhs/' + data, {
        headers: headers
    });

    if (!dikti.data || dikti.data.length === 0) {
      return { code: 404, status: false, message: 'Data not found' };
    }

    const detailMhs = await axios.get('https://api-pddikti.kemdiktisaintek.go.id/detail/mhs/' + dikti.data[0].id,
        {
            headers: headers
        }
    );

    return { code: 200, status: true, message: 'Success', data: detailMhs.data };

  } catch (err) {
      return { code: 500, status: false, message: err.message || 'Internal server error' };
  }
};`

async function run() {
  await connectDB();
  await ApiEndpoint.findOneAndUpdate(
    { name: { $regex: 'dikti', $options: 'i' } },
    { code: correctCode }
  );
  console.log("Fixed Dikti API Code");
  process.exit(0);
}
run();
