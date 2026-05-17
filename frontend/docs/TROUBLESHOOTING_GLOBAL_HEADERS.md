# Troubleshooting: Global Headers Kosong

## ❌ Problem
Halaman `/admin/global-headers` menampilkan kosong atau tidak ada data.

## 🔍 Root Cause
Ada beberapa kemungkinan:

### 1. User Belum Login ⚠️ (PALING SERING)
API endpoint `/api/global-headers` memerlukan authentication. Jika user belum login, API akan return:
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 2. Session Expired
Session NextAuth bisa expire setelah beberapa waktu.

### 3. Data Belum Di-seed
Data Instagram headers belum di-seed ke database.

## ✅ Solutions

### Solution 1: Login ke Admin Panel
1. Buka browser
2. Navigate ke: `http://localhost:3000/login`
3. Login dengan credentials admin:
   - Email: `arisedyhandoko@gmail.com`
   - Password: (your password)
4. Setelah login, navigate ke: `http://localhost:3000/admin/global-headers`
5. Data seharusnya muncul

### Solution 2: Check Session
Buka browser console (F12) dan check:
```javascript
// Check if session exists
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log)
```

Jika return `null` atau `{}`, berarti belum login.

### Solution 3: Verify Data Exists
Run script untuk check data di database:
```bash
cd frontend
npx tsx scripts/check-global-headers.ts
```

Expected output:
```
✅ Global headers found:

1. Instagram Default Headers
   User: arisedyhandoko@gmail.com
   Service: instagram
   Active: true
   Headers count: 9
```

### Solution 4: Re-seed Data (if needed)
Jika data tidak ada, run seed script:
```bash
cd frontend
npx tsx scripts/seed-instagram-headers.ts
```

## 🧪 Testing

### Test 1: Check if logged in
```bash
# Open browser console
fetch('/api/auth/session').then(r => r.json()).then(console.log)

# Expected (if logged in):
{
  user: {
    email: "arisedyhandoko@gmail.com",
    name: "Aris Edy H",
    role: "ADMIN"
  },
  expires: "..."
}

# Expected (if NOT logged in):
null
```

### Test 2: Test API directly (after login)
```bash
# Open browser console (after login)
fetch('/api/global-headers')
  .then(r => r.json())
  .then(console.log)

# Expected:
{
  success: true,
  headers: [
    {
      id: "...",
      name: "Instagram Default Headers",
      service: "instagram",
      headers: { ... },
      isActive: true
    }
  ]
}
```

### Test 3: Check database directly
```bash
cd frontend
npx tsx scripts/debug-global-headers.ts
```

## 📊 Verification Checklist

- [ ] User sudah login ke admin panel
- [ ] Session masih valid (tidak expired)
- [ ] Data exists di database (run check script)
- [ ] API endpoint accessible (return 200, bukan 401)
- [ ] Browser console tidak ada error

## 🔧 Quick Fix

**Paling cepat:**
1. Logout dari admin panel
2. Login lagi
3. Navigate ke `/admin/global-headers`
4. Data seharusnya muncul

## 📝 Notes

- API `/api/global-headers` **REQUIRES** authentication
- Hanya user dengan role `ADMIN` yang bisa akses
- Data di-filter per user (userId = user.email)
- Session NextAuth default expire setelah 30 hari

## 🐛 Still Not Working?

Check browser console untuk error messages:
1. Open DevTools (F12)
2. Go to Console tab
3. Refresh halaman `/admin/global-headers`
4. Look for error messages (red text)
5. Check Network tab untuk API calls

Common errors:
- `401 Unauthorized` → Not logged in
- `403 Forbidden` → Not admin
- `500 Internal Server Error` → Server issue
- `Failed to fetch` → Server not running

## 💡 Prevention

Untuk menghindari masalah ini di future:
1. Always login before accessing admin pages
2. Check session status di UI (show user info)
3. Add loading states di UI
4. Add error messages di UI
5. Add "Login required" message jika 401
