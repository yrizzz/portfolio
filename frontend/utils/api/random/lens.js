import axios from "axios";
import { Buffer } from "buffer";
import FormData from "form-data";
import * as cheerio from "cheerio";

export default {
  "name": "lens",
  "category": "random",
  "path": "/v1/random/lens",
  "accept": "application/json",
  "method": "POST",
  "params": [
    {
      "mode": "body",
      "name": "image",
      "category": "form-data",
      "type": "file",
      "default": "-",
      "required": true,
    },
  ],
  "description": "Google Lens",
  "example": `
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
let data = new FormData();
data.append("image", fs.createReadStream("yourpath/image.png"));

let config = {
  method: "post",
  maxBodyLength: Infinity,
  url: "https://yrizzz.my.id/api/v1/random/lens",
  headers: { 
    ...data.getHeaders()
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
`,
  code: async (data) => {

    try {
        const { image } = data;
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
          if (!allowedTypes.includes(image.type)) {
            return {
              code: 400,
              status: false,
              message: "Hanya file gambar yang diperbolehkan (JPEG, PNG, WebP, GIF)",
            };
          }
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
    
        const form = new FormData();
        form.append("encoded_image", buffer, {
          filename: "upload.jpg",
          contentType: "image/jpeg",
        });
    
        const headers = {
          ...form.getHeaders(),
          "user-agent":
            "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36",
          origin: "https://images.google.com",
          referer: "https://images.google.com/",
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
         cookie: "__Secure-BUCKET=CI4B; HSID=AXhrN946_LHPJZcut; SSID=A_Iqbd8qrrp7cGlku; APISID=2rtxpOUdReUM6jS0/Az1p7UO4njkyrk4nE; SAPISID=TBBVinsUM_xzfohW/AotUQfuvTDc6bZ9_U; __Secure-1PAPISID=TBBVinsUM_xzfohW/AotUQfuvTDc6bZ9_U; __Secure-3PAPISID=TBBVinsUM_xzfohW/AotUQfuvTDc6bZ9_U; OSID=g.a0008QiY4wI-yGKc_9Bz7WpkOBiVAEJineSw6QOeg5cz7PQ3UZkyS3Z5r0aqiu9PFhVfGgiaiQACgYKAe8SARASFQHGX2Mib3dYHqaetTbXme8gQ8HbuxoVAUF8yKrhDWaXLfsqANnsD9LY0eoO0076; __Secure-OSID=g.a0008QiY4wI-yGKc_9Bz7WpkOBiVAEJineSw6QOeg5cz7PQ3UZkyn7yQFJXo0w3kDS5KB5b8hgACgYKAXYSARASFQHGX2Milvzq1aRQweST17w6hBAzwBoVAUF8yKqqURP39uuRVA8qg6rFgrR60076; SID=g.a0008giY43kDz6bWY5P-hViY0lb_pZLUP153tbrrPxmyYLSmiVoRlj9ER1Jelq0iKnhMFQ22bgACgYKAYsSARASFQHGX2MitSlSvSU7uZkF3Bi562TFMRoVAUF8yKpucbPZtKT7AMCIRLl10pAF0076; __Secure-1PSID=g.a0008giY43kDz6bWY5P-hViY0lb_pZLUP153tbrrPxmyYLSmiVoR6A9rGhCilH0Fc_LS5TIZIQACgYKAeMSARASFQHGX2Mib0WilIZOEktd3mTfM2AjNBoVAUF8yKq4hWuuLNS9vvZAkHdA7lmc0076; __Secure-3PSID=g.a0008giY43kDz6bWY5P-hViY0lb_pZLUP153tbrrPxmyYLSmiVoR6g6ArVI_R9n6ragXgxOkZwACgYKAW8SARASFQHGX2Min-B9VCRKkqR6npsieCXloBoVAUF8yKq_1WK01JUgzHsUUuFmnmxB0076; AEC=AaJma5v4rZkL4_QL5mRrAuhexyOF7Pg5iK_XGj1iIir1bDJczpByo5KZkg; SEARCH_SAMESITE=CgQI06AB; __Secure-1PSIDTS=sidts-CjEBWhotCQ7ZGHdxm5-3onCX5xv8z9xyoN61VwOP7_U5CKJvp8Fx_pWplyBSoyksO9h3EAA; __Secure-3PSIDTS=sidts-CjEBWhotCQ7ZGHdxm5-3onCX5xv8z9xyoN61VwOP7_U5CKJvp8Fx_pWplyBSoyksO9h3EAA; __Secure-STRP=AEEP7gL7zF5GJRKeE3ImeOFK1-ohcR5BfjeFEIzCpKRG2TKCodGg7B52GhatnsnhgtTQO8_fA6fXdnjrKUN7XlgadNjitCARTw; NID=530=lowd8wLVz3bLJ1EpG6pJpenFDNIceMaJMdMizYMbPXq8PvrIIJ3lTWByfy_0R3_9eBX6Afe4ROGsssGfKcERmaInS4NDPEHLz-g52ypg8JnQacT0pkGmoVJeAM2-YeAm2joY08eqQUpb0h4jIGyic9R-VMiYgi1j7wXyPY6cIiwh3dDETKLJ5q7cQfBN4pbwItsSn3GHIEsUOe18hDW0A3lO_EVBlgKt_1-Ubbzpis8CERs2rPk6C-RqiytWAobgmbwCqscQTxdC0_yE5Q9CBoZP8JpJeNpCw8oiuzKwRbBhmWTDMghKZrKPBYPAVsCOPbxyfczKMqmoMEGD71Otn55un7oi0j88dBR37e1B8AxkH7n1jahe1bSCdkIzaC7L53E3IcgqMtsiFXHeRS_2I2ZGjunhv2rYpAy8r9rXa4ZfWshQjBuZJuwazPA--0YWHEGSdkHFpWHSqaLQaB3_2pC9IO_IuhdGWpBTowx53Wz-WPqEjfAoundrVlsGpfQNohUoEJLAUC9S-_bW09pyg6BdIpaajnOVjPRcKWuBO-4cQElstP7rK2ZMLH_sXu-AzhNk5FkLntZ_-ztbp2q8o8VsqyGgLP3xTPpP_FFVV8dzNFawP56u_pKADgD5NHCEDKoepzyLUfkr6mPJqf-gh-7tNOM0i6U4TR0wH4ftbtjhAjHH1fDpa__Q0B3WOyKrPFAF-HEFzHV_gHSi1E0SJna10JikNf3XEnNuu6lVzBa8m0-5r-ponSa-4FdCY_IjuwjdKccFKLvr68iJPmHlV7ofgJ_7VWFaIQP9CMDaZCMQ44cWtPhly-mR8vA_Y79OaYMsfZpQR2Kzk3IvnnfPQgRg6dZAj3-6iNxmxUFEpyzLErEop6BIIogZfO4Fwas3wlBcnyC7Bl7pMxOaSWSmQYtA3oHwq6u6WIfPkUNHEMac7FL7tfwH6iqmHsJpN5mUZG_mtDM-KqSaRLcdPUUDX5Z3ZZ0_pKzJfiIAzH6mgtzXmoPBjJVEYN8LEfbiSSxR7e8YOgImX5CNQqUnUDJeKMpPEpnUn7GPYknqKq-c_VjrKRDxJmxVeAvsYaFlMrDWs-mrwJW4ewRQ4gvYNDBzhiTa7q10BEUrpYSkgA1s2W8icd11AOzfJ7ntwjzeOze-9LWbqsFzozFWrLJyVUjZHG5bzeygnQVjeP1UWCLhgtl7wJq-2T69f3x56noKVcp-irWiLZkvsEH7NFV3AouMH9wy3FXRYlWmxayAWjcfXXu-pkzrlrBcldYIclN-5ELYXJJ-WqGzw7JyRFYCgoaFbgTmhGEIcx2Eej2zk6GUr4gR5Dvo-K6Ug9REYqvwMK98Ib92qyxEg-bw7DKjQy4o6YJPQIVhv9moGWYX44LYtrU4CCgtiWDA5FXP6TCw7UqvJdo5BgAU7BBoW3ZTUIrCxxu-xYaqzPlEUvPQH1eVzG43-RmBFkT4NLGKxjwUtPXrL7IOF2QD7AjVQS_vo7KNBsr6QyCyYCZH9irNs9_C9vC-fQ5q93M2YxNRoFCK7f-G0Fe_EFtzZTyLie-fvtSZ5jz8DPRoh8y4XUUMdkSKScsaSe0LVN6lvhJrMkb1XZIa-sgz2HkNbxJYjpxmKUHrWBhpiqivY0TDNic1UYLyhQHO55TlmCjOSBaMgNJdvUjeF1cEP2Jvihr9_KMEKn1qa_6q_9_g9dRXUmQTZuaxNFGYvHS_xqEMxef6Xe7tbmQd6vQp9HqIvxyCZcE4NVTca5ZYgDX2684HDax6y4Qk_MOSWDRyUFUfZRfKUKP4odPakFNbxxo9VvHtcO0JaNvQ0X8C5QerYd-tWkxSJ5fipG3ZYLHZcNOXfSN6AFcZcsHJgMvHuoJqtSZN9FvHojrXISfY1On-kWNqNb4LBS1BrEgmLjq8ltVXExzuTYmyYgtzo9lpSTKIoH7dtzKvUok4N9-0Fjc05gAtUOYgQwvb7eSVI-aaz7BI-pQzkpr_B00ssrg18Uw6cOBH53BV1tzymh05WOuXGLirnQrAcwWwKx9gbW5Fau06b_84-8RYZJbic6tbNA5OPMh_IU21YZdNgy3gc0rBrwf_mFq-za3O4sAiNXyrD15mNIRhLpX72CT5p01vv0zI8t7i5l9BKpN_S6xxvd0607M_C1Y06-FnHMAoYL8XFWnTfyumZsHckOpzaSRBhwoFoHuKVgQPYuc2h7Sil_hPZ9q9NJOaAJ0CtXrIGrMacVGYYLVhPfvQ5OtiI3R--cei3LV-cZz3YYGSWC7fogVqxv_Ck5_bvD7Kj_9_wZri3B8W-cEPKNmDdmaAAQPFAkpsoY2oQVvrz5gqj3kf5aBOjLBouDlB6eoVj5jtVkgtPyWMY2odOQGW5JNJ4OlQ_IJ_TLSHGiyfyLPxek9wg96dPQo8XL2w7ydSWFkOkZgFcpihXY7_oryKko9LRAfY7SbarOMda7DK_Rw9DdA9MGqwUzh6PVjx5cSemRsPm2NgUk3kRkImN268T-cwnY22iP8CI1tWhTgagmro2p_vZOJKJFWBO7FQoVY0Z7_QNXTB76j6LmLmYh0wN96kucX1hbENbbYIHGLRBSsLX5WEax-BmXgB1Q0FSFRzmdL5yXuI_IDGFFLkRGx1Cls58ZBh59yE8rrNbctxhyPTP3Oc1j2MHawwKVyj2kTXpEuOTiOeV8-kFQZtUHaL4SkCedafUjyVnsQaMeEQVeahPp8W-PAr_r-eDnXeE6jqETBUk5HFFbHQhWxH92NUPMKgWPoc--f7U-ytNfRfbjDf1JpHzR-ARHHoQ8RjfuYVflRlHNChMefNqtSfLxfmdwxiRWDB3We8exE4IjhPcZrdGVnpWvtTKSuIHffX5F_ZucASSlVp0mZHdembAdpB11pcj56f9tsMTz9cSsxaZLGupqZ8gfJoRC-lQ2Jp-dXNbSd_VJDH6GnL_BaKuy_TKaNoM9wP0uDubHeoNzM2NoQiDjenLQpbkaKzvIk9Ax_lCD8fldjsyIdeIzlpcjEW66x0WOeg94KAIRtT8N6PBMdaH2rraJmNYBRP0TyoJ9cD2cX5_KRoZscYj3dR45eMjCxck2ohZVauu6qV8GOHRYznf9yruAnwwYXps7nZZgkdp7Big9rhT6ZYxuwekykhngwl17BpbbGfxQgWK09UqJZc6nywwNdX11maS3ZolfQ8gtQDORgGklb6w85fJwEMoSRu3QeumVsQ0yzNIIzTfLd9uqhJME34SLIxZOJeKIwGmL0Gd0YhbdTEUqj15XpDojgt0LmaZzJp4dKkyp83FkK9zBWPzAx01I_MCTevhM8tf9T0SZqSWLebx17sznupAajI9AzX96m0CK8NmQsc6GjmDbc6ut0pgJ8HoIQuudcfKgLAiyCRLuDZo2hda0b1IDgbdL4DV3mLlty2W7ZJFxVvaiVEa4x69-4IFb0bdDxkYPJ5qYRCysZ7te-e9z4GR2KT5La4Hpgca6wOOmVhZqmecdWqSiV_aSZEQgc1GLPtmOsDXICsVxjDhHX-Q2xB1j0O-oIM-HiJNK3oaZjc9k-y9rpFk8e1Nn-6j-3ZwhS3EF1K6drimA; SIDCC=AKEyXzX8ESPULro5W7tQyiJTiI7rIq11JNpiooX6KFmRZlQclhF3-BxJ5ddJYckK9cEmDN-3eZY; __Secure-1PSIDCC=AKEyXzV2tkshTmL3AFCoJpuHMOqLh5f0BgN-rCcVvVU2CUJIHF8un0aTMoM2zs7VmJuvo9MPEHI; __Secure-3PSIDCC=AKEyXzWT3ueM6aR366hWFS8a3wE_xg3dxktGiqW3cTjdV2gJ2fZeqv1-N1ZWHLQQidQvKNmOQ70"
        };
      const res = await axios.post(
         "https://lens.google.com/v3/upload?ep=gisbubb&hl=en-ID",
        form,
        { headers, maxRedirects: 0, validateStatus: null }
      );

      if (res.status === 303 && res.headers.location) {
            const redirectUrl = res.headers.location;
            console.log("Redirect to:", redirectUrl);


            let result = [];
            const page = await axios.get(redirectUrl, { headers });
            const $ = cheerio.load(page.data);

            $("div[aria-label]").each((i, el) => {
                const label = $(el).attr("aria-label");
                if (!['Search settings', 'Main menu', 'Delete visually searched image'].includes(label)) {

                    const href = $(el).closest("div").find("a").attr("href");

                    let imgurl = null;
                    let ref = null;
                    if (href) {
                        const params = new URLSearchParams(href.split("?")[1]);
                        ref = params.get("imgrefurl");
                        imgurl = params.get("imgurl");
                    }

                    result.push({ label,ref, imgurl });
                }
            });

             return {
                code: 200,
                status: true,
                message: 'Success',
                data: result
            };
    
      } else {
        return {
          code: 500,
          status: false,
          message: "Unexpected response",
        };
      }
    } catch (err) {
        console.log(err)
      return {
        code: 500,
        status: false,
        message: "Internal Server Error",
      };
    }
  },
};

