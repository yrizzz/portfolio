import axios from 'axios';
export default {
	"name": "checkUsernameAov",
	"category": "game",
	"path": "/v1/game/checkUsernameAov",
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
	"description": "check username Aov",
	"example": `
const axios = require('axios').default;

const options = {
method: 'GET',
url: 'https://yrizzz.my.id/api/v1/game/checkUsernameAov',
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
				method: 'POST',
				url: 'https://api.duniagames.co.id/api/transaction/v1/top-up/inquiry/store',
				headers: {
					Accept: '*/*',
					'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
					'Content-Type': 'application/json'
				},
				data: {
					productId: 4,
					itemId: 18,
					product_ref: 'REG',
					product_ref_denom: 'REG',
					catalogId: 73,
					paymentId: 6177,
					gameId: gameId,
					campaignUrl: ''
				}
			};


			try {
				const { data } = await axios.request(options);
				if (data?.status?.message == 'success') {
					return {
						code: 200,status: true,message: 'Success',data: {game:'Aov',gameId: gameId,username: data?.data?.userNameGame}
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
