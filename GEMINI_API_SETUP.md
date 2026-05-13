# Gemini API Setup Guide

## Masalah yang Diperbaiki

Sebelumnya, test API key Gemini selalu gagal karena:
1. API key disimpan di database tapi kode menggunakan `process.env.GEMINI_API_KEY`
2. Test connection tidak langsung menguji ke Gemini API

## Solusi yang Diterapkan

### 1. Helper Function untuk Get API Key

Dibuat fungsi helper yang mencoba mengambil API key dari:
- Environment variable (`process.env.GEMINI_API_KEY`) - prioritas pertama
- Database (`siteConfig` table) - fallback

```typescript
async function getGeminiApiKey(): Promise<string> {
  // Try environment variable first
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  
  // Try database
  const config = await prisma.siteConfig.findUnique({
    where: { key: 'GEMINI_API_KEY' },
  });
  
  return config?.value || '';
}
```

### 2. Update Endpoints

File yang diupdate:
- `/api/endpoints/submit/route.ts` - Menggunakan helper function
- `/api/gemini/convert/route.ts` - Menggunakan helper function

### 3. Perbaikan Test Connection

Test connection sekarang langsung menguji ke Gemini API:

```typescript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: 'Say "Hello" if you can read this.' }]
      }]
    })
  }
);
```

## Cara Menggunakan

### Opsi 1: Menggunakan Environment Variable (Recommended untuk Development)

1. Buat file `.env.local` di folder `frontend/`
2. Tambahkan:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. Restart server

### Opsi 2: Menggunakan Settings Page (Recommended untuk Production)

1. Login sebagai Admin
2. Buka `/admin/api-settings`
3. Masukkan Gemini API key
4. Klik "Test Connection" untuk memverifikasi
5. Klik "Save API Key"

## Mendapatkan Gemini API Key

1. Kunjungi [Google AI Studio](https://aistudio.google.com/apikey)
2. Login dengan akun Google
3. Klik "Create API Key"
4. Copy API key yang dihasilkan

## Troubleshooting

### Error: "Gemini API key not configured"
- Pastikan API key sudah disimpan di Settings atau di `.env.local`
- Restart server setelah menambahkan ke `.env.local`

### Error: "Invalid API key"
- Verifikasi API key di Google AI Studio
- Pastikan tidak ada spasi di awal/akhir key
- Coba generate API key baru

### Error: "API quota exceeded"
- Cek quota di [Google AI Studio](https://aistudio.google.com/apikey)
- Tunggu reset quota atau upgrade plan

### Test Connection Gagal tapi Submit Script Berhasil
- Kemungkinan API key valid tapi ada rate limiting
- Tunggu beberapa saat dan coba lagi

## Model yang Digunakan

- **gemini-2.0-flash-exp**: Model terbaru Gemini 2.0 Flash (experimental) untuk analisis script dan konversi code
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`
- Keunggulan:
  - Lebih cepat dari gemini-pro
  - Lebih akurat dalam code analysis
  - Support untuk v1beta API
  - Gratis untuk penggunaan experimental

## Perubahan dari Versi Sebelumnya

### v2.0 (Current)
- ✅ Menggunakan `gemini-2.0-flash-exp` model
- ✅ Support v1beta API
- ✅ Lebih cepat dan akurat

### v1.0 (Old)
- ❌ Menggunakan `gemini-pro` model
- ❌ Model tidak tersedia di v1beta API
- ❌ Error: "models/gemini-pro is not found for API version v1beta"

## Keamanan

- API key disimpan encrypted di database
- Hanya Admin yang bisa melihat/mengubah API key
- API key tidak pernah dikirim ke client-side
- Semua request ke Gemini API dilakukan di server-side
