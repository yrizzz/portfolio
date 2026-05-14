import { GoogleGenerativeAI } from '@google/generative-ai';
export default {
    "name": "geminiAi",
    "category": "ai",
    "path": "/v1/ai/geminiAi",
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
    "description": "chat with geminiAI",
    "example": `
const axios = require('axios').default;

const options = {
method: 'GET',
url: 'https://yrizzz.my.id/api/v1/ai/geminiAi',
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
            const genAI = new GoogleGenerativeAI('AIzaSyDwvysD0Ep47MvQ0WLC0gbuMPIMWbiRMHE');

            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text().replaceAll('**','*');
            text = text.replaceAll('* *','*')
            return { code: 200,status: true,message: 'Success',data: text };
        } catch (err) {
            console.log(err)
            return { code: 500,status: false,message: 'Internal server error' };
        }
    }
}
