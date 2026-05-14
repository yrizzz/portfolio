import axios from 'axios';
export default {
	"name": "checkUsernameMobileLegends",
	"category": "game",
	"path": "/v1/game/checkUsernameMobileLegends",
	"accept": "application/json",
	"method": "GET",
	"params": [
		{
			"mode": "body",
			"name": "gameId",
			"category": "form-data",
			"type": "number",
			"default": "",
			"required": true
		},
		{
			"mode": "body",
			"name": "zoneId",
			"category": "form-data",
			"type": "number",
			"default": "",
			"required": true
		}
	],
	"description": "check username Mobile Legends",
	"example": `
const axios = require('axios').default;

const options = {
method: 'GET',
url: 'https://yrizzz.my.id/api/v1/game/checkUsernameMobileLegends',
params: {gameId: xxxxxxxx,zoneId: xxxx},
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
			const { gameId, zoneId } = params;

			let data = JSON.stringify({
				"code": "MOBILE_LEGENDS",
				"data": {
					"userId": gameId,
					"zoneId": zoneId
				}
			});

			let options = {
				method: 'post',
				maxBodyLength: Infinity,
				url: 'https://gopay.co.id/games/v1/order/user-account',
				headers: {
					'Content-Type': 'application/json'
				},
				data: data
			};


			try {
				const { data } = await axios.request(options);
				if (data?.message == 'Success') {
					return {
						code: 200, status: true, message: 'Success', data: { game: 'Mobile Legends', gameId: gameId, zoneId: zoneId, username: data?.data?.username, country: data?.data?.countryOrigin }
					};
				} else {
					return { code: 500, status: false, message: 'Internal server error' };
				}

			} catch (error) {
				return { code: 500, status: false, message: 'Internal server error' };
			}

		} catch (err) {
			return { code: 500, status: false, message: 'Internal server error' };

		}
	}

}
