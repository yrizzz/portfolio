import axios from 'axios';
import qs from 'qs';
import { headerInstagram } from '../../endpoint.js';

export default {
    "name": "igpost",
    "category": "socialmedia",
    "path": "/v1/socialmedia/igpost",
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
    "description": "get post instagram",
    "example": `
const axios = require('axios');
const FormData = require('form-data');
let data = new FormData();
data.append('username', 'jokowi');

let config = {
method: 'post',
maxBodyLength: Infinity,
url: 'https://yrizzz.my.id/api/v1/socialmedia/igpost',
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
            const { username } = data;
            let headers = headerInstagram;

            let params = qs.stringify({
                'variables': `{"data":{"count":12,"include_reel_media_seen_timestamp":true,"include_relationship_info":true,"latest_besties_reel_media":true,"latest_reel_media":true},"username":"${username}","__relay_internal__pv__PolarisIsLoggedInrelayprovider":true,"__relay_internal__pv__PolarisShareSheetV3relayprovider":true}`,
                'server_timestamps': 'true',
                'doc_id': "9682047925168325"
            });

            let res;

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://www.instagram.com/graphql/query',
                headers: headers,
                data: params
            };

            await axios.request(config)
                .then((response) => {
                    res = response.data.data.xdt_api__v1__feed__user_timeline_graphql_connection
                });

            return { code: 200, status: true, message: 'Success', data: res };

        } catch (err) {
            console.log(err)
            return { code: 500, status: false, message: 'Internal server error' };
        }
    }
}
