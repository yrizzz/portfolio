import axios from "axios";
import { Buffer } from "buffer";
import FormData from "form-data";
let sharp;

async  function loadSharp() {
    if (typeof window === 'undefined') {
        const sharpModule = await import('sharp');
        sharp = sharpModule.default;
    }
}

await loadSharp()
export default {
    "name": "imageBg",
    "category": "tool",
    "path": "/v1/tool/imageBg",
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
        },
        {
            "mode": "body",
            "name": "color",
            "category": "form-data",
            "type": "string",
            "default": "blue",
            "required": true
        }
    ],
    "description": "Change image background",
    "example": `
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
let data = new FormData();
data.append("image", fs.createReadStream("yourpath/image.png"));
data.append("color","blue");

let config = {
method: "post",
maxBodyLength: Infinity,
url: "https://yrizzz.my.id/api/v1/tool/imageBg",
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
    code: async (data) => {
        try {

            const { image,color } = data;
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
                    'X-Client-Version': 'web:pixelcut.ai:767d0151'
                },
                responseType: 'arraybuffer'
            });

            const imageBuffer = Buffer.from(removebg.data);
            let backgroundColor = color || 'blue';
            await sharp.cache(false); 
            const finalImageBuffer = await sharp(imageBuffer)
                .flatten({ background: backgroundColor })
                .jpeg({ progressive: true })
                .toBuffer();

            const base64 = finalImageBuffer.toString('base64');
            return {
                code: 200,
                status: true,
                message: 'Success',
                data: `data:image/jpeg;base64,${base64}`
            };

        } catch (err) {
            console.log(err.response.data)
            return { code: 500, status: false, message: "Internal server error" };
        }


    }
}
