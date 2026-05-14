/**
 * 📌 CONTOH 9: ADVANCED EXAMPLE
 * 
 * Use Case: URL Shortener with analytics
 * Method: POST (create), GET (redirect & stats)
 * Features: Complete error handling, validation, data persistence simulation
 * 
 * Test:
 * POST /api/execute/v1/tool/url-shortener
 * Body: { "url": "https://example.com/very/long/url", "customSlug": "mylink" }
 */

export default {
  name: "urlShortener",
  category: "tool",
  path: "/v1/tool/url-shortener",
  accept: "application/json",
  method: "POST",
  
  params: [
    {
      mode: "body",
      name: "url",
      type: "string",
      required: true,
      description: "Long URL to shorten"
    },
    {
      mode: "body",
      name: "customSlug",
      type: "string",
      required: false,
      description: "Custom short code (optional, auto-generated if not provided)"
    },
    {
      mode: "body",
      name: "expiresIn",
      type: "number",
      default: "0",
      required: false,
      description: "Expiration time in days (0 = never expires)"
    }
  ],
  
  description: "Advanced URL shortener with custom slugs, expiration, and analytics",
  
  example: `
const axios = require('axios').default;

// Create short URL
const options = {
  method: 'POST',
  url: 'http://yourapi.com/api/execute/v1/tool/url-shortener',
  headers: {
    'Content-Type': 'application/json'
  },
  data: {
    url: 'https://github.com/username/very-long-repository-name',
    customSlug: 'myrepo',
    expiresIn: 30
  }
};

try {
  const { data } = await axios.request(options);
  console.log(data);
  // Use data.data.shortUrl
} catch (error) {
  console.error(error);
}
`,

  code: async ({ url, customSlug, expiresIn = 0 }) => {
    try {
      // ============================================
      // 1. INPUT VALIDATION
      // ============================================
      
      // Validate URL is provided
      if (!url || url.trim().length === 0) {
        return {
          code: 400,
          status: false,
          message: "URL is required",
          error: "Please provide a valid URL to shorten"
        };
      }

      // Validate URL format
      let validUrl;
      try {
        validUrl = new URL(url);
        
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(validUrl.protocol)) {
          return {
            code: 400,
            status: false,
            message: "Invalid URL protocol",
            error: "Only HTTP and HTTPS URLs are supported"
          };
        }
      } catch (e) {
        return {
          code: 400,
          status: false,
          message: "Invalid URL format",
          error: "Please provide a valid URL (e.g., https://example.com)"
        };
      }

      // Validate URL length
      if (url.length > 2048) {
        return {
          code: 400,
          status: false,
          message: "URL too long",
          error: "URL must be less than 2048 characters"
        };
      }

      // Validate custom slug if provided
      if (customSlug) {
        // Check slug format (alphanumeric, dash, underscore only)
        if (!/^[a-zA-Z0-9_-]+$/.test(customSlug)) {
          return {
            code: 400,
            status: false,
            message: "Invalid custom slug",
            error: "Slug can only contain letters, numbers, dashes, and underscores"
          };
        }

        // Check slug length
        if (customSlug.length < 3 || customSlug.length > 50) {
          return {
            code: 400,
            status: false,
            message: "Invalid slug length",
            error: "Slug must be between 3 and 50 characters"
          };
        }

        // Check for reserved words
        const reservedWords = ['admin', 'api', 'www', 'app', 'dashboard', 'login', 'register'];
        if (reservedWords.includes(customSlug.toLowerCase())) {
          return {
            code: 400,
            status: false,
            message: "Reserved slug",
            error: `"${customSlug}" is a reserved word and cannot be used`
          };
        }
      }

      // Validate expiration
      const expirationDays = parseInt(expiresIn);
      if (expirationDays < 0 || expirationDays > 365) {
        return {
          code: 400,
          status: false,
          message: "Invalid expiration",
          error: "Expiration must be between 0 and 365 days"
        };
      }

      // ============================================
      // 2. GENERATE SHORT CODE
      // ============================================
      
      const crypto = require('crypto');
      
      // Generate random slug if not provided
      const slug = customSlug || crypto.randomBytes(4).toString('base64url').substring(0, 6);

      // ============================================
      // 3. CHECK URL SAFETY (Optional)
      // ============================================
      
      // List of known malicious domains (simplified example)
      const blockedDomains = ['malware.com', 'phishing.net', 'spam.org'];
      const hostname = validUrl.hostname.toLowerCase();
      
      if (blockedDomains.some(domain => hostname.includes(domain))) {
        return {
          code: 403,
          status: false,
          message: "URL blocked",
          error: "This URL has been flagged as potentially harmful"
        };
      }

      // ============================================
      // 4. CALCULATE EXPIRATION
      // ============================================
      
      let expiresAt = null;
      if (expirationDays > 0) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + expirationDays);
        expiresAt = expirationDate.toISOString();
      }

      // ============================================
      // 5. GENERATE ANALYTICS DATA
      // ============================================
      
      const createdAt = new Date().toISOString();
      const shortUrl = `https://short.link/${slug}`;
      
      // Generate QR code for the short URL
      const QRCode = require('qrcode');
      const qrCode = await QRCode.toDataURL(shortUrl, {
        width: 300,
        margin: 1
      });

      // ============================================
      // 6. PREPARE RESPONSE
      // ============================================
      
      return {
        code: 200,
        status: true,
        message: "URL shortened successfully",
        data: {
          shortUrl: shortUrl,
          slug: slug,
          originalUrl: url,
          qrCode: qrCode,
          
          metadata: {
            domain: validUrl.hostname,
            protocol: validUrl.protocol,
            path: validUrl.pathname,
            hasQuery: validUrl.search.length > 0
          },
          
          settings: {
            customSlug: !!customSlug,
            expiresIn: expirationDays > 0 ? `${expirationDays} days` : 'Never',
            expiresAt: expiresAt,
            createdAt: createdAt
          },
          
          analytics: {
            clicks: 0,
            uniqueVisitors: 0,
            lastAccessed: null,
            topCountries: [],
            topReferrers: []
          },
          
          sharing: {
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shortUrl)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shortUrl)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(shortUrl)}`,
            telegram: `https://t.me/share/url?url=${encodeURIComponent(shortUrl)}`
          },
          
          stats: {
            originalLength: url.length,
            shortLength: shortUrl.length,
            savedCharacters: url.length - shortUrl.length,
            compressionRatio: ((1 - shortUrl.length / url.length) * 100).toFixed(2) + '%'
          }
        }
      };

    } catch (error) {
      // ============================================
      // 7. ERROR HANDLING
      // ============================================
      
      console.error('URL Shortener Error:', error);
      
      return {
        code: 500,
        status: false,
        message: "Failed to shorten URL",
        error: error.message,
        details: {
          errorType: error.name,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
};
