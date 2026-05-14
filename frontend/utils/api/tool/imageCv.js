let sharp;

async function loadSharp() {
    if (typeof window === 'undefined') {
        const sharpModule = await import('sharp');
        sharp = sharpModule.default;
    }
}

await loadSharp()
export default {
    "name": "imageCv",
    "category": "tool",
    "path": "/v1/tool/imageCv",
    "accept": "application/json",
    "method": "POST",
    "params": [
        {
            "mode": "body",
            "name": "type",
            "category": "form-data",
            "type": "text",
            "default": "heic, heif, avif, jpeg, jpg, jpe, tile, dz, png, raw, tiff, tif, webp, gif, jp2, jpx, j2k, j2c, jxl",
            "required": true
        },
        {
            "mode": "body",
            "name": "image",
            "category": "form-data",
            "type": "file",
            "default": "-",
            "required": true
        }
    ],
    "description": "imageCv",
    "example": `
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
let data = new FormData();
data.append("image", fs.createReadStream("yourpath/image.png"));
data.append("type","webp");

let config = {
method: "post",
maxBodyLength: Infinity,
url: "https://yrizzz.my.id/api/v1/tool/imageCv",
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
            let res;
            const { image, type } = data
            const supportedOutputTypes = ['heic', 'heif', 'avif', 'jpeg', 'jpg', 'jpe', 'tile', 'dz', 'png', 'raw', 'tiff', 'tif', 'webp', 'gif', 'jp2', 'jpx', 'j2k', 'j2c', 'jxl'];
            if (image && type) {
                if (!supportedOutputTypes.includes(type.toLowerCase())) {
                    res = {
                        code: 400,
                        status: false,
                        message: `Image format '${type}' is not supported. Supported formats are: ${supportedOutputTypes.join(', ')}`
                    };

                } else {
                    const arrayBuffer = await image.arrayBuffer();
                    const outputBuffer = await sharp(arrayBuffer)
                        .toFormat(type)
                        .toBuffer();

                    const base64 = outputBuffer.toString('base64');
                    res = { code: 200, status: true, message: 'Success', data: `data:image/${type};base64,` + base64 };
                }
                return res;
            }
        } catch (err) {
            return { code: 500, status: false, message: err };
        }
    }
}
