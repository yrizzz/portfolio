/**
 * 📌 CONTOH 4: FILE UPLOAD & PROCESSING
 * 
 * Use Case: Image resize API
 * Method: POST
 * Content-Type: multipart/form-data
 * 
 * Test:
 * POST /api/execute/v1/tool/image-resize
 * Body: FormData with 'image' file and 'width', 'height' params
 */

export default {
  name: "imageResize",
  category: "tool",
  path: "/v1/tool/image-resize",
  accept: "multipart/form-data",
  method: "POST",
  
  params: [
    {
      mode: "body",
      name: "image",
      type: "file",
      required: true,
      description: "Image file to resize (JPEG, PNG, WebP)"
    },
    {
      mode: "body",
      name: "width",
      type: "number",
      required: false,
      description: "Target width in pixels (default: auto)"
    },
    {
      mode: "body",
      name: "height",
      type: "number",
      required: false,
      description: "Target height in pixels (default: auto)"
    },
    {
      mode: "body",
      name: "quality",
      type: "number",
      default: "80",
      required: false,
      description: "Image quality 1-100 (default: 80)"
    }
  ],
  
  description: "Resize image to specified dimensions with quality control",
  
  example: `
const axios = require('axios').default;
const FormData = require('form-data');
const fs = require('fs');

const formData = new FormData();
formData.append('image', fs.createReadStream('path/to/image.jpg'));
formData.append('width', '800');
formData.append('height', '600');
formData.append('quality', '85');

const options = {
  method: 'POST',
  url: 'http://yourapi.com/api/execute/v1/tool/image-resize',
  headers: {
    ...formData.getHeaders()
  },
  data: formData
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
`,

  code: async ({ image, width, height, quality = 80 }) => {
    try {
      // Validate file
      if (!image || !image.tempPath) {
        return {
          code: 400,
          status: false,
          message: "Image file is required"
        };
      }

      // Validate dimensions
      if (!width && !height) {
        return {
          code: 400,
          status: false,
          message: "At least width or height must be specified"
        };
      }

      const sharp = require('sharp');
      const fs = require('fs');
      const path = require('path');

      // Read uploaded file
      const imageBuffer = fs.readFileSync(image.tempPath);

      // Get original image metadata
      const metadata = await sharp(imageBuffer).metadata();

      // Calculate dimensions (maintain aspect ratio if only one dimension provided)
      let targetWidth = width ? parseInt(width) : null;
      let targetHeight = height ? parseInt(height) : null;

      if (targetWidth && !targetHeight) {
        targetHeight = Math.round((targetWidth / metadata.width) * metadata.height);
      } else if (targetHeight && !targetWidth) {
        targetWidth = Math.round((targetHeight / metadata.height) * metadata.width);
      }

      // Validate quality
      const imageQuality = Math.max(1, Math.min(100, parseInt(quality)));

      // Resize image
      const resizedBuffer = await sharp(imageBuffer)
        .resize(targetWidth, targetHeight, {
          fit: 'inside',
          withoutEnlargement: false
        })
        .jpeg({ quality: imageQuality })
        .toBuffer();

      // Convert to base64 for response
      const base64Image = resizedBuffer.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64Image}`;

      // Calculate file size reduction
      const originalSize = imageBuffer.length;
      const newSize = resizedBuffer.length;
      const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(2);

      return {
        code: 200,
        status: true,
        message: "Image resized successfully",
        data: {
          original: {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: originalSize,
            sizeFormatted: (originalSize / 1024).toFixed(2) + ' KB'
          },
          resized: {
            width: targetWidth,
            height: targetHeight,
            quality: imageQuality,
            size: newSize,
            sizeFormatted: (newSize / 1024).toFixed(2) + ' KB',
            reduction: reduction + '%'
          },
          image: dataUrl, // Base64 encoded image
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      return {
        code: 500,
        status: false,
        message: "Image processing failed",
        error: error.message
      };
    }
  }
};
