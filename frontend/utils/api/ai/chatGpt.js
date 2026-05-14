import axios from 'axios';
export default {
    "name": "chatGpt",
    "category": "ai",
    "path": "/v1/ai/chatGpt",
    "accept": "application/json",
    "method": "GET",
    "params": [
        {
            "mode": "body",
            "name": "prompt",
            "category": "form-data",
            "type": "string",
            "default": "Halo",
            "required": true
        }
    ],
    "description": "chat with chatGpt",
    "example": `
const axios = require('axios').default;

const options = {
method: 'GET',
url: 'https://yrizzz.my.id/api/v1/ai/chatGpt',
params: {prompt: 'Halo'},
headers: {Accept: '*/*', 'User-Agent': 'Thunder Client (https://www.thunderclient.com)'}
};

try {
const { data } = await axios.request(options);
console.log(data);
} catch (error) {
console.error(error);
}
`,
    "code": async (data) => {
        try {
            const { prompt } = data;
            let res = '';
            await axios({
                method: 'POST',
                url: 'https://chateverywhere.app/api/chat/',
                data: {
                    "model": {
                        "id": "gpt-4",
                        "name": "GPT-4o",
                        "maxLength": 32000,
                        "tokenLimit": 8000,
                        "completionTokenLimit": 5000,
                        "deploymentName": "gpt-4o"
                    },
                    "messages": [
                        {
                            "pluginId": null,
                            "content": prompt,
                            "role": "user"
                        }
                    ],
                    "prompt": 'nama mu adalah robot asisten, kamu adalah asisten kecerdasan buatan yang sering membantu orang lain jika ada yang ditanyakan',
                    "temperature": 0.5
                },
                headers: {
                    "Accept": "/*/",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
                }
            }).then(async (response) => {
                res = { code: 200, status: true, message: 'Success', data: response.data };
            }).catch(async () => {
                res = { code: 500, status: false, message: 'Internal server error' };
            })

            return res;
        } catch (err) {
            return { code: 500, status: false, message: 'Internal server error' };
        }
    }
}
