# 🐛 Troubleshooting: "Failed to Create Endpoint" Error

## Kemungkinan Penyebab & Solusi

### 1. **Authentication Issue** ⚠️

**Cek:**
- Apakah Anda sudah login sebagai ADMIN?
- Session masih valid?

**Solusi:**
```bash
# Cek role user di database
cd frontend
npx prisma studio

# Atau via script
npm run check-users
```

Pastikan user Anda memiliki `role: "ADMIN"`

### 2. **Missing Code Field** 📝

**Cek:**
- Apakah Anda sudah mengisi code di textarea?
- Atau klik tombol "Use Template"?

**Solusi:**
- Klik tombol "Use Template" untuk auto-fill code
- Atau paste code Anda sendiri

### 3. **Invalid Path** 🔗

**Cek:**
- Apakah path builder menunjukkan error (merah)?
- Path harus format: `/api/v1/category/endpoint-name`

**Solusi:**
- Isi "Endpoint Name" di Path Builder
- Pastikan tidak ada error merah
- Lihat checkmark hijau ✓

### 4. **Database Issue** 💾

**Cek:**
```bash
cd frontend
npx prisma db push
npx prisma generate
```

### 5. **Debug dengan Test Page** 🧪

Akses: `http://localhost:3000/admin/test-api-create`

Klik "Test Create API" dan lihat response detail di console.

## Quick Fix Steps:

### Step 1: Cek Browser Console
```
F12 → Console tab
```
Lihat error message detail

### Step 2: Cek Network Tab
```
F12 → Network tab → Filter: Fetch/XHR
```
Klik request `/api/endpoints` → lihat:
- Request payload
- Response

### Step 3: Cek Server Logs
```bash
# Terminal yang running npm run dev
# Lihat console.log output
```

### Step 4: Test dengan Curl
```bash
curl -X POST http://localhost:3000/api/endpoints \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "name": "Test API",
    "method": "GET",
    "path": "/api/v1/tool/test",
    "category": "tool",
    "language": "nodejs",
    "code": "export default { code: async () => ({ status: true }) }",
    "enabled": true
  }'
```

## Common Errors & Solutions:

### Error: "Unauthorized"
**Cause:** Not logged in or not ADMIN
**Fix:** 
```bash
npm run make-admin your@email.com
```

### Error: "Name, method, and path are required"
**Cause:** Missing required fields
**Fix:** Fill all required fields in form

### Error: "Invalid path format"
**Cause:** Path doesn't match `/api/v{version}/{category}/{name}`
**Fix:** Use Path Builder to generate valid path

### Error: "Failed to create endpoint" (500)
**Cause:** Database or server error
**Fix:** 
1. Check server logs
2. Run `npx prisma db push`
3. Restart dev server

## Debugging Checklist:

- [ ] Logged in as ADMIN
- [ ] Path Builder shows green checkmark ✓
- [ ] Code field is filled (not empty)
- [ ] API Name is filled
- [ ] No red error messages
- [ ] Browser console shows no errors
- [ ] Server logs show no errors

## Get Detailed Error:

### Frontend (Browser Console):
```javascript
// Check what's being sent
console.log('Form Data:', formData);
```

### Backend (Server Logs):
```javascript
// Already added in route.ts
console.log('Received body:', body);
console.log('Creating endpoint with data:', {...});
```

## Still Not Working?

1. **Clear browser cache & cookies**
2. **Restart dev server**
   ```bash
   # Kill server
   Ctrl+C
   
   # Start again
   npm run dev
   ```

3. **Check database**
   ```bash
   npx prisma studio
   ```

4. **Use test page**
   Visit: `/admin/test-api-create`

5. **Check error details**
   - Browser Console (F12)
   - Network tab
   - Server terminal logs

---

**Need More Help?**

Share the following:
1. Browser console error
2. Network tab response
3. Server terminal logs
4. Screenshot of form
