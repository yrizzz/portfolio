import axios from "axios";
import FormData from "form-data";

export default {
  name: "facebook",
  category: "downloader",
  path: "/v1/downloader/facebook",
  accept: "application/json",
  method: "GET",
  params: [
    {
      mode: "body",
      name: "data",
      category: "form-data",
      type: "string",
      default: "https://www.facebook.com/share/r/126UN5pbF6x/",
      required: true
    }
  ],
  description: "Downloader Facebook",
  example: `
const axios = require('axios').default;

const options = {
  method: 'GET',
  url: 'http://yrizzz.my.id/api/v1/downloader/facebook',
  params: {
    data: 'https://www.facebook.com/share/r/126UN5pbF6x/'
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

      // ✅ Validasi URL Facebook
    if (
        !data ||
        !/^(https?:\/\/)?([a-z0-9-]+\.)*facebook\.com(\/|$)/i.test(data)
    ) {
        return {
            code: 400,
            status: false,
            message: "URL tidak valid. Harus link Facebook."
        };
    }


    let dt = JSON.stringify({
  "id": "",
  "videoId": data,
  "html": ""
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://apiv2.getfb.net/Facebook/DetectVideoInfo',
  headers: { 
    'referer': 'https://www.getfb.net', 
    'origin': 'https://www.getfb.net', 
    'Content-Type': 'application/json'
  },
  data : dt
};

      const response = await axios.request(config);

      // ✅ Validasi response (jangan paksa response.data.data)
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
        data: response.data.result
      };

    } catch (err) {
      console.error("Facebook downloader error:", err.message || err);
      return {
        code: 500,
        status: false,
        message: "Internal server error",
        error: err.message
      };
    }
  }
};

