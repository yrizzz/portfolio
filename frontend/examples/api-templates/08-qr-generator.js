/**
 * 📌 CONTOH 8: IMAGE PROCESSING
 * 
 * Use Case: Generate QR Code from text/URL
 * Method: POST
 * 
 * Test:
 * POST /api/execute/v1/tool/qr-generator
 * Body: { "text": "https://example.com", "size": 300 }
 */

export default {
  name: "qrGenerator",
  category: "tool",
  path: "/v1/tool/qr-generator",
  accept: "application/json",
  method: "POST",
  
  params: [
    {
      mode: "body",
      name: "text",
      type: "string",
      required: true,
      description: "Text or URL to encode in QR code"
    },
    {
      mode: "body",
      name: "size",
      type: "number",
      default: "300",
      required: false,
      description: "QR code size in pixels (100-1000)"
    },
    {
      mode: "body",
      name: "errorCorrectionLevel",
      type: "string",
      default: "M",
      required: false,
      description: "Error correction: L (7%), M (15%), Q (25%), H (30%)"
    },
    {
      mode: "body",
      name: "darkColor",
      type: "string",
      default: "#000000",
      required: false,
      description: "Dark color in hex (default: black)"
    },
    {
      mode: "body",
      name: "lightColor",
      type: "string",
      default: "#FFFFFF",
      required: false,
      description: "Light color in hex (default: white)"
    }
  ],
  
  description: "Generate QR code from text or URL with customizable size and colors",
  
  example: `
const axios = require('axios').default;

const options = {
  method: 'POST',
  url: 'http://yourapi.com/api/execute/v1/tool/qr-generator',
  headers: {
    'Content-Type': 'application/json'
  },
  data: {
    text: 'https://github.com',
    size: 400,
    errorCorrectionLevel: 'H',
    darkColor: '#000000',
    lightColor: '#FFFFFF'
  }
};

try {
  const { data } = await axios.request(options);
  console.log(data);
  // data.data.qrCode contains base64 image
} catch (error) {
  console.error(error);
}
`,

  code: async ({ 
    text, 
    size = 300, 
    errorCorrectionLevel = 'M',
    darkColor = '#000000',
    lightColor = '#FFFFFF'
  }) => {
    try {
      // Validate input
      if (!text || text.trim().length === 0) {
        return {
          code: 400,
          status: false,
          message: "Text is required"
        };
      }

      // Validate size
      const qrSize = parseInt(size);
      if (qrSize < 100 || qrSize > 1000) {
        return {
          code: 400,
          status: false,
          message: "Invalid size",
          error: "Size must be between 100 and 1000 pixels"
        };
      }

      // Validate error correction level
      const validLevels = ['L', 'M', 'Q', 'H'];
      if (!validLevels.includes(errorCorrectionLevel.toUpperCase())) {
        return {
          code: 400,
          status: false,
          message: "Invalid error correction level",
          error: "Must be one of: L, M, Q, H"
        };
      }

      const QRCode = require('qrcode');

      // Generate QR code options
      const options = {
        errorCorrectionLevel: errorCorrectionLevel.toUpperCase(),
        type: 'image/png',
        quality: 1,
        margin: 1,
        width: qrSize,
        color: {
          dark: darkColor,
          light: lightColor
        }
      };

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(text, options);

      // Calculate estimated capacity
      const capacityInfo = {
        numeric: {
          L: 7089, M: 5596, Q: 3993, H: 3057
        },
        alphanumeric: {
          L: 4296, M: 3391, Q: 2420, H: 1852
        },
        binary: {
          L: 2953, M: 2331, Q: 1663, H: 1273
        }
      };

      const level = errorCorrectionLevel.toUpperCase();
      const textLength = text.length;
      const textType = /^[0-9]+$/.test(text) ? 'numeric' : 
                      /^[0-9A-Z $%*+\-./:]+$/.test(text) ? 'alphanumeric' : 'binary';

      return {
        code: 200,
        status: true,
        message: "QR code generated successfully",
        data: {
          qrCode: qrCodeDataUrl, // Base64 data URL
          input: {
            text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            textLength: textLength,
            textType: textType
          },
          settings: {
            size: qrSize,
            errorCorrectionLevel: level,
            errorCorrectionCapacity: {
              L: '7% recovery',
              M: '15% recovery',
              Q: '25% recovery',
              H: '30% recovery'
            }[level],
            darkColor: darkColor,
            lightColor: lightColor
          },
          capacity: {
            maxCapacity: capacityInfo[textType][level],
            used: textLength,
            remaining: capacityInfo[textType][level] - textLength,
            percentage: ((textLength / capacityInfo[textType][level]) * 100).toFixed(2) + '%'
          },
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      return {
        code: 500,
        status: false,
        message: "QR code generation failed",
        error: error.message
      };
    }
  }
};
