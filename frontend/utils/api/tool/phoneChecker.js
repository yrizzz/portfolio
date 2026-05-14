import axios from 'axios';

export default {
    name: "phoneChecker",
    category: "tool",
    path: "/v1/tool/phoneChecker",
    accept: "application/json",
    method: "GET",
    params: [
        {
            mode: "body",
            name: "phone",
            category: "form-data",
            type: "string",
            default: "08xxx",
            required: true
        }
    ],
    description: "Phone number checker",
    example: `
const axios = require('axios').default;

const options = {
    method: 'GET',
    url: 'https://yrizzz.my.id/api/v1/tool/phoneChecker',
    params: { phone: '08xxxxxx' },
    headers: { Accept: '*/*', 'User-Agent': 'Thunder Client (https://www.thunderclient.com)' }
};

try {
    const { data } = await axios.request(options);
    console.log(data);
} catch (error) {
    console.error(error);
}
`,
    code: async (params) => {
        try {
            const { phone } = params;

            if (!phone.startsWith('0')) {
                return { code: 200, status: false, message: 'Please input valid number' };
            }

            let results = [];

            // === TRUECALLER ===
            try {
                const truecallerUrl = `https://asia-south1-truecaller-web.cloudfunctions.net/webapi/noneu/search/v2?q=${phone}&countryCode=id&type=44`;
                const truecallerHeaders = {
                    'Authorization': 'Bearer <your-token>',
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': '*/*',
                    'Origin': 'https://www.truecaller.com',
                    'Referer': 'https://www.truecaller.com/',
                };

                const truecallerResponse = await axios.get(truecallerUrl, { headers: truecallerHeaders });

                if (truecallerResponse?.data?.phones?.length) {
                    const data = {
                        name: truecallerResponse.data.name || 'No name',
                        phone: truecallerResponse.data.phones[0]?.e164Format || phone,
                        carrier: truecallerResponse.data.phones[0]?.carrier || '-',
                        countryCode: truecallerResponse.data.phones[0]?.countryCode || '-',
                        score: truecallerResponse.data.score,
                        access: truecallerResponse.data.access,
                    };
                    results.push(data);
                }
            } catch (err) {
                console.warn('server1 error:', err.message);
            }

            // === TRACELO ===
            try {
                const traceloResponse = await fetch("https://api.tracelo.com/api/locate_phone_info/ipqs", {
                    method: "POST",
                    headers: {
                        "Origin": "https://tracelo.com",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "phone_number_prefix": "62",
                        "phone_number": phone.substr(1)
                    })
                });

                const traceloResult = await traceloResponse.json();
                if (traceloResult?.data) {
                    results.push({ source: 'server2', ...traceloResult.data });
                }
            } catch (err) {
                console.warn('server2 error:', err.message);
            }

            // === RETURN ALL AVAILABLE RESULTS ===
            if (results.length === 0) {
                return {
                    code: 404,
                    status: false,
                    message: "No valid result"
                };
            }

            return {
                code: 200,
                status: true,
                message: "Success",
                data: results
            };

        } catch (error) {
            console.error('Unhandled error:', error.message || error);
            return {
                code: 500,
                status: false,
                message: 'Internal server error',
                error: error.message || error
            };
        }
    }
}

