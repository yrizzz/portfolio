# 📦 API Templates Collection

Complete collection of ready-to-use API templates for various use cases.

## 📁 Available Templates

### Basic Templates

#### 1. Basic GET API (`01-basic-get.js`)
- **Use Case**: Simple greeting API
- **Method**: GET
- **Params**: Query parameters
- **Features**: Multi-language support, input validation
- **Difficulty**: ⭐ Beginner

#### 2. POST with Body (`02-post-with-body.js`)
- **Use Case**: Calculator API
- **Method**: POST
- **Params**: JSON body
- **Features**: Mathematical operations, error handling
- **Difficulty**: ⭐ Beginner

### Integration Templates

#### 3. External API Call (`03-external-api-call.js`)
- **Use Case**: Weather information
- **Method**: GET
- **Features**: External API integration, timeout handling, error types
- **Difficulty**: ⭐⭐ Intermediate

#### 4. File Upload (`04-file-upload.js`)
- **Use Case**: Image resize
- **Method**: POST (multipart/form-data)
- **Features**: File validation, image processing, Sharp library
- **Difficulty**: ⭐⭐⭐ Advanced

### Data Processing Templates

#### 5. Data Processing (`05-data-processing.js`)
- **Use Case**: JSON to CSV converter
- **Method**: POST
- **Features**: Data transformation, CSV generation, statistics
- **Difficulty**: ⭐⭐ Intermediate

#### 6. AI Integration (`06-ai-integration.js`)
- **Use Case**: Text summarization
- **Method**: POST
- **Features**: AI processing, text analysis, compression stats
- **Difficulty**: ⭐⭐ Intermediate

### Advanced Templates

#### 7. Web Scraping (`07-web-scraping.js`)
- **Use Case**: Website metadata extraction
- **Method**: GET
- **Features**: HTML parsing, Cheerio, Open Graph tags, Twitter cards
- **Difficulty**: ⭐⭐⭐ Advanced

#### 8. Image Processing (`08-qr-generator.js`)
- **Use Case**: QR code generator
- **Method**: POST
- **Features**: QR code generation, customization, capacity calculation
- **Difficulty**: ⭐⭐ Intermediate

#### 9. Advanced Example (`09-advanced-example.js`)
- **Use Case**: URL shortener with analytics
- **Method**: POST
- **Features**: Complete validation, security checks, QR code, analytics, sharing links
- **Difficulty**: ⭐⭐⭐⭐ Expert

## 🎯 Choose by Use Case

### Need to fetch data?
→ Use `03-external-api-call.js`

### Need to process files?
→ Use `04-file-upload.js`

### Need to transform data?
→ Use `05-data-processing.js`

### Need AI features?
→ Use `06-ai-integration.js`

### Need to scrape websites?
→ Use `07-web-scraping.js`

### Need to generate images?
→ Use `08-qr-generator.js`

### Need complete example?
→ Use `09-advanced-example.js`

## 📊 Feature Comparison

| Template | Method | External API | File Upload | AI | Complexity |
|----------|--------|--------------|-------------|----|-----------| 
| 01-basic-get | GET | ❌ | ❌ | ❌ | ⭐ |
| 02-post-with-body | POST | ❌ | ❌ | ❌ | ⭐ |
| 03-external-api-call | GET | ✅ | ❌ | ❌ | ⭐⭐ |
| 04-file-upload | POST | ❌ | ✅ | ❌ | ⭐⭐⭐ |
| 05-data-processing | POST | ❌ | ❌ | ❌ | ⭐⭐ |
| 06-ai-integration | POST | ❌ | ❌ | ✅ | ⭐⭐ |
| 07-web-scraping | GET | ✅ | ❌ | ❌ | ⭐⭐⭐ |
| 08-qr-generator | POST | ❌ | ❌ | ❌ | ⭐⭐ |
| 09-advanced-example | POST | ❌ | ❌ | ❌ | ⭐⭐⭐⭐ |

## 🔧 Required Modules by Template

### 01-basic-get
- None (pure JavaScript)

### 02-post-with-body
- None (pure JavaScript)

### 03-external-api-call
- `axios` - HTTP client

### 04-file-upload
- `sharp` - Image processing
- `fs` - File system

### 05-data-processing
- None (pure JavaScript)

### 06-ai-integration
- `@google/generative-ai` - AI integration (optional)

### 07-web-scraping
- `axios` - HTTP client
- `cheerio` - HTML parsing

### 08-qr-generator
- `qrcode` - QR code generation

### 09-advanced-example
- `crypto` - Hashing
- `qrcode` - QR code generation

## 💡 Customization Guide

### Change Category
```javascript
category: "tool"  // tool, ai, data, socialmedia, etc
```

### Change Method
```javascript
method: "GET"  // GET, POST, PUT, DELETE, PATCH
```

### Add Parameters
```javascript
params: [
  {
    mode: "query",      // or "body"
    name: "myParam",
    type: "string",     // string, number, boolean, file
    required: true,
    description: "My parameter description"
  }
]
```

### Modify Response
```javascript
return {
  code: 200,
  status: true,
  message: "Custom message",
  data: {
    // Your custom data structure
  }
};
```

## 🚀 Quick Start

1. **Choose a template** that matches your use case
2. **Copy the file** to your project
3. **Customize** name, path, params, and logic
4. **Test locally** before uploading
5. **Upload** via admin panel
6. **Test** the live endpoint

## 📚 Documentation

- [README.md](README.md) - Complete documentation
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- Each template file has detailed comments

## 🆘 Need Help?

- Check comments in template files
- Read error messages carefully
- Test with simple inputs first
- Verify module is in whitelist
- Check response format

## 🎉 Contributing

Have a useful template? Share it with the community!

1. Create your template following the structure
2. Add detailed comments
3. Test thoroughly
4. Submit for review

---

**Happy coding!** 🚀
