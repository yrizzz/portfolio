import axios from 'axios';
export default {
	"name": "ttprofile",
	"category": "socialmedia",
	"path": "/v1/socialmedia/ttprofile",
	"accept": "application/json",
	"method": "GET",
	"params": [
		{
			"mode": "body",
			"name": "username",
			"category": "form-data",
			"type": "string",
			"default": "undefined",
			"required": true
		}
	],
	"description": "get profile tiktok",
	"example": `
const axios = require('axios').default;

const options = {
method: 'GET',
url: 'http://yrizzz.my.id/api/v1/socialmedia/ttprofile',
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
			let headers = {
				'cookie': 'tt_csrf_token=iGWVBSiP-GTRkOxqGGbbIipZ2Ee_le7qy1Nc; tt_chain_token=x2osHC40+6PbysLC/C/syA==; perf_feed_cache={%22expireTimestamp%22:1743771600000%2C%22itemIds%22:[%227473887245267700998%22%2C%227477894394520079671%22%2C%227480496945899867398%22]}; passport_csrf_token=fa1e24b9c62a08748ea315c8d2081921; passport_csrf_token_default=fa1e24b9c62a08748ea315c8d2081921; s_v_web_id=verify_m8zxyahx_OI9ZI1qX_Si9K_4utf_9ouK_D88XiFrgWeRi; multi_sids=7488599740213543943%3A787640cf3b351bad53fcfaedb0785841; cmpl_token=AgQQAPOgF-RO0rfSN24csB0-_Yyu6OGd_5ArYNjzbQ; passport_auth_status=8ef96b57fb534b97040080b9d85ba8ec%2C; passport_auth_status_ss=8ef96b57fb534b97040080b9d85ba8ec%2C; uid_tt=f7fc932f26e90ab0b2d99424f25c42eaf968b7cafe0eadd4d0ee7ad30f6632ce; uid_tt_ss=f7fc932f26e90ab0b2d99424f25c42eaf968b7cafe0eadd4d0ee7ad30f6632ce; sid_tt=787640cf3b351bad53fcfaedb0785841; sessionid=787640cf3b351bad53fcfaedb0785841; sessionid_ss=787640cf3b351bad53fcfaedb0785841; store-idc=alisg; store-country-code=id; store-country-code-src=uid; tt-target-idc=alisg; tt-target-idc-sign=oYiuVTHuJnAAGIXVTESJM11DpL-4WREG2rSVBBbKDcAa9hjoeLQO7vns6JBklwdiUatBdK7jy--Ok949Ha6JW8a8cWczIS536-ylqjq45xtD4ZVhPvAfQIkM6VbU6ypsqznQCN3cKCVyv1eqVCyz__F41FP4C1-QPO1UUBPGRvriC28lP00VDIfg9q1O4l6AfrPgznpKttodmd2qfJEbsntLKfH1Wd8l6hFOvZGkcyuS1PnIdYF54V-9If4ViMDPomQYUt9u5o9niTLvdfNovI8F8yKj_ombQIMb8r4UOYv-5BZNKiOcEinf-edfZ7ciq6rFQi6dC2mkgYOmRbzpnuUV7jIPC6XnEaaCAeNeK9nd5YpW531SlzvI4YfPtqeSQzMj4FoKd0yl-jCLmWZtSyq3cXXCmvq4fkNnprgSe6w2W7g0dQDYK_7C07lP2nZCNsagnIR2t4abC1xBdoZiw5j360HBH_ZL4LGT5c3-krt6GKEPoixPhll4WZI7C2AJ; last_login_method=google; tiktok_webapp_theme=dark; tiktok_webapp_theme_source=auto; store-country-sign=MEIEDDXsHp31BIVcH2Z49QQgBxi_8U-CQIBe5gxxj3XAscAHX4bkOvI1L0Q00CeJ0RMEEIhO2EXKYiUkDzP7TaXeGy4; passport_fe_beating_status=true; ttwid=1%7CxN2AgCM6pNiYh80sFeKHNFv__BZeXHP65O34o9TkAjE%7C1743599632%7C7241725a4877027a9956db5b273b34e0df608a5596f4ee62ace137c271fe2b85; sid_guard=787640cf3b351bad53fcfaedb0785841%7C1743599632%7C15551989%7CMon%2C+29-Sep-2025+13%3A13%3A41+GMT; sid_ucp_v1=1.0.0-KDgzZDBlMDg0NDRkNTQ5NmE3OTc1ZTEyZWFmNDE5ZTkxMWI1Y2Y2MGQKGQiHiIukmbm29mcQkPC0vwYYsws4CEASSAQQAxoCbXkiIDc4NzY0MGNmM2IzNTFiYWQ1M2ZjZmFlZGIwNzg1ODQx; ssid_ucp_v1=1.0.0-KDgzZDBlMDg0NDRkNTQ5NmE3OTc1ZTEyZWFmNDE5ZTkxMWI1Y2Y2MGQKGQiHiIukmbm29mcQkPC0vwYYsws4CEASSAQQAxoCbXkiIDc4NzY0MGNmM2IzNTFiYWQ1M2ZjZmFlZGIwNzg1ODQx; odin_tt=4effa32c8b238faa2770b9415d78af07bf755b327db5cc62604d1595f6f46b113b5cf9416c4ca808d5bc5dde4441b30a1b0085cffbee6c110f30bae75b4d58efa95709d6221c1e137d55075350a22572; msToken=AIU6K9wW0Bm3Q8jwdENI2QeWb6A8AfusB76L5Z_5zibkAROucgKyFCas2xb6kpP8Nvy9H6M7oK-ZaqMsS1r-BP4IiU_b2g20pdw0NG94-J4yYBUd9jS2axrNna8CzVu936xRFi_e-CVVUg==; msToken=GRBQU0BUWFr_F2x6jTLyiZ751zhbpYW9gHWvMnbd_a5Vv6PJ8a1zIF61Dh91KOLAup10puyvq0GqEQ7i77ySsXRnHBAbInpdKvbbKNBY94EwcLAIqYpQC2SyaJGgAU43v5BjiZWYGU01rA==; msToken=U_GcPs4wOS_KoCXf0R-B7kmgWUhGOj6Vwi_O-UBF1ADneKnx03S2AZmT2wOorZgLZfV9a-2B6GRDWF0PCwDeKMdxsaEjiSm4b8p58LuUybbE3GvLrS4JBnmWvV_myPNHrnKGMvi0bYNSkw==; tt_chain_token=x2osHC40+6PbysLC/C/syA==',
				'referer': 'https://www.tiktok.com',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
			};
			console.log(username)
			const get = await axios.get('https://www.tiktok.com/@' + username,{ headers: (headers) });
			const html = get.data.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/);

			const match = html[1];
			let res;

			res = JSON.parse((match))
			res = res['__DEFAULT_SCOPE__']['webapp.user-detail']

			return { code: 200,status: true,message: 'Success',data: res };


		} catch (err) {
			console.log(err);
			return { code: 500,status: false,message: 'Internal server error' };
		}
	}
}
