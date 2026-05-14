import axios from 'axios';
export default {
	"name": "checkPlnPrabayar",
	"category": "random",
	"path": "/v1/random/checkPlnPrabayar",
	"accept": "application/json",
	"method": "GET",
	"params": [
		{
			"mode": "body",
			"name": "data",
			"category": "form-data",
			"type": "number",
			"default": "",
			"required": true
		}
	],
	"description": "inquiry Pln Prabayar",
	"example": `
const axios = require('axios').default;

const options = {
method: 'GET',
url: 'https://yrizzz.my.id/api/v1/random/checkPlnPrabayar',
params: {data: 520xxxxxxxx},
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

			const options = {
				method: 'POST',
				url: 'https://solopayments.com/api/core/cek_id_pln',
				headers: {
					Accept: '*/*',
					'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
					'content-type': 'multipart/form-data; boundary=---011000010111000001101001'
				},
				data: `-----011000010111000001101001\r\nContent-Disposition: form-data; name="no_pelanggan"\r\n\r\n${data}\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name="apikey"\r\n\r\n580a72572819db759bd9012b0cc24501\r\n-----011000010111000001101001--\r\n`
			};

			try {
				const { data } = await axios.request(options);
				let result = data.data;
				console.log(result)
				return {
					code: 200,status: true,message: 'Success',data:result }
			} catch (error) {
				return false;
			}


		} catch (err) {
			return { code: 500,status: false,message: 'Internal server error' };

		}
	}

}
