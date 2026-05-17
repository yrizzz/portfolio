const axios = require('axios');
async function test() {
  try {
    const headers = {
      'Host': 'api-pddikti.kemdiktisaintek.go.id',
      'Origin': 'https://pddikti.kemdiktisaintek.go.id',
      'Referer': 'https://pddikti.kemdiktisaintek.go.id/',
      'X-User-IP': '103.148.201.72'
    };
    const detailMhs = await axios.get('https://api-pddikti.kemdiktisaintek.go.id/detail/mhs/nz81BPwzQ95YIA-mvvL50hVs81aUaYg6jS7jRnFTMm2F60tBW_ewCHvSRJaW7rrxrdvvbg==', { headers });
    console.log("Detail result:", !!detailMhs.data);
  } catch (e) {
    console.error("Error:", e.response?.data || e.message);
  }
}
test();
