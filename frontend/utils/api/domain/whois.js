import axios from 'axios';

export default {
    "name": "whois",
    "category": "domain",
    "path": "/v1/domain/whois",
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
        }
    ],
    "description": "check whois domain",
    "example": `
const axios = require('axios').default;

const options = {
method: 'GET',
url: 'https://yrizzz.my.id/api/v1/domain/whois',
params: {domain: 'detik.com'},
headers: {Accept: '*/*', 'User-Agent': 'Thunder Client (https://www.thunderclient.com)'}
};

try {
const { data } = await axios.request(options);
console.log(data);
} catch (error) {
console.error(error);
}
`,
    'code': async (data) => {
        try {
            const { domain } = data;
            let res;

            await axios({
                url: 'https://api.dmns.app/domain/' + domain + '?mode=detailed',
                headers: {
                    'Authority': 'api.dmns.app',
                    'Method': 'GET',
                    'Path': '/domain/google.com/dns-records',
                    'Scheme': 'https',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'no-cache',
                    'Origin': 'https://dmns.app',
                    'Pragma': 'no-cache',
                    'Referer': 'https://dmns.app/',
                    'Sec-Ch-Ua': '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
                    'Sec-Ch-Ua-Mobile': '?1',
                    'Sec-Ch-Ua-Platform': '"Android"',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-site',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36'
                }
            }).then(async (response) => {
                res = response.data.whois;
            }).catch(async () => {
                return { code: 500,status: false,message: 'Internal server error' };
            })

            return { code: 200,status: true,message: 'Success',data: res };

        } catch (err) {
            return { code: 500,status: false,message: 'Internal server error' };
        }
    }
}
