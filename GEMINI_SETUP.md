# Setup Gemini API Key

## Cara Mendapatkan API Key

1. Buka [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Login dengan akun Google Anda
3. Klik "Get API Key" atau "Create API Key"
4. Copy API key yang dihasilkan

## Cara Memasang API Key

### Metode 1: Melalui File .env (Recommended)

1. Buka file `.env` di folder `frontend/`
2. Cari baris `GEMINI_API_KEY=""`
3. Paste API key Anda di antara tanda kutip:
   ```
   GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   ```
4. Save file
5. Restart development server:
   ```bash
   cd frontend
   npm run dev
   ```

### Metode 2: Melalui Environment Variable

Jika tidak bisa paste di file .env, gunakan terminal:

**Linux/Mac:**
```bash
export GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
cd frontend
npm run dev
```

**Windows (CMD):**
```cmd
set GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
cd frontend
npm run dev
```

**Windows (PowerShell):**
```powershell
$env:GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
cd frontend
npm run dev
```

## Cara Menggunakan AI Code Converter

### Di Halaman Create API:

1. Buka `/admin/api-create`
2. Isi form API details
3. Pilih **Language** target (nodejs, php, python, go)
4. Paste code Anda di textarea (bisa dari bahasa apapun)
5. Klik tombol **"AI Convert"** (tombol ungu dengan icon sparkles ✨)
6. Tunggu beberapa detik
7. Code akan otomatis diconvert ke bahasa yang dipilih

### Di Halaman Edit API:

1. Buka `/admin/api-data`
2. Klik Edit pada API yang ingin diubah
3. Ubah **Language** ke bahasa target
4. Klik tombol **"AI Convert"** 
5. Code akan diconvert ke bahasa baru

## Fitur AI Converter

- ✅ Auto-detect bahasa source code
- ✅ Convert ke: Node.js, PHP, Python, Go
- ✅ Maintain logic dan functionality
- ✅ Follow best practices bahasa target
- ✅ Keep async/await pattern
- ✅ Preserve return format

## Troubleshooting

### Error: "Gemini API key not configured"
- Pastikan API key sudah diisi di `.env`
- Restart development server setelah mengubah `.env`

### Error: "Failed to convert code"
- Check koneksi internet
- Pastikan API key valid
- Check quota API di Google AI Studio

### API Key tidak bisa di-paste
- Copy API key ke notepad dulu
- Hapus spasi atau karakter tersembunyi
- Paste dari notepad ke `.env`
- Atau gunakan metode environment variable

### Code hasil convert tidak sesuai
- Pastikan code source valid
- Coba convert ulang
- Edit manual jika perlu

## Contoh Penggunaan

### Convert dari PHP ke Node.js:

**Input (PHP):**
```php
function checkPhone($phone) {
    $cleaned = preg_replace('/[^0-9]/', '', $phone);
    if (strlen($cleaned) < 10) {
        return ['status' => false, 'message' => 'Invalid phone'];
    }
    return ['status' => true, 'data' => $cleaned];
}
```

**Output (Node.js):**
```javascript
async (params) => {
    const { phone } = params;
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length < 10) {
        return {
            code: 400,
            status: false,
            message: 'Invalid phone'
        };
    }
    return {
        code: 200,
        status: true,
        data: cleaned
    };
}
```

## Rate Limits

Gemini API Free Tier:
- 60 requests per minute
- 1,500 requests per day

Jika melebihi limit, tunggu beberapa menit atau upgrade ke paid plan.

## Support

Jika ada masalah:
1. Check console browser (F12) untuk error details
2. Check terminal server untuk error logs
3. Pastikan API key valid dan aktif
4. Check quota di Google AI Studio
