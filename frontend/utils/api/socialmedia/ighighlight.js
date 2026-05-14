import axios from 'axios';
import qs from 'qs';
import { headerInstagram } from '../../endpoint.js';

export default {
    "name": "ighighlight",
    "category": "socialmedia",
    "path": "/v1/socialmedia/ighighlight",
    "accept": "application/json",
    "method": "GET",
    "params": [
        {
            "mode": "body",
            "name": "username",
            "category": "form-data",
            "type": "string",
            "default": "ikn_id",
            "required": true
        }
    ],
    "description": "get highlight instagram",
    "example": `
const axios = require('axios').default;

const options = {
method: 'GET',
url: 'http://yrizzz.my.id/api/v1/socialmedia/ighighlight',
params: {username: 'jokowi'},
...headerInstagram: {Accept: '*/*', 'User-Agent': 'Thunder Client (https://www.thunderclient.com)'}
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

            const get_id = await axios.get(`https://yrizzz.my.id/api/v1/socialmedia/igprofile?username=${username}`);


            let id = get_id.data.data.id;

            const url = "https://www.instagram.com/graphql/query";

            const payload = qs.stringify({
                variables: JSON.stringify({ user_id: id }),
                server_timestamps: "true",
                doc_id: "9814547265267853",
            });

            const headers = {
                ...headerInstagram,
                "x-root-field-name":"xdt_api__v1__user_id__paginated_highlights_tray_connection",
            };


            const res = await axios.post(url, payload, {headers});


            const highlight = res.data.data.highlights.edges.map(val => ({
                id: val.node.id,
                title: val.node.title
            }));

                console.log(highlight);


            let result_highlight = [];
            await Promise.all(
                highlight.map(async val => {
                    const payload = qs.stringify({
                        variables: JSON.stringify({
                            initial_reel_id: val.id,
                            reel_ids: highlight.map(h => h.id),
                            first: 1
                        }),
                        server_timestamps: "true",
                        doc_id: "24249565454702020",
                    });

                    const res = await axios.post(url, payload, {headers});

                    res.data.data.xdt_api__v1__feed__reels_media__connection.edges.forEach(edge => {
                        let items = [];
                        edge.node.items.forEach(item => {
                            const imageCandidates = item?.image_versions2?.candidates || [];
                            const videoCandidates = item?.video_versions || [];

                            const imageUrl = imageCandidates.at(0)?.url || "";
                            const videoUrl = videoCandidates.at(-1)?.url || "";

                            items.push({ image: imageUrl, video: videoUrl });
                        });
                        result_highlight.push({ id: edge.node.id, items });
                    });
                })
            );


            return { code: 200, status: true, message: 'Success', data: result_highlight };

        } catch (err) {
            console.log(err)
            return { code: 500, status: false, message: 'Internal server error' };
        }
    }
}
