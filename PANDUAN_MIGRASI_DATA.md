# Panduan Migrasi Data: MySQL ke MongoDB

## 🎯 Persiapan

### 1. Pastikan MongoDB Sudah Terinstall dan Berjalan

**Cek status MongoDB:**
```bash
# Linux
sudo systemctl status mongodb

# macOS
brew services list | grep mongodb

# Atau coba koneksi langsung
mongosh
```

**Jika belum terinstall:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y mongodb-org

# macOS
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS
```

### 2. Setup Environment Variables

Edit file `.env` di folder `frontend/`:

```bash
# MongoDB Connection (WAJIB)
MONGODB_URI=mongodb://localhost:27017/porto-db

# MySQL Connection (masih diperlukan untuk migrasi)
DATABASE_URL=mysql://user:password@localhost:3306/database_name
```

### 3. Backup Database MySQL (PENTING!)

```bash
# Backup semua data MySQL
mysqldump -u root -p database_name > backup_mysql_$(date +%Y%m%d).sql

# Atau backup dengan Prisma
cd frontend
npx prisma db pull
```

## 🚀 Menjalankan Migrasi Data

### Langkah 1: Jalankan Script Migrasi

```bash
cd /home/yrizzz/Desktop/Porto/frontend

# Jalankan script migrasi
npx tsx scripts/migrate-data.ts
```

Script ini akan:
1. ✅ Koneksi ke MySQL (Prisma)
2. ✅ Koneksi ke MongoDB (Mongoose)
3. ✅ Migrasi semua data dari 16 tabel/collection
4. ✅ Menampilkan progress untuk setiap model
5. ✅ Menampilkan summary hasil migrasi

### Langkah 2: Verifikasi Data di MongoDB

**Menggunakan MongoDB Shell:**
```bash
mongosh

# Pilih database
use porto-db

# Cek collections
show collections

# Cek jumlah data
db.users.countDocuments()
db.projects.countDocuments()
db.apikeys.countDocuments()
db.licenses.countDocuments()

# Lihat sample data
db.users.findOne()
db.projects.find().limit(5)
```

**Menggunakan MongoDB Compass (GUI):**
1. Download dari https://www.mongodb.com/products/compass
2. Connect ke `mongodb://localhost:27017`
3. Browse database `porto-db`
4. Verifikasi semua collections dan data

## 📊 Output yang Diharapkan

Ketika script berjalan dengan sukses, Anda akan melihat:

```
🚀 Starting Data Migration: MySQL → MongoDB
============================================================
✅ Connected to MongoDB
✅ Connected to MySQL (Prisma)

📦 Migrating Users...
   Found 5 users
   ✅ Migrated 5 users

📦 Migrating API Keys...
   Found 3 API keys
   ✅ Migrated 3 API keys

📦 Migrating Licenses...
   Found 2 licenses
   ✅ Migrated 2 licenses

📦 Migrating API Requests...
   Found 1250 API requests
   Progress: 1000/1250
   Progress: 1250/1250
   ✅ Migrated 1250 API requests

... (dan seterusnya untuk semua model)

============================================================
📊 MIGRATION SUMMARY
============================================================
✅ User                      5 records
✅ ApiKey                    3 records
✅ License                   2 records
✅ ApiRequest             1250 records
✅ Project                  10 records
✅ Experience                8 records
✅ Education                 3 records
✅ Skill                    25 records
✅ Article                   5 records
✅ SocialMedia               6 records
✅ SiteConfig               12 records
✅ Account                   5 records
✅ Session                   3 records
✅ VerificationToken         0 records
✅ Contact                  15 records
✅ ApiEndpoint              20 records
============================================================
Total Records Migrated: 1372
Successful Models: 16/16
Failed Models: 0/16
============================================================

✨ Migration completed!
👋 Disconnected from databases
```

## ⚠️ Troubleshooting

### Error: "MONGODB_URI is not defined"
**Solusi:**
```bash
# Pastikan .env file ada dan berisi:
MONGODB_URI=mongodb://localhost:27017/porto-db
```

### Error: "MongoServerError: E11000 duplicate key error"
**Penyebab:** Data sudah ada di MongoDB

**Solusi:**
```bash
# Hapus semua data di MongoDB dan coba lagi
mongosh
use porto-db
db.dropDatabase()
exit

# Jalankan ulang migrasi
npx tsx scripts/migrate-data.ts
```

### Error: "PrismaClient initialization error"
**Solusi:**
```bash
# Generate Prisma client
cd frontend
npx prisma generate

# Coba lagi
npx tsx scripts/migrate-data.ts
```

### Error: "Connection refused" (MongoDB)
**Solusi:**
```bash
# Start MongoDB service
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS

# Cek status
sudo systemctl status mongodb
```

### Error: "Connection refused" (MySQL)
**Solusi:**
```bash
# Pastikan MySQL berjalan
sudo systemctl status mysql

# Cek DATABASE_URL di .env
# Format: mysql://username:password@localhost:3306/database_name
```

## 🔍 Verifikasi Manual

### 1. Cek Jumlah Data

**MySQL:**
```sql
SELECT 
  'users' as table_name, COUNT(*) as count FROM User
UNION ALL
SELECT 'projects', COUNT(*) FROM Project
UNION ALL
SELECT 'api_keys', COUNT(*) FROM ApiKey;
```

**MongoDB:**
```javascript
db.users.countDocuments()
db.projects.countDocuments()
db.apikeys.countDocuments()
```

### 2. Bandingkan Sample Data

**MySQL:**
```sql
SELECT * FROM User LIMIT 1;
SELECT * FROM Project LIMIT 1;
```

**MongoDB:**
```javascript
db.users.findOne()
db.projects.findOne()
```

### 3. Cek Relasi Data

**Contoh: User dengan API Keys**
```javascript
// Ambil user
const user = db.users.findOne()

// Cek API keys user tersebut
db.apikeys.find({ userId: user._id })
```

## 📝 Setelah Migrasi Berhasil

### 1. Update Semua API Routes

```bash
# Jalankan script untuk update routes
npx tsx scripts/update-to-mongoose.ts
```

### 2. Test Aplikasi

```bash
# Start development server
npm run dev

# Test endpoints:
curl http://localhost:3000/api/projects
curl http://localhost:3000/api/experiences
curl http://localhost:3000/api/skills
```

### 3. Update .env (Opsional)

Setelah yakin migrasi berhasil, Anda bisa comment/hapus `DATABASE_URL`:

```bash
# MongoDB (Active)
MONGODB_URI=mongodb://localhost:27017/porto-db

# MySQL (Deprecated - can be removed after verification)
# DATABASE_URL=mysql://user:password@localhost:3306/database
```

### 4. Hapus Prisma Dependencies (Opsional)

Setelah semua berjalan lancar:

```bash
cd frontend

# Uninstall Prisma
npm uninstall @prisma/client prisma @prisma/adapter-mariadb @auth/prisma-adapter

# Hapus folder prisma
rm -rf prisma/

# Update package.json (hapus prisma scripts jika ada)
```

## 🔄 Rollback (Jika Diperlukan)

Jika ada masalah dan ingin kembali ke MySQL:

```bash
# 1. Restore .env
DATABASE_URL=mysql://user:password@localhost:3306/database
# Comment MONGODB_URI

# 2. Revert code changes
git checkout -- src/

# 3. Reinstall dependencies jika sudah dihapus
npm install @prisma/client prisma

# 4. Restart server
npm run dev
```

## 📊 Monitoring Performa

Setelah migrasi, monitor performa:

```javascript
// Di MongoDB shell
db.users.find().explain("executionStats")
db.projects.find({ published: true }).explain("executionStats")

// Cek indexes
db.users.getIndexes()
db.apikeys.getIndexes()
```

## 🎉 Checklist Migrasi

- [ ] Backup database MySQL
- [ ] Install dan start MongoDB
- [ ] Setup MONGODB_URI di .env
- [ ] Jalankan script migrasi
- [ ] Verifikasi jumlah data di MongoDB
- [ ] Verifikasi sample data
- [ ] Update semua API routes
- [ ] Test semua endpoints
- [ ] Test authentication
- [ ] Test CRUD operations
- [ ] Monitor performa
- [ ] Hapus Prisma dependencies (opsional)
- [ ] Update dokumentasi

## 📞 Bantuan

Jika mengalami masalah:
1. Cek log error di console
2. Verifikasi koneksi database
3. Pastikan semua dependencies terinstall
4. Cek file MONGODB_SETUP.md untuk detail lebih lanjut

## 🔗 Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Migration Guide](./MONGODB_MIGRATION.md)
- [Setup Guide](./MONGODB_SETUP.md)
