const axios = require('axios');
async function test() {
  try {
    const headers = {
      'Host': 'api-pddikti.kemdiktisaintek.go.id',
      'Origin': 'https://pddikti.kemdiktisaintek.go.id',
      'Referer': 'https://pddikti.kemdiktisaintek.go.id/',
      'X-User-IP': '103.148.201.72'
    };
    const dikti = await axios.get('https://api-pddikti.kemdiktisaintek.go.id/pencarian/mhs/Jokowi', { headers });
    console.log("Search result length:", dikti.data.length);
    if (dikti.data.length > 0) {
      console.log("First ID:", dikti.data[0].id);
    }
  } catch (e) {
    console.error("Error:", e.response?.data || e.message);
  }
}
test();
