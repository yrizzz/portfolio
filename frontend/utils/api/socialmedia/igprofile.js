import axios from 'axios';
import qs from 'qs';
import { headerInstagram } from '../../endpoint.js';
export default {
    "name": "igprofile",
    "category": "socialmedia",
    "path": "/v1/socialmedia/igprofile",
    "accept": "application/json",
    "method": "GET",
    "params": [
        {
            "mode": "body",
            "name": "username",
            "category": "form-data",
            "type": "string",
            "default": "jokowi",
            "required": true
        }
    ],
    "description": "get profile instagram",
    "example": `
const axios = require('axios').default;

const options = {
method: 'GET',
url: 'http://yrizzz.my.id/api/v1/socialmedia/igprofile',
params: {username: 'jokowi'},
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
            const { username } = data;

            const get_id = await axios.get('https://www.instagram.com/web/search/topsearch/?context=user&count=0&query=' + username, {
                headers: { ...headerInstagram }
            });

            if (!get_id.data.users || get_id.data.users.length === 0) {
                return { code: 404, status: false, message: 'User not found' };
            }

            const id = get_id.data.users[0].user.id;


            let params = qs.stringify({
                'variables': `{"id":${id},"render_surface":"PROFILE"}`,
                'server_timestamps': 'true',
                'doc_id': '28812098038405011'
            });

            let res;

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://www.instagram.com/graphql/query',
                headers: { ...headerInstagram },
                data: params
            };

            await axios.request(config)
                .then((response) => {
                    res = response.data.data.user
                });

            return { code: 200, status: true, message: 'Success', data: res };


        } catch (err) {
            console.log(err);
            return { code: 500, status: false, message: 'Internal server error' };
        }
    }
}
