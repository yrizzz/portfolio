const axios = require('axios');
async function test() {
  try {
    const { data } = await axios.get('http://localhost:3000/api/execute/v1/random/dikti?data=Jokowi');
    console.log(data);
  } catch (e) {
    console.error(e.response?.data || e.message);
  }
}
test();
