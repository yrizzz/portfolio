# 🎨 API Template Generator

Interactive CLI tool untuk generate API template secara otomatis.

## 🚀 Cara Menggunakan

### 1. Run Generator

```bash
cd examples
node generate-template.js
```

### 2. Jawab Pertanyaan

Generator akan menanyakan:

1. **API Name** - Nama API (contoh: `weather`, `calculator`)
2. **Category** - Kategori API (tool/ai/data/socialmedia/downloader/game/random)
3. **HTTP Method** - Method yang digunakan (GET/POST/PUT/DELETE/PATCH)
4. **Description** - Deskripsi singkat fungsi API
5. **Parameters** - Parameter yang dibutuhkan (bisa multiple)
   - Nama parameter
   - Type (string/number/boolean/file)
   - Required atau optional
   - Deskripsi parameter
6. **Features** - Fitur tambahan
   - External API call?
   - File upload?
   - AI integration?

### 3. Template Generated

File akan disimpan di folder `generated/[nama-api].js`

## 📝 Contoh Penggunaan

```bash
$ node generate-template.js

🎨 API Template Generator

Answer the following questions to generate your API template:

1. API Name (e.g., myapi): weather
2. Category (tool/ai/data/socialmedia/downloader/game/random): data
3. HTTP Method (GET/POST/PUT/DELETE/PATCH): GET
4. Description: Get weather information for a city

5. Parameters (press Enter to skip):
   Param 1 name (or press Enter to finish): city
   Param 1 type (string/number/boolean/file): string
   Param 1 required? (y/n): y
   Param 1 description: City name
   Param 2 name (or press Enter to finish): 

6. Features:
   Use external API? (y/n): y
   Handle file upload? (y/n): n
   Use AI integration? (y/n): n

✅ Template generated successfully!
📁 File saved to: generated/weather.js

📝 Next steps:
   1. Review and customize the generated code
   2. Test locally
   3. Upload via admin panel

🚀 Happy coding!
```

## 🎯 Generated Template Features

Template yang di-generate akan include:

✅ **Complete structure** - Semua field yang dibutuhkan
✅ **Input validation** - Validasi untuk required params
✅ **Error handling** - Try-catch dengan proper error response
✅ **Example code** - Contoh penggunaan dengan axios
✅ **Comments** - Komentar untuk setiap section
✅ **Standard response** - Format response yang konsisten
✅ **Timestamp** - Automatic timestamp di response

## 🔧 Customization

Setelah generate, Anda bisa customize:

1. **Logic** - Ganti TODO dengan logic sebenarnya
2. **Validation** - Tambah validasi custom
3. **Response** - Sesuaikan struktur data response
4. **Error handling** - Tambah error handling spesifik
5. **External API** - Ganti dengan API yang sebenarnya

## 📦 Output Structure

Generated file akan punya struktur:

```javascript
export default {
  name: "...",
  category: "...",
  path: "...",
  method: "...",
  params: [...],
  description: "...",
  example: `...`,
  code: async (params) => {
    try {
      // 1. INPUT VALIDATION
      // 2. MAIN LOGIC
      // 3. RETURN RESPONSE
    } catch (error) {
      // 4. ERROR HANDLING
    }
  }
};
```

## 💡 Tips

1. **Start simple** - Generate basic template dulu, tambah complexity nanti
2. **Test immediately** - Test generated code sebelum customize
3. **Keep validation** - Jangan hapus validation code
4. **Add comments** - Tambah comment untuk logic complex
5. **Follow examples** - Lihat contoh di `api-templates/` untuk reference

## 🆘 Troubleshooting

### Generator tidak jalan
```bash
# Pastikan Node.js terinstall
node --version

# Pastikan di folder yang benar
cd examples
```

### File tidak ter-generate
```bash
# Check permissions
chmod +x generate-template.js

# Check folder generated/ exists
ls -la generated/
```

### Error saat run generated code
- Review validation code
- Check required modules
- Test dengan simple input dulu

## 🎉 Next Steps

Setelah generate template:

1. ✅ Review generated code
2. ✅ Customize logic sesuai kebutuhan
3. ✅ Test locally dengan sample data
4. ✅ Upload via admin panel
5. ✅ Test live endpoint
6. ✅ Share dengan team!

---

**Happy generating!** 🚀
