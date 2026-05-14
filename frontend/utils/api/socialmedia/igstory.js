import axios from 'axios';
import qs from 'qs';
import { headerInstagram } from '../../endpoint.js';

export default {
    "name": "igstory",
    "category": "socialmedia",
    "path": "/v1/socialmedia/igstory",
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
    "description": "get story instagram",
    "example": `
const axios = require('axios').default;

const options = {
method: 'GET',
url: 'http://yrizzz.my.id/api/v1/socialmedia/igstory',
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
            const get_id = await axios.get(`https://yrizzz.my.id/api/v1/socialmedia/igprofile?username=${username}`);


            let id = get_id.data.data.id;
            
            let params = qs.stringify({
                'variables': ` {"reel_ids_arr":["${id}"]}`,
                'server_timestamps': ' false',
                'doc_id': ' 9342251469147045'
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
                    res = response.data.data.xdt_api__v1__feed__reels_media.reels_media;
                });

            return { code: 200, status: true, message: 'Success', data: res };

        } catch (err) {
            console.log(err)
            return { code: 500, status: false, message: 'Internal server error' };
        }
    }
}
