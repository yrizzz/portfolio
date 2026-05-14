import axios from 'axios';
export default {
    "name": "dikti",
    "category": "random",
    "path": "/v1/random/dikti",
    "accept": "application/json",
    "method": "GET",
    "params": [
        {
            "mode": "body",
            "name": "data",
            "category": "form-data",
            "type": "string",
            "default": "Jokowi",
            "required": true
        }
    ],
    "description": "web scraping data from dikti",
    "example": `
const axios = require('axios').default;

const options = {
method: 'GET',
url: 'https://yrizzz.my.id/api/v1/random/dikti',
params: {data: 'Jokowi'},
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
        try {
            const { data } = params;

            const headers = {
                'Host': 'api-pddikti.kemdiktisaintek.go.id',
                'Origin': 'https://pddikti.kemdiktisaintek.go.id',
                'Referer': 'https://pddikti.kemdiktisaintek.go.id/',
                'X-User-IP': ' 103.148.201.72'
            };
            const dikti = await axios.get('https://api-pddikti.kemdiktisaintek.go.id/pencarian/mhs/' + data, {
                headers: headers
            });

            const detailMhs = await axios.get('https://api-pddikti.kemdiktisaintek.go.id/detail/mhs/' + dikti.data[0].id,
                {
                    headers: headers
                }
            );

            return { code: 200, status: true, message: 'Success', data: detailMhs.data };

        } catch (err) {
            return { code: 500, status: false, message: 'Internal server error' };

        }
    }

}
