# Gemini API - Model Update to Flash 2.0

## Perubahan Model

Semua endpoint Gemini API telah diupdate dari `gemini-pro` ke `gemini-2.0-flash-exp`.

### Alasan Perubahan

**Error yang Terjadi:**
```
Gemini API connection failed: models/gemini-pro is not found for API version v1beta, 
or is not supported for generateContent.
```

**Penyebab:**
- Model `gemini-pro` sudah deprecated/tidak tersedia di v1beta API
- Google telah merilis model baru yang lebih baik

**Solusi:**
- Update ke `gemini-2.0-flash-exp` (Gemini 2.0 Flash Experimental)

## File yang Diupdate

### 1. `/api/endpoints/submit/route.ts`
```typescript
// Before
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// After
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
```

### 2. `/api/gemini/convert/route.ts`
```typescript
// Before
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`
);

// After
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`
);
```

### 3. `/admin/api-settings/page.tsx`
```typescript
// Before
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`
);

// After
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`
);
```

## Keunggulan Gemini 2.0 Flash

### Performance
- ⚡ **Lebih Cepat**: Response time lebih cepat dari gemini-pro
- 🎯 **Lebih Akurat**: Hasil analisis code lebih baik
- 💰 **Gratis**: Tetap gratis untuk experimental usage

### Features
- ✅ Support v1beta API
- ✅ Better code understanding
- ✅ Improved JSON parsing
- ✅ More consistent responses

### Comparison

| Feature | gemini-pro | gemini-2.0-flash-exp |
|---------|-----------|---------------------|
| Speed | Medium | Fast ⚡ |
| Accuracy | Good | Better 🎯 |
| API Version | v1 (deprecated) | v1beta ✅ |
| Availability | Limited | Available |
| Cost | Free | Free |

## Testing

Setelah update, test connection akan:

1. **Success Response:**
```
✅ Gemini API connection successful!
```

2. **Error Response (jika API key salah):**
```
❌ Gemini API connection failed: API key not valid. Please pass a valid API key.
```

3. **Error Response (jika quota habis):**
```
❌ Gemini API connection failed: Resource has been exhausted (e.g. check quota).
```

## Cara Test

### 1. Via Settings Page
1. Login sebagai Admin
2. Buka `/admin/api-settings`
3. Masukkan Gemini API key
4. Klik "Test Connection"
5. Harus muncul: ✅ Gemini API connection successful!

### 2. Via Submit Script
1. Buka `/admin/api-submit`
2. Paste script sederhana:
```javascript
export default {
  name: "Test API",
  path: "/test",
  method: "GET",
  code: async (req, res) => {
    return { message: "Hello World" };
  }
}
```
3. Klik "Submit Script"
4. AI akan menganalisis dan menampilkan hasil

### 3. Via Code Converter
1. Buka `/admin/api-create`
2. Paste code di Code Input
3. Pilih "Convert with AI"
4. Pilih target language
5. Klik "Convert"

## Troubleshooting

### Error: "Model not found"
- ✅ **Fixed**: Update sudah menggunakan gemini-2.0-flash-exp

### Error: "API key not valid"
- Cek API key di [Google AI Studio](https://aistudio.google.com/apikey)
- Pastikan tidak ada spasi di awal/akhir
- Generate API key baru jika perlu

### Error: "Resource exhausted"
- Quota API sudah habis
- Tunggu reset (biasanya per hari)
- Atau upgrade ke paid plan

### Test Connection Success tapi Submit Gagal
- Cek console browser untuk error detail
- Pastikan script format benar
- Cek database connection

## API Quota

Gemini 2.0 Flash Experimental memiliki quota:
- **Free tier**: 15 requests per minute
- **Free tier**: 1,500 requests per day
- **Free tier**: 1 million tokens per day

Untuk production, pertimbangkan:
- Implement caching untuk hasil AI
- Rate limiting per user
- Upgrade ke paid plan jika perlu

## Migration Notes

Jika Anda menggunakan versi lama:
1. Pull latest code
2. Rebuild: `npm run build`
3. Restart server
4. Test connection di Settings page
5. Semua endpoint akan otomatis menggunakan model baru

## Support

Jika masih ada masalah:
1. Cek [Google AI Studio Status](https://status.cloud.google.com/)
2. Cek [Gemini API Documentation](https://ai.google.dev/docs)
3. Regenerate API key
4. Clear browser cache dan restart server
