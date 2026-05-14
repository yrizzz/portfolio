import axios from 'axios';
import { Buffer } from 'buffer';
export default {
    "name": "ssweb",
    "category": "tool",
    "path": "/v1/tool/ssweb",
    "accept": "application/json",
    "method": "GET",
    "params": [
        {
            "mode": "body",
            "name": "domain",
            "category": "form-data",
            "type": "string",
            "default": "detik.com",
            "required": true
        },
        {
            "mode": "body",
            "name": "type",
            "category": "form-data",
            "type": "string",
            "default": "fullpage|mobile|desktop",
            "required": true
        }
    ],
    "description": "get screenshot website",
    "example": `
const axios = require('axios').default;

const options = {
method: 'GET',
url: 'https://yrizzz.my.id/api/v1/tool/ssweb',
params: {domain: 'detik.com', type: 'mobile'},
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
            let { domain, type } = data;

            if (domain == '') {
                return { code: 400, status: false, message: 'Domain is required' };
            } else if (type == '') {
                return { code: 400, status: false, message: 'Type is required' };
            }
            if (!domain.match('http') || !domain.match('https')) {
                domain = 'https://' + domain;
            }

            let url;
            if (type == 'fullpage') {
                url = 'https://image.thum.io/get/png/noanimate/fullpage/wait/5/' + domain;
            } else if (type == 'mobile') {
                url = 'https://image.thum.io/get/png/noanimate/iphone14promax/wait/5/' + domain;
            } else {
                url = 'https://image.thum.io/get/noanimate/width/1024/png/wait/5/' + domain;
            }

            const response = await axios.get(url, { responseType: 'arraybuffer' })
            const base64 = Buffer.from(response.data,
                "binary").toString("base64");


            return { code: 200, status: true, message: 'Success', data: base64 };



        } catch (err) {
            return { code: 500, status: false, message: 'Internal server error' };
        }
    }
}
