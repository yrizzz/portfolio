import axios from "axios";
import { Buffer } from "buffer";
import FormData from "form-data";

export default {
    "name": "imageHd",
    "category": "tool",
    "path": "/v1/tool/imageHd",
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
    "description": "HD image",
    "example": `
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
let data = new FormData();
data.append("image", fs.createReadStream("yourpath/image.png"));

let config = {
method: "post",
maxBodyLength: Infinity,
url: "https://yrizzz.my.id/api/v1/tool/imageHd",
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

            const { image } = data;
            const arrayBuffer = await image.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            let form = new FormData();
            form.append('type', 'web-editor');
            form.append('file', buffer, {
                filename: "upload.jpeg",
                contentType: "image/jpeg"
            });

            const upload = await axios.post("https://upload.picsart.com/files", form);
            form = null
            form = JSON.stringify({
                "sharp": {
                    "enabled": false,
                    "threshold": 5,
                    "kernel_size": 3,
                    "sigma": 1,
                    "amount": 1
                },
                "upscale": {
                    "enabled": true,
                    "target_scale": 2,
                    "units": "pixels",
                    "node": "esrgan"
                },
                "face_enhancement": {
                    "enabled": true,
                    "blending": 1,
                    "max_faces": 1000,
                    "impression": false,
                    "gfpgan": true,
                    "node": "ada"
                },
                "get_y": {
                    "enabled": false,
                    "get_y_channel": false
                }
            });
            const create = await axios.post("https://ai.picsart.com/gw1/enhancement/v0319/pipeline?picsart_cdn_url=" + upload.data.result.url + "&format=PNG&model=REALESERGAN", form, {
                headers: {
                    'x-app-authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijk3MjFiZTM2LWIyNzAtNDlkNS05NzU2LTlkNTk3Yzg2YjA1MSJ9.eyJzdWIiOiJhdXRoLXNlcnZpY2Utd2ViIiwiYXVkIjoiYXV0aC1zZXJ2aWNlLXdlYiIsIm5iZiI6MTY4NzQyOTgyOCwic2NvcGUiOltdLCJpYXQiOjE2ODc0NDA2MjgsImlzcyI6Imh0dHBzOi8vcGEtYXV0aG9yaXphdGlvbi1zZXJ2ZXIuc3RhZ2UucGljc2FydC50b29scy9hcGkvb2F1dGgyIiwianRpIjoiYjRkYzU1MzAtYzEzOC00MzBmLWFiNjUtYTMyNDZlYmMwNWU3In0.UpUJB5QBuQKekvSWcBiA_lH0YdB6wKGXu2VscIK3hNYfzCDvvu-jKF7hnVgbX-REE1fAO3CY68eKBthJU1cC48UqLmQHQk8imPIUdPfARRXnH_6y2Qc7FgP3-Go2hLPwTxPXcTX0_AvAt6nviLPnvbfhKrqB6bCp6W4nmVWakrE-PLCJtZ-KuCa5-b6MIsRz_tqNeDXP-TLZhjjdfjIk0hrqr86WIQOH2MsrwLibSpJyKBhNDh314T7fsV4pHx3uQj_NhchsDBATf6vF0x74VjHO1Y6r5XSi6zgBEm-zfdqPOVitC-J-nnQNlOwAEmgFL_Ho49mkgWKjFKmXvm4bFw',
                    'Content-Type': 'application/json',
                    'Cookie': '__cf_bm=EcQfQ3MRY8VlnCvXnpf2D90G40fVfo0KpqWArV6wjD0-1745155903-1.0.1.1-kno_Rwq173TkddMEOXIs4vFs1WgGrE7.n6_yZP3rh0u3X9gi23eJRUSfWSawob.g7aFSeVnhDvQWVZW_3zt7bjsdBKGo2.H0FOEhYPkrE1MyJrYW7I9QvtPPnWAU.uVr'
                }
            });

            let res, status = 'WAITING';
            do {
                const get = await axios.get('https://ai.picsart.com/gw1/enhancement/v0319/pipeline/' + create.data.transaction_id, {
                    headers: {
                        'x-app-authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijk3MjFiZTM2LWIyNzAtNDlkNS05NzU2LTlkNTk3Yzg2YjA1MSJ9.eyJzdWIiOiJhdXRoLXNlcnZpY2Utd2ViIiwiYXVkIjoiYXV0aC1zZXJ2aWNlLXdlYiIsIm5iZiI6MTY4NzQyOTgyOCwic2NvcGUiOltdLCJpYXQiOjE2ODc0NDA2MjgsImlzcyI6Imh0dHBzOi8vcGEtYXV0aG9yaXphdGlvbi1zZXJ2ZXIuc3RhZ2UucGljc2FydC50b29scy9hcGkvb2F1dGgyIiwianRpIjoiYjRkYzU1MzAtYzEzOC00MzBmLWFiNjUtYTMyNDZlYmMwNWU3In0.UpUJB5QBuQKekvSWcBiA_lH0YdB6wKGXu2VscIK3hNYfzCDvvu-jKF7hnVgbX-REE1fAO3CY68eKBthJU1cC48UqLmQHQk8imPIUdPfARRXnH_6y2Qc7FgP3-Go2hLPwTxPXcTX0_AvAt6nviLPnvbfhKrqB6bCp6W4nmVWakrE-PLCJtZ-KuCa5-b6MIsRz_tqNeDXP-TLZhjjdfjIk0hrqr86WIQOH2MsrwLibSpJyKBhNDh314T7fsV4pHx3uQj_NhchsDBATf6vF0x74VjHO1Y6r5XSi6zgBEm-zfdqPOVitC-J-nnQNlOwAEmgFL_Ho49mkgWKjFKmXvm4bFw'
                    }
                })
                if (get.data.status == 'DONE') {
                    status = 'DONE';
                    res = get.data.results.tmp_url
                    console.log("OKE DONE")
                }
                console.log("TRY")

            } while (status != 'DONE')

            const response = await axios.get(res, { responseType: "arraybuffer" })
            const rslt = Buffer.from(response.data,
                "binary").toString("base64");
            return { code: 200, status: true, message: "Success", data: rslt };

        } catch (err) {
            console.log(err.response.data)
            return { code: 500, status: false, message: "Internal server error" };
        }


    }
}
