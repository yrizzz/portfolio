import axios from 'axios';
import { Buffer } from 'buffer';
import FormData from 'form-data';

export default {
    "name": "removeBg",
    "category": "tool",
    "path": "/v1/tool/removeBg",
    "accept": "application/json",
    "method": "POST",
    "params": [
        {
            "mode": "body",
            "name": "image",
            "category": "form-data",
            "type": "file",
            "default": "-",
            "required": true
        }
    ],
    "description": "remove background image",
    "example": `
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
let data = new FormData();
data.append('image', fs.createReadStream('yourpath/image.png'));

let config = {
method: 'post',
maxBodyLength: Infinity,
url: 'https://yrizzz.my.id/api/v1/tool/removeBg',
headers: { 
    ...data.getHeaders()
},
data : data
};

axios.request(config)
.then((response) => {
console.log(JSON.stringify(response.data));
})
.catch((error) => {
console.log(error);
});
`,
    "code": async (data) => {
        try {
            const { image } = data;
            const arrayBuffer = await image.arrayBuffer();
            const buffer = await Buffer.from(arrayBuffer);

            let formdata = new FormData();
            formdata.append('image', buffer, { filename: 'image.png' });
            formdata.append('format', 'png');
            formdata.append('model', 'v1');


            const removebg = await axios.post('https://api2.pixelcut.app/image/matte/v1', formdata, {
                headers: {
                    'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundarywLIZ6MslWB8TJ7Ub',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
                    'X-Client-Version': 'Web'
                },
                responseType: 'arraybuffer'
            });

            const base64 = Buffer.from(removebg.data,
                "binary").toString("base64");


            return { code: 200, status: true, message: 'Success', data: base64 };

        } catch (err) {
            return { code: 500, status: false, message:err };
        }
    }
}
