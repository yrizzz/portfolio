import axios from 'axios'

export default {
    "name": "dnsrecord",
    "category": "domain",
    "path": "/v1/domain/dnsrecord",
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
    "description": "check dnsrecord domain",
    "example": `
const axios = require('axios').default;

const options = {
method: 'GET',
url: 'https://yrizzz.my.id/api/v1/domain/dnsrecord',
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
    code: async (data) => {
        try {
            const { domain } = data;
            let res;
            await axios({
                url: 'https://api.dmns.app/domain/' + domain + '/dns-records',
                method:'GET',
                headers: {
                    'Authority': 'api.dmns.app',
                    'Origin': 'https://dmns.app',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36'
                }
            }).then(async (response) => {
                res = response.data;
            });
            return { code: 200, status: true, message: 'Success', data: res };

        } catch (err) {
            return { code: 500, status: false, message: 'Internal server error' };
        }
    }
}
