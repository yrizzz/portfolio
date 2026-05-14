# 📚 API Code Examples & Templates

Dokumentasi lengkap untuk membuat API custom di sistem ini.

## 🎯 Struktur Dasar API

Setiap API file harus mengikuti struktur berikut:

```javascript
export default {
  name: "nama-api",              // Nama unik API
  category: "kategori",          // Kategori: tool, ai, data, socialmedia, dll
  path: "/v1/kategori/nama",     // Path endpoint (harus unik)
  accept: "application/json",    // Content-Type yang diterima
  method: "GET",                 // HTTP Method: GET, POST, PUT, DELETE, PATCH
  params: [                      // Array parameter yang dibutuhkan
    {
      mode: "query",             // Mode: "query" (GET) atau "body" (POST/PUT)
      name: "param_name",        // Nama parameter
      type: "string",            // Type: string, number, boolean, file
      default: "undefined",      // Nilai default
      required: true,            // Apakah wajib?
      description: "Deskripsi"   // Penjelasan parameter (opsional)
    }
  ],
  description: "Deskripsi API",  // Penjelasan fungsi API
  example: `...`,                // Contoh penggunaan (opsional)
  code: async (params) => {      // Function utama yang akan dieksekusi
    // Logic API di sini
    return {
      code: 200,                 // HTTP status code
      status: true,              // Boolean status
      message: "Success",        // Pesan
      data: {}                   // Data response
    };
  }
};
```

## 📁 Struktur Folder

```
examples/api-templates/
├── README.md                    # Dokumentasi ini
├── 01-basic-get.js             # Contoh API GET sederhana
├── 02-post-with-body.js        # Contoh API POST dengan body
├── 03-external-api-call.js     # Contoh call external API
├── 04-file-upload.js           # Contoh upload file
├── 05-data-processing.js       # Contoh processing data
├── 06-ai-integration.js        # Contoh integrasi AI
├── 07-web-scraping.js          # Contoh web scraping
├── 08-image-processing.js      # Contoh image processing
└── 09-advanced-example.js      # Contoh advanced dengan error handling
```

## 🔧 Modules yang Diizinkan

Hanya module berikut yang bisa digunakan (whitelist):

```javascript
// HTTP & Network
'axios', 'node-fetch'

// Data Processing
'lodash', 'moment', 'dayjs', 'uuid', 'validator'

// File Processing
'form-data', 'sharp', 'jimp', 'qrcode', 'pdf-lib'

// Parsing & Formatting
'cheerio', 'marked', 'csv-parse', 'qs', 'dateformat', 'sanitize-html'

// Built-in Node.js
'crypto', 'path', 'fs', 'url', 'querystring', 'buffer', 'stream', 'util', 'zlib'

// AI
'@google/generative-ai'
```

## ⚠️ Security Restrictions

**DILARANG menggunakan:**
- `process.exit()`
- `child_process` (exec, spawn, dll)
- `eval()` atau `Function()`
- `require('vm')`
- `require('net')`, `require('dgram')`, `require('dns')`
- File operations yang berbahaya (rm -rf, rmdir)

## 🚀 Cara Menggunakan

### 1. Buat File API Baru

Buat file `.js` dengan struktur yang benar di folder `utils/api/[category]/`

### 2. Export di index.js

Tambahkan export di `utils/api/index.js`:

```javascript
export { default as namaApi } from './category/namaApi.js';
```

### 3. Submit via Admin Panel

- Login sebagai admin
- Buka halaman API Management
- Upload file atau paste code
- AI akan analyze dan extract metadata
- Review dan approve

### 4. Test API

Setelah approved, API bisa diakses di:

```
GET/POST http://yourapi.com/api/execute/v1/category/nama
```

## 📝 Response Format Standar

Semua API harus return format berikut:

```javascript
// Success Response
{
  code: 200,
  status: true,
  message: "Success",
  data: {
    // Your data here
  }
}

// Error Response
{
  code: 400/404/500,
  status: false,
  message: "Error message",
  error: "Detailed error" // optional
}
```

## 🎨 Categories

- `tool` - Utility tools (converter, checker, generator)
- `ai` - AI-powered APIs (chatbot, image generation, text processing)
- `data` - Data APIs (database, analytics)
- `socialmedia` - Social media APIs (profile, posts, stats)
- `downloader` - Download APIs (video, audio, image)
- `game` - Game-related APIs (player info, stats)
- `random` - Miscellaneous APIs
- `domain` - Domain & DNS APIs
- `maps` - Maps & Location APIs

## 💡 Tips

1. **Selalu validate input** - Check required params
2. **Handle errors properly** - Use try-catch
3. **Return consistent format** - Follow response standard
4. **Add timeout** - Untuk external API calls
5. **Clean sensitive data** - Jangan expose API keys di response
6. **Test thoroughly** - Test semua edge cases
7. **Add description** - Jelaskan fungsi dan parameter dengan jelas

## 📖 Lihat Examples

Lihat file-file di folder ini untuk contoh lengkap berbagai use case.
