import axios from 'axios';
export default {
	"name": "checkMyRepublic",
	"category": "random",
	"path": "/v1/random/checkMyRepublic",
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
	"description": "check MyRepublic",
	"example": `
const axios = require('axios').default;

const options = {
method: 'GET',
url: 'https://yrizzz.my.id/api/v1/random/checkMyRepublic',
params: {data: xxxxxxxx},
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
				url: 'https://solopayments.com/api/core/cek_tagihan',
				params: {
					apikey: '580a72572819db759bd9012b0cc24501',
					id_layanan: '149',
					no_pelanggan: data
				},
				headers: { Accept: '*/*','User-Agent': 'Thunder Client (https://www.thunderclient.com)' }
			};

			try {
				const response = await axios.request(options);
				let data = response.data;
				if (data.status != 'false') {
					return {
						code: 200,status: true,message: 'Success',note: 'data tidak bersifat final, dapat berubah setiap saat',data: data.data
					};
				}else{
					return { code: 500,status: false,message: data?.pesan };
				}

			} catch (error) {
				return { code: 500,status: false,message: 'Internal server error' };
			}


		} catch (err) {
			return { code: 500,status: false,message: 'Internal server error' };

		}
	}

}
