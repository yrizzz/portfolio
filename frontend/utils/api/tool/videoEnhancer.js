let axios, FormData, HttpsProxyAgent, cheerio;

async function loadDependencies() {
  if (typeof window === 'undefined') {
    const axiosModule = await import("axios");
    const formDataModule = await import("form-data");
    const proxyAgentModule = await import("https-proxy-agent");
    const cheerioModule = await import("cheerio");

    axios = axiosModule.default;
    FormData = formDataModule.default;
    HttpsProxyAgent = proxyAgentModule.HttpsProxyAgent;
    cheerio = cheerioModule;
  }
}

await loadDependencies();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomProductSerial() {
  const chars = "abcdef0123456789";
  let serial = "";
  for (let i = 0; i < 32; i++) {
    serial += chars[Math.floor(Math.random() * chars.length)];
  }
  return serial;
}

async function fetchProxies() {
  try {
    const res = await axios.get("https://free-proxy-list.net/");
    const $ = cheerio.load(res.data);
    let proxies = [];
    $("tbody tr").each((_, el) => {
      const tds = $(el).find("td");
      const ip = $(tds[0]).text().trim();
      const port = $(tds[1]).text().trim();
      const https = $(tds[6]).text().trim();
      if (ip && https === "yes") proxies.push(`http://${ip}:${port}`);
    });
    return proxies;
  } catch (err) {
    return [];
  }
}

async function getUserInfo(proxy) {
  const proxyAgent = new HttpsProxyAgent(proxy);
  return axios.post(
    "https://api.unblurimage.ai/api/pai-login/v1/user/get-userinfo",
    {},
    {
      timeout: 3000,
      httpsAgent: proxyAgent,
      headers: {
        accept: "*/*",
        origin: "https://unblurimage.ai",
        referer: "https://unblurimage.ai/",
        "product-serial": randomProductSerial(),
        "user-agent":
          "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36",
      },
    }
  );
}

async function findGoodProxy(proxies) {
  for (let i = 0; i < proxies.length; i++) {
    const proxy = proxies[i];
    try {
      const res = await getUserInfo(proxy);
      if (res.data?.result?.is_video_enhancer_free) {
        return proxy;
      }
    } catch (_) {}
  }
  return null;
}

async function withProxy(proxyList, fn) {
  for (const proxy of proxyList) {
    try {
      const agent = new HttpsProxyAgent(proxy);
      return await fn(agent, proxy);
    } catch (_) {}
  }
  throw new Error("Semua proxy gagal dipakai");
}

export default {
  name: "videoEnhancer",
  category: "tool",
  path: "/v1/tool/videoEnhancer",
  accept: "multipart/form-data",
  method: "POST",
  params: [
    {
      mode: "body",
      name: "video",
      category: "form-data",
      type: "file",
      required: true,
    },
  ],
  description: "AI Video Enhancer - file usahakan kurang dari 5MB",
  example: `
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

(async () => {
  const form = new FormData();
  form.append("video", fs.createReadStream("sample.mp4"));

  const res = await axios.post(
    "https://yrizzz.my.id/api/v1/tool/videoEnhancer",
    form,
    {
      headers: form.getHeaders(),
      timeout: 300000,
      maxBodyLength: Infinity
    }
  );

  console.log(res.data);
})();
`,
  code: async (data) => {
    try {
      const { video } = data;
      let proxies = await fetchProxies();
      if (!proxies.length) {
        return { code: 500, status: false, message: "Tidak ada proxy tersedia" };
      }

      const goodProxy = await findGoodProxy(proxies);
      if (!goodProxy) {
        return { code: 500, status: false, message: "Tidak ada proxy enhancer FREE" };
      }

      const proxyChain = [goodProxy, ...proxies];

      const uploadForm = new FormData();
      uploadForm.append("video_file_name", video.name || "video.mp4");

      const uploadRes = await withProxy(proxyChain, (agent) =>
        axios.post(
          "https://api.unblurimage.ai/api/upscaler/v1/ai-video-enhancer/upload-video",
          uploadForm,
          {
            headers: uploadForm.getHeaders(),
            httpsAgent: agent,
            timeout: 15000,
            maxBodyLength: Infinity,
          }
        )
      );

      const { object_name, url: signedUrl } = uploadRes.data?.result || {};
      if (!object_name || !signedUrl) {
        throw new Error("Gagal dapatkan signed URL");
      }

      const uploadData = video.path
        ? video // Assume readable stream or buffer from Remix
        : Buffer.from(await video.arrayBuffer());

      await axios.put(signedUrl, uploadData, {
        headers: {
          "Content-Type": video.type || "video/mp4",
        },
        timeout: 120000,
        maxBodyLength: Infinity,
      });

      const jobForm = new FormData();
      jobForm.append("original_video_file", `https://cdn.unblurimage.ai/${object_name}`);
      jobForm.append("resolution", "2k");
      jobForm.append("is_preview", "false");

      const jobRes = await withProxy(proxyChain, (agent) =>
        axios.post(
          "https://api.unblurimage.ai/api/upscaler/v2/ai-video-enhancer/create-job",
          jobForm,
          {
            headers: {
              ...jobForm.getHeaders(),
              accept: "*/*",
              origin: "https://unblurimage.ai",
              referer: "https://unblurimage.ai/",
              "user-agent":
                "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36",
              "product-serial": randomProductSerial(),
            },
            httpsAgent: agent,
            timeout: 15000,
          }
        )
      );

      const jobId = jobRes.data?.result?.job_id;
      if (!jobId) throw new Error("Gagal dapat job_id");

      const timeoutMs = 15 * 60 * 1000;
      const start = Date.now();
      let outputUrl = null;

      while (Date.now() - start < timeoutMs) {
        await sleep(2000);

        const statusRes = await axios.get(
          `https://api.unblurimage.ai/api/upscaler/v2/ai-video-enhancer/get-job/${jobId}`,
          {
            timeout: 10000,
            headers: {
              accept: "*/*",
              origin: "https://unblurimage.ai",
              referer: "https://unblurimage.ai/",
              "user-agent":
                "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36",
              "product-serial": randomProductSerial(),
            },
          }
        );

        const { code, result } = statusRes.data || {};
        if (code === 100000 && result?.output_url) {
          outputUrl = result.output_url;
          break;
        }

        if (code === 300015)
          return { code: 300015, status: false, message: "Ukuran video terlalu besar." };

        if (code && ![100000, 300010, 300015].includes(code))
          return { code, status: false, message: "Job gagal atau ditolak" };
      }

      if (!outputUrl)
        return { code: 504, status: false, message: "Job timeout (15 menit)" };

      return { code: 200, status: true, message: "Success", file_url: outputUrl };
    } catch (err) {
      console.error("❌ Error enhancer:", err.message || err);
      return { code: 500, status: false, message: "Internal server error" };
    }
  },
};

