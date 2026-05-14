import axios from 'axios'
import dateFormat from "dateformat";

export default {
    "name": "domaininfo",
    "category": "domain",
    "path": "/v1/domain/domaininfo",
    "accept": "application/json",
    "method": "GET",
    "params": [
        {
            "mode": "body",
            "name": "domain",
            "category": "form-data",
            "type": "string",
            "default": "detik.com",
            "required": true
        }
    ],
    "description": "check domaininfo",
    "example": `
const axios = require('axios').default;

const options = {
method: 'GET',
url: 'https://yrizzz.my.id/api/v1/domain/domaininfo',
params: {domain: 'detik.com'},
headers: {Accept: '*/*', 'User-Agent': 'Thunder Client (https://www.thunderclient.com)'}
};

try {
const { data } = await axios.request(options);
console.log(data);
} catch (error) {
console.error(error);
}`,
    code: async (data) => {
        try {
            const { domain } = data;

            let dateDiff = (date) => {

                date = date.split('-');
                var today = new Date();
                var year = today.getFullYear();
                var month = today.getMonth() + 1;
                var day = today.getDate();
                var yy = parseInt(date[0]);
                var mm = parseInt(date[1]);
                var dd = parseInt(date[2]);
                var years, months, days;

                months = month - mm;
                if (day < dd) {
                    months = months - 1;
                }

                years = year - yy;
                if (month * 100 + day < mm * 100 + dd) {
                    years = years - 1;
                    months = months + 12;
                }

                days = Math.floor((today.getTime() - (new Date(yy + years, mm + months - 1, dd)).getTime()) / (24 * 60 * 60 * 1000));

                return {
                    years: years,
                    months: months,
                    days: days
                };

            }
            let res;
            await axios({
                url: 'https://api.dmns.app/domain/' + domain + '?mode=detailed',
                headers: {
                    'Authority': 'api.dmns.app',
                    'Method': 'GET',
                    'Path': '/domain/google.com/dns-records',
                    'Scheme': 'https',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'no-cache',
                    'Origin': 'https://dmns.app',
                    'Pragma': 'no-cache',
                    'Referer': 'https://dmns.app/',
                    'Sec-Ch-Ua': '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
                    'Sec-Ch-Ua-Mobile': '?1',
                    'Sec-Ch-Ua-Platform': '"Android"',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-site',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36'
                }
            }).then(async (response) => {
                let result = response.data;
                dateDiff = dateDiff(result?.dates?.created);
                res = {
                    'registrar': `${result?.registrar?.url ?? '-'}`,
                    'name': `${result?.registrar?.name ?? '-'}`,
                    'whois': `${result?.registrar?.whois ?? '-'}`,
                    'age': `${dateDiff?.years ?? '-'} years ${dateDiff?.months ?? '-'} months ${dateDiff?.days ?? '-'} days`,
                    'created': `${dateFormat(result?.dates?.created, 'dd mmmm yyyy h:MM:ss TT')}`,
                    'updated': `${dateFormat(result?.dates?.updated, 'dd mmmm yyyy h:MM:ss TT')}`,
                    'expired': `${dateFormat(result?.dates?.expiry, 'dd mmmm yyyy h:MM:ss TT')} (${result?.dates?.expiryDays} Days)`
                }
            });
            return { code: 200, status: true, message: 'Success', data: res };
        } catch (err) {
            return { code: 500, status: false, message: 'Internal server error' };
        }
    }
}
