# 🎯 Quick Start Guide

Panduan cepat untuk membuat API custom pertama Anda.

## 📋 Langkah-langkah

### 1. Pilih Template

Lihat contoh-contoh di folder `api-templates/`:

- `01-basic-get.js` - Untuk API sederhana dengan query params
- `02-post-with-body.js` - Untuk API dengan body JSON
- `03-external-api-call.js` - Untuk call external API
- `04-file-upload.js` - Untuk upload & process file
- `05-data-processing.js` - Untuk transform data
- `06-ai-integration.js` - Untuk integrasi AI
- `07-web-scraping.js` - Untuk scraping website
- `08-qr-generator.js` - Untuk generate image/QR
- `09-advanced-example.js` - Contoh lengkap dengan semua fitur

### 2. Copy & Customize

```javascript
export default {
  name: "myapi",              // ✏️ Ganti dengan nama API Anda
  category: "tool",           // ✏️ Pilih kategori yang sesuai
  path: "/v1/tool/myapi",     // ✏️ Tentukan path endpoint
  method: "GET",              // ✏️ GET, POST, PUT, DELETE, PATCH
  
  params: [
    {
      mode: "query",          // query (GET) atau body (POST)
      name: "param1",         // ✏️ Nama parameter
      type: "string",         // string, number, boolean, file
      required: true,         // true atau false
      description: "..."      // ✏️ Jelaskan parameter
    }
  ],
  
  description: "...",         // ✏️ Jelaskan fungsi API
  
  code: async (params) => {
    // ✏️ Tulis logic API di sini
    
    return {
      code: 200,
      status: true,
      message: "Success",
      data: { /* your data */ }
    };
  }
};
```

### 3. Test Locally

Sebelum upload, test dulu logic Anda:

```javascript
// test.js
const myApi = require('./myapi.js').default;

(async () => {
  const result = await myApi.code({ param1: 'test' });
  console.log(result);
})();
```

### 4. Upload via Admin Panel

1. Login sebagai admin
2. Buka **API Management** → **Submit New API**
3. Paste code atau upload file
4. AI akan analyze dan extract metadata
5. Review hasil analysis
6. Submit untuk approval

### 5. Test API

Setelah approved, test dengan:

```bash
# GET request
curl "http://yourapi.com/api/execute/v1/tool/myapi?param1=test"

# POST request
curl -X POST "http://yourapi.com/api/execute/v1/tool/myapi" \
  -H "Content-Type: application/json" \
  -d '{"param1": "test"}'
```

## 🎨 Categories

Pilih kategori yang sesuai:

| Category | Use Case | Examples |
|----------|----------|----------|
| `tool` | Utility tools | converter, validator, generator |
| `ai` | AI-powered | chatbot, summarizer, translator |
| `data` | Data processing | parser, transformer, analyzer |
| `socialmedia` | Social media | profile, posts, stats |
| `downloader` | Download content | video, audio, image |
| `game` | Gaming | player info, stats, leaderboard |
| `random` | Miscellaneous | checker, lookup, utility |

## ⚡ Best Practices

### ✅ DO

- **Validate all inputs** - Check required params, types, ranges
- **Handle errors properly** - Use try-catch, return meaningful errors
- **Return consistent format** - Always use standard response format
- **Add descriptions** - Explain what your API does
- **Test edge cases** - Test with invalid/missing/extreme inputs
- **Use timeout** - For external API calls (10-15 seconds)
- **Clean sensitive data** - Don't expose API keys in response

### ❌ DON'T

- Don't use blocked modules (child_process, vm, eval)
- Don't expose sensitive information
- Don't make infinite loops
- Don't use synchronous blocking operations
- Don't ignore error handling
- Don't return raw errors to users

## 📝 Response Format

Always return this format:

```javascript
// Success
{
  code: 200,
  status: true,
  message: "Success message",
  data: {
    // Your data here
  }
}

// Error
{
  code: 400/404/500,
  status: false,
  message: "Error message",
  error: "Detailed error description"
}
```

## 🔧 Allowed Modules

Only these modules can be used:

```javascript
// HTTP & Network
'axios', 'node-fetch'

// Data Processing
'lodash', 'moment', 'dayjs', 'uuid', 'validator'

// File Processing
'form-data', 'sharp', 'jimp', 'qrcode', 'pdf-lib'

// Parsing
'cheerio', 'marked', 'csv-parse', 'qs', 'dateformat'

// Built-in Node.js
'crypto', 'path', 'fs', 'url', 'querystring', 'buffer', 'stream', 'util', 'zlib'

// AI
'@google/generative-ai'
```

## 💡 Tips

1. **Start simple** - Begin with basic GET/POST, then add complexity
2. **Copy from examples** - Use templates as starting point
3. **Test incrementally** - Test each part before combining
4. **Read error messages** - They tell you what's wrong
5. **Check allowed modules** - Only use whitelisted modules
6. **Add comments** - Explain complex logic
7. **Use descriptive names** - For params, variables, functions

## 🆘 Common Issues

### "Module not allowed"
- Check if module is in whitelist
- Use alternative allowed module

### "Security violation"
- Remove blocked patterns (exec, eval, etc)
- Use safe alternatives

### "Invalid response format"
- Return object with code, status, message, data
- Don't return raw values

### "Timeout"
- Add timeout to external API calls
- Optimize slow operations

## 📚 Learn More

- Read `README.md` for complete documentation
- Check all examples in `api-templates/`
- Test with different inputs
- Ask for help in community

## 🚀 Ready to Start?

1. Choose a template that matches your use case
2. Customize it for your needs
3. Test locally
4. Upload via admin panel
5. Share your API!

Happy coding! 🎉
