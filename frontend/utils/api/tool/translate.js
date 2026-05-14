import axios from 'axios';
export default {
    "name": "translate",
    "category": "tool",
    "path": "/v1/tool/translate",
    "accept": "application/json",
    "method": "GET",
    "params": [
        {
            "mode": "body",
            "name": "from",
            "category": "form-data",
            "type": "string",
            "default": "auto",
            "required": true
        },
        {
            "mode": "body",
            "name": "to",
            "category": "form-data",
            "type": "string",
            "default": "id",
            "required": true
        },
        {
            "mode": "body",
            "name": "data",
            "category": "form-data",
            "type": "string",
            "default": "hello world",
            "required": true
        }
    ],
    "description": "translate by google",
    "example": `
const axios = require('axios').default;

const options = {
method: 'GET',
url: 'https://yrizzz.my.id/api/v1/tool/translate',
params: {from: 'auto', to: 'id',data:'hello world'},
headers: {Accept: '*/*', 'User-Agent': 'Thunder Client (https://www.thunderclient.com)'}
};

try {
const { data } = await axios.request(options);
console.log(data);
} catch (error) {
console.error(error);
}
`,
    "code": async (params) => {

        try {
            let { from, to, data } = params;

            const response = await axios.post(`https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${from}&tl=${to}&q=${data}`, null, {
                headers:
                {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Cookie': 'AEC=AVcja2cI5ojPfQ2dgFqc4du6enxoAy9CJMSDLpQjG1dPvjJ2UpA6Iyw-PxY; NID=523=BefdtcGHCyXQGgcb56-b8VO9tTomBAchdVnlQRWfR8y7S5R3ZxhOiUm8ksZL_x_bhng6Hvw6CDoX-cpSghdD2Mu3XWp661o7MBpe269WutVjsvE5VcY0zATW8Wuuv_Z1i6ER1J4Nl5drgFG9l-FRyv3eU0M8qSzO6Ytke8oFKVV9bS1Wo_EA04GoStgKnjWvRdcxLH39VaE1XmjjS6SzAG8nULLe9IwlYwLzvQ6SLxga2uqng7hOyt_C9FDGTLDb3NE; SEARCH_SAMESITE=CgQIl50B'
                }
            })

            return { code: 200, status: true, message: 'Success', data: { detect: response.data[0][1], translated: response.data[0][0] } };

        } catch (err) {
            return { code: 500, status: false, message: 'Internal server error' };
        }
    }
}
