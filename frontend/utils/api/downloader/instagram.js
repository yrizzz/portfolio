import axios from 'axios';
import { headerInstagram } from '../../endpoint.js';
import qs from 'qs'

export default {
	"name": "instagram",
	"category": "downloader",
	"path": "/v1/downloader/instagram",
	"accept": "application/json",
	"method": "GET",
	"params": [
		{
			"mode": "body",
			"name": "data",
			"category": "form-data",
			"type": "string",
			"default": "https://www.instagram.com/p/DHsoEwOJnYh/",
			"required": true
		}
	],
	"description": "downloader instagram post",
	"example": `
const axios = require('axios').default;

const options = {
method: 'GET',
url: 'http://yrizzz.my.id/api/v1/downloader/instagram',
params: {data: 'https://www.instagram.com/p/DHsoEwOJnYh/'},
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
			let res;

			let link = data.match(/https:\/\/www\.instagram\.com\/(?:p|reel)\/(.*)\//)
				// let dt = null;
			let param = qs.stringify({
				'variables': `{"shortcode":"${link[1]}","fetch_tagged_user_count":null,"hoisted_comment_id":null,"hoisted_reply_id":null}`,
				'server_timestamps': 'true',
				'doc_id': '8845758582119845'
			});

			let config = {
				method: 'post',
				maxBodyLength: Infinity,
				url: 'https://www.instagram.com/graphql/query',
				data: param,
				headers:{...headerInstagram}
			};

			await axios.request(config)
				.then((response) => {
					res = response.data.data
				});


			return await { code: 200,status: true,message: 'Success',data: res };
			// if (typeof link[0] === 'undefined' || link[0] === null) {
			// 	dt = JSON.stringify({
			// 		"username": link[0] ?? link
			// 	});
			// } else {
			// 	dt = JSON.stringify({
			// 		"url": link[0] ?? link
			// 	});
			// }

			// const post = await axios.post('https://free-tools-api.vercel.app/api/instagram-downloader', dt, {
			// 	headers: {
			// 		'Content-Type': 'application/json'
			// 	}
			// })
			// if (!post.data) {
			// 	return false;
			// }

			// return await { code: 200, status: true, message: 'Success', data: post.data };

		} catch (err) {
			console.log(err)
			return { code: 500, status: false, message: 'Internal server error' };

		}
	}

}
