# 🚀 Quick Start - Admin Setup

## Problem: Email tidak tersimpan di database setelah login

## ✅ FIXED! Sekarang otomatis tersimpan.

---

## Step-by-Step Setup:

### 1️⃣ Login dengan Google
```bash
npm run dev
```
- Buka: http://localhost:3000
- Klik tombol **Login** (icon login di header)
- Login dengan Gmail Anda
- Setelah login, user **otomatis tersimpan** ke database

### 2️⃣ Set Role ke ADMIN

**Option A - Interactive Script (Recommended):**
```bash
cd apps/frontend
./setup-admin.sh
```
Masukkan email Gmail Anda saat diminta.

**Option B - Direct Command:**
```bash
npm run make-admin your-email@gmail.com
```

Contoh:
```bash
npm run make-admin yrizzz@gmail.com
```

### 3️⃣ Access Admin Panel
1. **Refresh browser** (F5 atau Ctrl+R)
2. Lihat tombol **Admin** muncul di header (sebelah theme toggle)
3. Klik tombol Admin atau langsung ke: http://localhost:3000/admin

---

## 🔍 Troubleshooting

### "User not found" saat run make-admin
**Solusi:**
1. Pastikan sudah login dulu (Step 1)
2. Tunggu 2-3 detik setelah login (user sync ke database)
3. Cek console browser untuk log: "✅ User synced to database"
4. Coba lagi command make-admin

### Cek database secara visual:
```bash
npx prisma studio
```
- Buka browser: http://localhost:5555
- Klik table **User**
- Lihat semua users yang terdaftar

### Cek database via command:
```bash
sqlite3 prisma/dev.db "SELECT email, name, role FROM User;"
```

### Admin button tidak muncul
1. Logout: Klik icon logout di header
2. Login lagi
3. Tunggu sync selesai (cek console)
4. Refresh browser

---

## 📝 What Changed?

### New Features:
1. **Auto User Sync** - User otomatis tersimpan ke database saat login
2. **Sync API** - `/api/auth/sync-user` endpoint
3. **Admin Button** - Muncul di header untuk user dengan role ADMIN
4. **Easy Setup Script** - `setup-admin.sh` untuk setup cepat

### Files Modified:
- `src/components/portfolio-layout.tsx` - Added user sync on login
- `src/app/api/auth/sync-user/route.ts` - New API endpoint
- `scripts/make-admin.ts` - Updated to create user if not exists
- `setup-admin.sh` - New interactive setup script

---

## 🎯 Next Steps After Admin Access:

Once you have admin access, you can:
- ✅ Manage Projects (`/admin/projects`)
- ✅ Manage Users (`/admin/users`)
- ✅ Monitor API Requests (`/admin/api-monitoring`)
- ✅ View Dashboard Stats (`/admin`)

Ready to build CRUD operations! 🔥
