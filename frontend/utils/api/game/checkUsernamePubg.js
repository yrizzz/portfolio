import axios from 'axios';
export default {
	"name": "checkUsernamePubg",
	"category": "game",
	"path": "/v1/game/checkUsernamePubg",
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
		}
	],
	"description": "check username Pubg Mobile",
	"example": `
const axios = require('axios').default;

const options = {
method: 'GET',
url: 'https://yrizzz.my.id/api/v1/game/checkUsernamePubg',
params: {gameId: xxxxxxxx},
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
			const { gameId } = params;

			const options = {
				method: 'GET',
				url: 'https://gopay.co.id/games/v1/order/prepare/PUBG_ID?userId='+gameId+'&zoneId=',
				headers: {
					Accept: '*/*',
					'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
					'Content-Type': 'application/json'
				}
			};


			try {
				const { data } = await axios.request(options);
				if (data?.message == 'Success') {
					return {
						code: 200,status: true,message: 'Success',data: {game:'Pubg Mobile',gameId: gameId,username: data?.data}
					};
				} else {
					return { code: 500,status: false,message: 'Internal server error' };
				}

			} catch (error) {
				return { code: 500,status: false,message: 'Internal server error' };
			}


		} catch (err) {
			return { code: 500,status: false,message: 'Internal server error' };

		}
	}

}
