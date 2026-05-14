# 📚 API Code Examples - Complete Guide

Dokumentasi lengkap dan contoh-contoh untuk membuat API custom di sistem ini.

## 📖 Table of Contents

1. [Quick Start](#-quick-start)
2. [Documentation](#-documentation)
3. [Templates](#-templates)
4. [Generator](#-generator)
5. [Examples](#-examples)

---

## 🚀 Quick Start

**Baru pertama kali?** Mulai dari sini:

1. **Baca** → [QUICKSTART.md](QUICKSTART.md) - Panduan cepat 5 menit
2. **Pilih Template** → [api-templates/](api-templates/) - Pilih yang sesuai use case
3. **Generate** → `node generate-template.js` - Atau generate otomatis
4. **Customize** → Edit sesuai kebutuhan
5. **Upload** → Via admin panel

### Contoh Tercepat

```bash
# 1. Copy template
cp api-templates/01-basic-get.js my-api.js

# 2. Edit my-api.js
# 3. Upload via admin panel
# 4. Test!
```

---

## 📚 Documentation

### Main Docs

- **[README.md](README.md)** - Dokumentasi lengkap struktur API
  - Struktur dasar
  - Modules yang diizinkan
  - Security restrictions
  - Response format
  - Categories

- **[QUICKSTART.md](QUICKSTART.md)** - Panduan cepat
  - Langkah-langkah
  - Best practices
  - Common issues
  - Tips & tricks

- **[GENERATOR.md](GENERATOR.md)** - Cara pakai generator
  - Interactive CLI
  - Customization
  - Troubleshooting

### Template Docs

- **[api-templates/INDEX.md](api-templates/INDEX.md)** - Daftar semua template
  - Feature comparison
  - Required modules
  - Difficulty levels
  - Use case guide

---

## 🎨 Templates

### Available Templates (9 total)

| # | Template | Use Case | Difficulty |
|---|----------|----------|------------|
| 01 | [basic-get.js](api-templates/01-basic-get.js) | Simple GET API | ⭐ |
| 02 | [post-with-body.js](api-templates/02-post-with-body.js) | POST with JSON | ⭐ |
| 03 | [external-api-call.js](api-templates/03-external-api-call.js) | External API | ⭐⭐ |
| 04 | [file-upload.js](api-templates/04-file-upload.js) | File processing | ⭐⭐⭐ |
| 05 | [data-processing.js](api-templates/05-data-processing.js) | Data transform | ⭐⭐ |
| 06 | [ai-integration.js](api-templates/06-ai-integration.js) | AI features | ⭐⭐ |
| 07 | [web-scraping.js](api-templates/07-web-scraping.js) | Web scraping | ⭐⭐⭐ |
| 08 | [qr-generator.js](api-templates/08-qr-generator.js) | Image generation | ⭐⭐ |
| 09 | [advanced-example.js](api-templates/09-advanced-example.js) | Complete example | ⭐⭐⭐⭐ |

### Choose by Use Case

```
Need simple API?          → 01-basic-get.js
Need to process data?     → 02-post-with-body.js
Need external API?        → 03-external-api-call.js
Need file upload?         → 04-file-upload.js
Need data transform?      → 05-data-processing.js
Need AI features?         → 06-ai-integration.js
Need web scraping?        → 07-web-scraping.js
Need image generation?    → 08-qr-generator.js
Need complete example?    → 09-advanced-example.js
```

---

## 🎯 Generator

### Interactive Template Generator

Generate API template secara otomatis dengan CLI interaktif.

```bash
node generate-template.js
```

**Features:**
- ✅ Interactive questions
- ✅ Auto-generate structure
- ✅ Include validation
- ✅ Error handling
- ✅ Example code
- ✅ Comments

**Read more:** [GENERATOR.md](GENERATOR.md)

---

## 💡 Examples

### Example 1: Simple GET API

```javascript
export default {
  name: "greeting",
  category: "tool",
  path: "/v1/tool/greeting",
  method: "GET",
  params: [
    {
      mode: "query",
      name: "name",
      type: "string",
      required: true
    }
  ],
  code: async ({ name }) => {
    return {
      code: 200,
      status: true,
      message: "Success",
      data: { greeting: `Hello, ${name}!` }
    };
  }
};
```

### Example 2: POST with Validation

```javascript
export default {
  name: "calculator",
  category: "tool",
  path: "/v1/tool/calculator",
  method: "POST",
  params: [
    { mode: "body", name: "num1", type: "number", required: true },
    { mode: "body", name: "num2", type: "number", required: true },
    { mode: "body", name: "operation", type: "string", required: true }
  ],
  code: async ({ num1, num2, operation }) => {
    // Validation
    if (!num1 || !num2 || !operation) {
      return {
        code: 400,
        status: false,
        message: "Missing required parameters"
      };
    }
    
    // Logic
    let result;
    switch (operation) {
      case 'add': result = num1 + num2; break;
      case 'subtract': result = num1 - num2; break;
      default:
        return {
          code: 400,
          status: false,
          message: "Invalid operation"
        };
    }
    
    // Response
    return {
      code: 200,
      status: true,
      message: "Success",
      data: { result }
    };
  }
};
```

### Example 3: External API Call

```javascript
export default {
  name: "weather",
  category: "data",
  path: "/v1/data/weather",
  method: "GET",
  params: [
    { mode: "query", name: "city", type: "string", required: true }
  ],
  code: async ({ city }) => {
    try {
      const axios = require('axios');
      
      const response = await axios.get(
        `https://wttr.in/${city}?format=j1`,
        { timeout: 10000 }
      );
      
      return {
        code: 200,
        status: true,
        message: "Success",
        data: response.data
      };
    } catch (error) {
      return {
        code: 500,
        status: false,
        message: "Failed to fetch weather",
        error: error.message
      };
    }
  }
};
```

---

## 📦 Project Structure

```
examples/
├── README.md                    # Main documentation
├── QUICKSTART.md               # Quick start guide
├── GENERATOR.md                # Generator guide
├── INDEX.md                    # This file
├── generate-template.js        # Template generator CLI
│
└── api-templates/              # Ready-to-use templates
    ├── INDEX.md                # Templates index
    ├── 01-basic-get.js
    ├── 02-post-with-body.js
    ├── 03-external-api-call.js
    ├── 04-file-upload.js
    ├── 05-data-processing.js
    ├── 06-ai-integration.js
    ├── 07-web-scraping.js
    ├── 08-qr-generator.js
    └── 09-advanced-example.js
```

---

## 🎓 Learning Path

### Beginner

1. Read [QUICKSTART.md](QUICKSTART.md)
2. Try [01-basic-get.js](api-templates/01-basic-get.js)
3. Try [02-post-with-body.js](api-templates/02-post-with-body.js)
4. Create your first API!

### Intermediate

1. Study [03-external-api-call.js](api-templates/03-external-api-call.js)
2. Study [05-data-processing.js](api-templates/05-data-processing.js)
3. Study [06-ai-integration.js](api-templates/06-ai-integration.js)
4. Build API with external integration

### Advanced

1. Study [04-file-upload.js](api-templates/04-file-upload.js)
2. Study [07-web-scraping.js](api-templates/07-web-scraping.js)
3. Study [09-advanced-example.js](api-templates/09-advanced-example.js)
4. Build production-ready API

---

## 🔧 Tools & Resources

### Generator
```bash
node generate-template.js
```

### Test Locally
```javascript
const api = require('./my-api.js').default;
const result = await api.code({ param: 'value' });
console.log(result);
```

### Upload
1. Login as admin
2. Go to API Management
3. Submit New API
4. Paste code or upload file
5. Review & approve

---

## 📝 Cheat Sheet

### Basic Structure
```javascript
export default {
  name: "api-name",
  category: "category",
  path: "/v1/category/name",
  method: "GET|POST|PUT|DELETE|PATCH",
  params: [...],
  description: "...",
  code: async (params) => { ... }
};
```

### Response Format
```javascript
// Success
{ code: 200, status: true, message: "...", data: {...} }

// Error
{ code: 400, status: false, message: "...", error: "..." }
```

### Allowed Modules
```javascript
'axios', 'cheerio', 'sharp', 'qrcode', 'crypto', 'fs', 'path'
```

### Categories
```
tool, ai, data, socialmedia, downloader, game, random
```

---

## 🆘 Need Help?

1. **Check docs** - Read README.md and QUICKSTART.md
2. **Check examples** - Look at similar templates
3. **Check errors** - Read error messages carefully
4. **Test simple** - Start with basic input
5. **Ask community** - Share your issue

---

## 🎉 Contributing

Have a useful template? Share it!

1. Create template following structure
2. Add detailed comments
3. Test thoroughly
4. Submit for review

---

## 📄 License

MIT License - Feel free to use and modify!

---

**Made with ❤️ for developers**

Happy coding! 🚀
