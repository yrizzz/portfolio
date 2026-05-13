# Setup Admin Access - Quick Guide

## Step 1: Login dengan Google
1. Jalankan: `npm run dev`
2. Buka: http://localhost:3000
3. Klik tombol **Login** di header
4. Login dengan akun Google Anda
5. Setelah login, Anda akan redirect ke homepage

## Step 2: Set Role ke ADMIN
Jalankan command ini (ganti dengan email Google Anda):
```bash
npm run make-admin your-email@gmail.com
```

Contoh:
```bash
npm run make-admin yrizzz@gmail.com
```

Output yang benar:
```
✅ User updated to ADMIN:
Email: yrizzz@gmail.com
Name: Your Name
Role: ADMIN
```

## Step 3: Akses Admin Panel
1. Refresh browser (F5)
2. Klik tombol **Admin** di header (akan muncul setelah role ADMIN)
3. Atau langsung ke: http://localhost:3000/admin

## Troubleshooting

### "User not found"
- Pastikan sudah login dulu (Step 1)
- Cek email yang digunakan saat login
- Lihat database: `npx prisma studio`

### "Cannot find module tsx"
```bash
npm install -D tsx
```

### Cek semua users di database:
```bash
npx prisma studio
```
Buka browser → Table "User" → Lihat semua users

## Change App Name (Optional)
Follow: `CHANGE_APP_NAME.md`
