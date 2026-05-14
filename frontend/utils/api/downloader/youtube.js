import axios from 'axios';
import FormData from 'form-data';
export default {
    "name": "youtube",
    "category": "downloader",
    "path": "/v1/downloader/youtube",
    "accept": "application/json",
    "method": "GET",
    "params": [
        {
            "mode": "body",
            "name": "data",
            "category": "form-data",
            "type": "string",
            "default": "https://www.youtube.com/watch?v=ANOKA-6DoKo",
            "required": true
        },
        {
            "mode": "body",
            "name": "format",
            "category": "form-data",
            "type": "string",
            "default": "mp3/360/720/1080",
            "required": true
        }
    ],
    "description": "downloader youtube",
    "example": `
const axios = require('axios').default;

const options = {
method: 'GET',
url: 'http://yrizzz.my.id/api/v1/downloader/youtube',
params: {data: 'https://www.youtube.com/watch?v=ANOKA-6DoKo'},
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
        let res;
        const { data, format } = params;
        

    // const param = new FormData();
    // param.append('hl', 'en');
    // param.append('query', data);
    // param.append('cf_token', 'home');

    // const config = {
    //     method: 'post',
    //     maxBodyLength: Infinity,
    //     url: 'https://ssvid.net/api/ajax/search',
    //     headers: { ...param.getHeaders() },
    //     data: param
    // };

    // const result = await axios.request(config);
    // const { vid, links } = result.data;

    // const formatPatterns = {
    //     "360": /360p/i,
    //     "720": /720p/i,
    //     "1080": /1080p/i,
    //     "mp3": /128kbps/i
    // };

    // const pattern = formatPatterns[format];
    // if (!pattern) {
    //     return { code: 400, status: false, message: `Format '${format}' not supported` };
    // }

    // let selected = null;

    // for (const [typeKey, typeObj] of Object.entries(links)) {
    //     const match = Object.values(typeObj).find(v => pattern.test(v.q_text || v.q));
    //     if (match) {
    //         selected = match;
    //         break;
    //     }
    // }

    // if (!selected || !selected.k) {
    //     return { code: 404, status: false, message: `No valid link found for format '${format}'` };
    // }

    // const param2 = new FormData();
    // param2.append('vid', vid);
    // param2.append('k', selected.k);

    // const config2 = {
    //     method: 'post',
    //     maxBodyLength: Infinity,
    //     url: 'https://ssvid.net/api/ajax/convert?hl=en',
    //     headers: { ...param2.getHeaders() },
    //     data: param2
    // };

    // const result2 = await axios.request(config2);

    // if (result2.data.status === 'ok') {
    //     return {
    //         code: 200,
    //         status: true,
    //         message: 'Success',
    //         data: {
    //             title: result2.data.title,
    //             type: result2.data.ftype,
    //             download_url: result2.data.dlink
    //         }
    //     };
    // }

    // return {
    //     code: 500,
    //     status: false,
    //     message: 'Convert failed',
    //     data: result2.data
    // };
    

        // let param = new FormData();
        // param.append('hl', 'en');
        // param.append('query',data);
        // param.append('cf_token', 'home');

        // let config = {
        //     method: 'post',
        //     maxBodyLength: Infinity,
        //     url: 'https://ssvid.net/api/ajax/search',
        //     headers: {
        //         ...param.getHeaders()
        //     },
        //     data: param
        // };

        // const result = await axios.request(config);
        // console.log(result);
        // const vid = result.data.vid;
        // let selected = null;
        // if (format == '360') {
        //     selected = result.data.links.mp4[18];
        // } else if (format == '720') {
        //     selected = result.data.links.mp4[136];
        // } else if (format == '1080') {
        //     selected = result.data.links.mp4[137];
        // } else if (format == 'mp3') {
        //     selected = result.data.links.mp3.mp3128;
        // } else {
        //     return { code: 500, status: false, message: 'format not supported' };
        // }


        // let param2 = new FormData();
        // param2.append('vid', vid);
        // param2.append('k', selected.k);

        // let config2 = {
        //     method: 'post',
        //     maxBodyLength: Infinity,
        //     url: 'https://ssvid.net/api/ajax/convert?hl=en',
        //     headers: {
        //         ...param2.getHeaders()
        //     },
        //     data: param2
        // };

        // const result2 = await axios.request(config2);
        // console.log(result2.data.status)
        // if (result2.data.status == 'ok') {
        //     return{ code: 200, status: true, message: 'Success', data: { title: result2.data.title, type: result2.data.ftype, download_url: result2.data.dlink } }
        // }



        let config = {
            method: 'GET',
            url: 'https://p.savenow.to/ajax/download.php?format=' + format + '&url=' + data + '&api=dfcb6d76f2f6a9894gjkege8a4ab232222',
            headers: {
                'Cookie': 'loader_session=7deZy6G8JWZkrq7jOQxi9nJatCyHUa9J5k0eKze2'
            }
        };

        await axios.request(config)
            .then(async (response) => {
                let status;
                let result = response.data;

                if (result) {
                    do {
                        let config = {
                            method: 'get',
                            maxBodyLength: Infinity,
                            url: result.progress_url,
                            headers: {
                                'Cookie': 'loader_session=7deZy6G8JWZkrq7jOQxi9nJatCyHUa9J5k0eKze2'
                            }
                        };

                        await axios.request(config)
                            .then((response) => {
                                let r = response.data;
                                if (r.text == 'Finished') {
                                    status = 'Finished';
                                    res = { code: 200, status: true, message: 'Success', data: { title: result.title, download_url: r.download_url } }
                                }
                            })
                            .catch((error) => {
                                res = { code: 500, status: false, message: error.response.data.message };

                            });
                    } while (status != 'Finished')

                }
            })
            .catch((error) => {
                res = { code: 500, status: false, message: error.response.data.message };
            });

        return await res;


    }

}

