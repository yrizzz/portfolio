# 🚀 Quick Start: Migrasi MySQL ke MongoDB

## Langkah Cepat (5 Menit)

### 1️⃣ Setup MongoDB

```bash
# Install MongoDB (pilih salah satu)
# Ubuntu/Debian:
sudo apt-get install -y mongodb-org

# macOS:
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS
```

### 2️⃣ Setup Environment

```bash
cd /home/yrizzz/Desktop/Porto/frontend

# Copy dan edit .env
cp .env.example .env
nano .env  # atau gunakan editor favorit Anda
```

Tambahkan di `.env`:
```
MONGODB_URI=mongodb://localhost:27017/porto-db
```

### 3️⃣ Backup Data MySQL (PENTING!)

```bash
# Backup database
mysqldump -u root -p nama_database > backup_$(date +%Y%m%d).sql
```

### 4️⃣ Jalankan Migrasi

```bash
cd /home/yrizzz/Desktop/Porto/frontend

# Migrasi data
npx tsx scripts/migrate-data.ts
```

### 5️⃣ Verifikasi

```bash
# Verifikasi data sudah ter-migrate
npx tsx scripts/verify-migration.ts
```

### 6️⃣ Update API Routes

```bash
# Update semua routes ke Mongoose
npx tsx scripts/update-to-mongoose.ts
```

### 7️⃣ Test Aplikasi

```bash
# Start development server
npm run dev

# Buka browser: http://localhost:3000
```

## ✅ Checklist

- [ ] MongoDB terinstall dan berjalan
- [ ] File .env sudah diupdate dengan MONGODB_URI
- [ ] Backup MySQL sudah dibuat
- [ ] Script migrasi berhasil dijalankan
- [ ] Verifikasi menunjukkan semua data match
- [ ] API routes sudah diupdate
- [ ] Aplikasi berjalan normal

## 🆘 Troubleshooting Cepat

### MongoDB tidak bisa connect
```bash
# Cek status
sudo systemctl status mongodb

# Start jika belum jalan
sudo systemctl start mongodb
```

### Error "MONGODB_URI not defined"
```bash
# Pastikan .env ada dan berisi:
echo "MONGODB_URI=mongodb://localhost:27017/porto-db" >> .env
```

### Data tidak match
```bash
# Hapus data MongoDB dan coba lagi
mongosh
use porto-db
db.dropDatabase()
exit

# Jalankan ulang migrasi
npx tsx scripts/migrate-data.ts
```

## 📚 Dokumentasi Lengkap

- **Setup Detail**: Lihat `MONGODB_SETUP.md`
- **Panduan Migrasi**: Lihat `PANDUAN_MIGRASI_DATA.md`
- **Migration Guide**: Lihat `MONGODB_MIGRATION.md`

## 🎯 Hasil yang Diharapkan

Setelah semua langkah selesai:

✅ Semua data dari MySQL sudah ada di MongoDB
✅ Aplikasi berjalan menggunakan MongoDB
✅ Semua API endpoint berfungsi normal
✅ Authentication masih berjalan
✅ CRUD operations berfungsi

## 📞 Bantuan

Jika ada masalah, cek:
1. Log error di console
2. Status MongoDB: `sudo systemctl status mongodb`
3. File .env sudah benar
4. Dokumentasi lengkap di file PANDUAN_MIGRASI_DATA.md
