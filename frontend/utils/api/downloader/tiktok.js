import axios from "axios";
import FormData from "form-data";

export default {
    name: "tiktok",
    category: "downloader",
    path: "/v1/downloader/tiktok",
    accept: "application/json",
    method: "GET",
    params: [
        {
            mode: "body",
            name: "data",
            category: "form-data",
            type: "string",
            default:
                "https://www.tiktok.com/@idealis92/video/7483285304506338566?is_from_webapp=1&sender_device=pc",
            required: true
        }
    ],
    description: "Downloader TikTok",
    example: `
const axios = require('axios').default;

const options = {
  method: 'GET',
  url: 'http://yrizzz.my.id/api/v1/downloader/tiktok',
  params: {
    data: 'https://www.tiktok.com/@idealis92/video/7483285304506338566?is_from_webapp=1&sender_device=pc'
  }
};

(async () => {
  try {
    const { data } = await axios.request(options);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
})();
    `,
    code: async (params) => {
        try {
            const { data } = params;

            // ✅ Validasi URL TikTok
           if (!data || !/^(https?:\/\/)?([a-z0-9-]+\.)*tiktok\.com(\/|$)/i.test(data)) {
                return {
                    code: 400,
                    status: false,
                    message: "URL tidak valid. Harus link TikTok."
                };
            }

         let config = {
              method: 'get',
              maxBodyLength: Infinity,
              url: 'https://www.tikwm.com/api/?url='+data,
              headers: { }
            };


            const response = await axios.request(config);

            // ✅ Validasi response
            if (!response.data) {
                return {
                    code: 502,
                    status: false,
                    message: "Response gagal"
                };
            }

            return {
                code: 200,
                status: true,
                message: "Success",
                data: response.data.data
            };

        } catch (err) {
            console.error("Downloader error:", err.message || err);
            return {
                code: 500,
                status: false,
                message: "Internal server error",
                error: err.message
            };
        }
    }
};

