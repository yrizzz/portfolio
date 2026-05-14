let HttpsProxyAgent;

export async function getHttpsProxyAgent() {
  if (!HttpsProxyAgent) {
    const mod = await import("https-proxy-agent");
    HttpsProxyAgent = mod.HttpsProxyAgent || mod.default;
  }
  return HttpsProxyAgent;
}

