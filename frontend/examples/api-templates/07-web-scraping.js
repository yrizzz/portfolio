/**
 * 📌 CONTOH 7: WEB SCRAPING
 * 
 * Use Case: Extract metadata from any website
 * Method: GET
 * 
 * Test:
 * GET /api/execute/v1/tool/web-metadata?url=https://example.com
 */

export default {
  name: "webMetadata",
  category: "tool",
  path: "/v1/tool/web-metadata",
  accept: "application/json",
  method: "GET",
  
  params: [
    {
      mode: "query",
      name: "url",
      type: "string",
      required: true,
      description: "Website URL to extract metadata from"
    }
  ],
  
  description: "Extract metadata (title, description, og tags, etc) from any website",
  
  example: `
const axios = require('axios').default;

const options = {
  method: 'GET',
  url: 'http://yourapi.com/api/execute/v1/tool/web-metadata',
  params: { 
    url: 'https://github.com'
  }
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
`,

  code: async ({ url }) => {
    try {
      // Validate URL
      if (!url) {
        return {
          code: 400,
          status: false,
          message: "URL is required"
        };
      }

      // Validate URL format
      let validUrl;
      try {
        validUrl = new URL(url);
      } catch (e) {
        return {
          code: 400,
          status: false,
          message: "Invalid URL format",
          error: "Please provide a valid URL (e.g., https://example.com)"
        };
      }

      const axios = require('axios');
      const cheerio = require('cheerio');

      // Fetch website HTML
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        maxRedirects: 5
      });

      // Parse HTML
      const $ = cheerio.load(response.data);

      // Extract metadata
      const metadata = {
        basic: {
          title: $('title').text() || $('meta[property="og:title"]').attr('content') || '',
          description: $('meta[name="description"]').attr('content') || 
                      $('meta[property="og:description"]').attr('content') || '',
          keywords: $('meta[name="keywords"]').attr('content') || '',
          author: $('meta[name="author"]').attr('content') || '',
          canonical: $('link[rel="canonical"]').attr('href') || url
        },
        
        openGraph: {
          title: $('meta[property="og:title"]').attr('content') || '',
          description: $('meta[property="og:description"]').attr('content') || '',
          image: $('meta[property="og:image"]').attr('content') || '',
          url: $('meta[property="og:url"]').attr('content') || '',
          type: $('meta[property="og:type"]').attr('content') || '',
          siteName: $('meta[property="og:site_name"]').attr('content') || ''
        },
        
        twitter: {
          card: $('meta[name="twitter:card"]').attr('content') || '',
          title: $('meta[name="twitter:title"]').attr('content') || '',
          description: $('meta[name="twitter:description"]').attr('content') || '',
          image: $('meta[name="twitter:image"]').attr('content') || '',
          site: $('meta[name="twitter:site"]').attr('content') || ''
        },
        
        technical: {
          charset: $('meta[charset]').attr('charset') || '',
          viewport: $('meta[name="viewport"]').attr('content') || '',
          robots: $('meta[name="robots"]').attr('content') || '',
          generator: $('meta[name="generator"]').attr('content') || '',
          favicon: $('link[rel="icon"]').attr('href') || 
                   $('link[rel="shortcut icon"]').attr('href') || ''
        }
      };

      // Count elements
      const stats = {
        headings: {
          h1: $('h1').length,
          h2: $('h2').length,
          h3: $('h3').length
        },
        links: {
          internal: $('a[href^="/"]').length,
          external: $('a[href^="http"]').length,
          total: $('a').length
        },
        images: $('img').length,
        scripts: $('script').length,
        stylesheets: $('link[rel="stylesheet"]').length
      };

      return {
        code: 200,
        status: true,
        message: "Metadata extracted successfully",
        data: {
          url: url,
          metadata: metadata,
          stats: stats,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      if (error.code === 'ENOTFOUND') {
        return {
          code: 404,
          status: false,
          message: "Website not found",
          error: "Could not resolve domain name"
        };
      } else if (error.code === 'ECONNABORTED') {
        return {
          code: 504,
          status: false,
          message: "Request timeout",
          error: "Website took too long to respond"
        };
      } else {
        return {
          code: 500,
          status: false,
          message: "Failed to extract metadata",
          error: error.message
        };
      }
    }
  }
};
