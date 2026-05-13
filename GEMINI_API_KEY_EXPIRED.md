# 🔑 Gemini API Key - EXPIRED - Cara Mendapatkan yang Baru

## ❌ Masalah Saat Ini

**API Key:** `AIzaSyCd-gn3vu8UTk_7AMLd1Zlkn5HZhSpDNM8`  
**Status:** ❌ **EXPIRED / KADALUARSA**  
**Error:** "API key expired. Please renew the API key."

---

## ✅ Solusi: Dapatkan API Key Baru

### Langkah 1: Buka Google AI Studio
Kunjungi: **https://aistudio.google.com/apikey**

Atau alternatif: **https://aistudio.google.com/app/apikey**

### Langkah 2: Login dengan Google Account
- Gunakan akun Google Anda
- Pastikan akun memiliki akses ke Gemini API

### Langkah 3: Create API Key
1. Klik tombol **"Create API Key"** atau **"Get API Key"**
2. Pilih project Google Cloud (atau buat baru)
3. Copy API key yang baru dibuat
4. **PENTING:** Simpan API key dengan aman!

### Langkah 4: Update API Key di Aplikasi

#### Opsi A: Via UI (Recommended)
1. Buka aplikasi: `http://localhost:3000/admin/api-settings`
2. Login sebagai admin
3. Paste API key baru di field "Gemini API Key"
4. Klik "Save Settings"
5. Klik "Test Connection" untuk verifikasi

#### Opsi B: Via Environment Variable
Edit file `.env`:
```bash
cd /home/yrizzz/Desktop/Porto/frontend
nano .env
```

Update baris:
```env
GEMINI_API_KEY="YOUR_NEW_API_KEY_HERE"
```

Save dan restart server:
```bash
# Ctrl+X, Y, Enter untuk save di nano
npm run dev
```

#### Opsi C: Via Database (Manual)
```bash
cd /home/yrizzz/Desktop/Porto/frontend
npx prisma studio
```

1. Buka tabel `SiteConfig`
2. Cari row dengan `key = "GEMINI_API_KEY"`
3. Update `value` dengan API key baru
4. Save

---

## 🔍 Verifikasi API Key Baru

### Test via Script:
```bash
cd /home/yrizzz/Desktop/Porto/frontend

# Update API key di test script
nano test-gemini-key.js
# Ganti apiKey dengan yang baru

# Run test
node test-gemini-key.js
```

### Test via cURL:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_NEW_API_KEY"
```

**Expected Response:** List of available models (JSON)

### Test via UI:
1. Buka: `http://localhost:3000/admin/api-settings`
2. Enter new API key
3. Click "Load Available Models"
4. Should show: "✅ Found X available models"
5. Click "Test Connection"
6. Should show: "✅ Gemini API connection successful!"

---

## 📋 Checklist

- [ ] Buka Google AI Studio
- [ ] Login dengan Google account
- [ ] Create new API key
- [ ] Copy API key
- [ ] Update di aplikasi (via UI/env/database)
- [ ] Test connection
- [ ] Verify models load successfully
- [ ] Test script submission (optional)

---

## 🚨 Troubleshooting

### "API key not found"
**Solusi:** Pastikan Anda sudah login ke Google AI Studio dan create API key

### "API key invalid"
**Solusi:** 
- Pastikan copy API key dengan benar (tidak ada spasi/karakter tambahan)
- Pastikan API key dimulai dengan `AIza...`
- Coba generate API key baru

### "Quota exceeded"
**Solusi:**
- Gemini API memiliki free tier dengan limit
- Check quota di: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
- Upgrade ke paid plan jika perlu

### "Service not enabled"
**Solusi:**
1. Buka: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
2. Click "Enable"
3. Wait beberapa menit
4. Try again

---

## 💡 Tips

### 1. Simpan API Key dengan Aman
- Jangan commit ke git
- Gunakan environment variables
- Simpan di password manager

### 2. Monitor Usage
- Check usage di Google AI Studio
- Set up alerts untuk quota
- Monitor di aplikasi via `/admin/api-monitoring`

### 3. Rotate API Keys Regularly
- Generate new key setiap 3-6 bulan
- Delete old keys setelah migration
- Keep backup key untuk emergency

### 4. Use Multiple Keys (Production)
- Development key untuk testing
- Production key untuk live
- Separate keys per environment

---

## 🔗 Useful Links

- **Get API Key:** https://aistudio.google.com/apikey
- **AI Studio:** https://aistudio.google.com
- **Documentation:** https://ai.google.dev/gemini-api/docs
- **Pricing:** https://ai.google.dev/pricing
- **Quota Management:** https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas

---

## 📝 Format API Key yang Benar

API key Gemini biasanya:
- Dimulai dengan: `AIza`
- Panjang: ~39 karakter
- Format: `AIzaSy[A-Za-z0-9_-]{33}`
- Contoh: `AIzaSyDaGmWKa4JsXZ-HjGw7ISLn_3namBGewQe`

---

## ✅ Setelah Update API Key

### Test Fitur-Fitur Ini:
1. **Load Models** - `/admin/api-settings` → "Load Available Models"
2. **Test Connection** - `/admin/api-settings` → "Test Connection"
3. **Submit Script** - `/admin/api-submit` → Paste script → Submit
4. **Code Conversion** - `/admin/api-create` → "Convert Code" button

Semua harus berfungsi dengan API key baru!

---

## 🎯 Quick Fix Command

```bash
# 1. Get new API key from Google AI Studio
# 2. Update .env file
cd /home/yrizzz/Desktop/Porto/frontend
echo 'GEMINI_API_KEY="YOUR_NEW_API_KEY_HERE"' >> .env

# 3. Restart server
npm run dev

# 4. Test
node test-gemini-key.js
```

---

**Status:** ❌ Current key expired  
**Action Required:** Get new API key from Google AI Studio  
**Priority:** HIGH - Required for AI features  
**ETA:** 5 minutes to get new key

🔑 **Get your new API key here:** https://aistudio.google.com/apikey
