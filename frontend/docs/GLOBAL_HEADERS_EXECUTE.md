# Global Headers - API Execute Integration

## 🎯 Overview

Global headers sekarang otomatis ter-inject ke semua API yang dijalankan melalui `/api/execute/[...path]`.

## 🔧 How It Works

### Priority System

Global headers di-inject berdasarkan priority:

1. **Authenticated User** - User yang login
2. **API Key Owner** - Owner dari API key yang digunakan
3. **Endpoint Creator** - User yang membuat endpoint

```javascript
// Priority logic
let userEmailForHeaders = null;

if (authResult.user?.email) {
  userEmailForHeaders = authResult.user.email;
} else if (authResult.apiKey?.userId) {
  userEmailForHeaders = authResult.apiKey.userId;
} else if (endpoint.createdBy) {
  userEmailForHeaders = endpoint.createdBy;
}
```

### Injection Point

Headers di-inject ke `params._globalHeaders` sebelum code execution:

```javascript
// In API code
const globalHeaders = params._globalHeaders?.instagram;

// Use headers
const response = await axios.get(url, { headers: globalHeaders });
```

## 📝 Format

```javascript
params._globalHeaders = {
  instagram: {
    'Cookie': '...',
    'X-Csrftoken': '...',
    // ... other headers
  },
  tiktok: {
    'Cookie': '...',
    // ... other headers
  },
  // ... other services
}
```

## 🧪 Testing

### 1. Test dengan User Login

```bash
# Login dulu, lalu call API
curl -X GET "http://localhost:3000/api/execute/v1/socialmedia/igprofile?username=instagram" \
  -H "Cookie: next-auth.session-token=..."
```

### 2. Test dengan API Key

```bash
curl -X GET "http://localhost:3000/api/execute/v1/socialmedia/igprofile?username=instagram" \
  -H "X-API-Key: your-api-key"
```

### 3. Test Public API (jika endpoint tidak require auth)

```bash
# Will use endpoint creator's global headers
curl -X GET "http://localhost:3000/api/execute/v1/socialmedia/igprofile?username=instagram"
```

## ⚠️ Important Notes

### 1. Authentication Required

Untuk Instagram APIs, pastikan:
- User sudah login, ATAU
- Menggunakan API key yang valid, ATAU
- Endpoint creator punya global headers

### 2. Global Headers Must Be Configured

Jika global headers tidak dikonfigurasi, API akan return:

```json
{
  "code": 400,
  "status": false,
  "message": "Instagram headers not configured. Please add Instagram headers in Global Headers settings."
}
```

### 3. Error Handling

Jika gagal get global headers, API tetap jalan tanpa global headers (graceful degradation).

## 🔐 Security

### Per-User Headers

Setiap user punya headers sendiri:
- User A: Instagram headers A
- User B: Instagram headers B
- API call by User A → uses headers A
- API call by User B → uses headers B

### API Key Inheritance

API key inherit headers dari owner:
- API key created by User A
- API call with that key → uses User A's headers

### Public API Fallback

Public API (no auth required) uses endpoint creator's headers:
- Endpoint created by Admin
- Public call → uses Admin's headers

## 📊 Flow Diagram

```
API Request
    ↓
Check Auth
    ↓
Determine User (priority: user > apiKey owner > creator)
    ↓
Get Global Headers for that user
    ↓
Inject to params._globalHeaders
    ↓
Execute Code
    ↓
Code uses params._globalHeaders.instagram
    ↓
Return Response
```

## 🐛 Troubleshooting

### Error: "Instagram headers not configured"

**Cause**: Global headers tidak ada untuk user tersebut

**Solution**:
1. Login ke admin panel
2. Go to `/admin/global-headers`
3. Add Instagram headers
4. Set service = "instagram"
5. Set status = Active
6. Try API again

### Headers Not Working

**Check**:
1. User email correct?
2. Headers active?
3. Service name correct? (must be "instagram")
4. Headers format correct? (key-value pairs)

### API Returns 401

**Cause**: Authentication required but not provided

**Solution**:
- Login first, OR
- Use valid API key, OR
- Set endpoint.requiresAuth = false

## 💡 Best Practices

1. **Always Configure Headers**
   - Set up global headers before testing APIs
   - Keep headers up-to-date

2. **Use Per-User Headers**
   - Don't share headers between users
   - Each user should have their own

3. **Monitor Header Expiration**
   - Instagram cookies expire
   - Update regularly

4. **Test After Updates**
   - Test APIs after updating headers
   - Verify headers are working

## 📝 Example: Complete Flow

```bash
# 1. Login to admin panel
curl -X POST "http://localhost:3000/api/auth/signin" \
  -d "email=admin@example.com&password=..."

# 2. Add global headers
curl -X POST "http://localhost:3000/api/global-headers" \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Instagram Headers",
    "service": "instagram",
    "headers": {
      "Cookie": "...",
      "X-Csrftoken": "..."
    },
    "isActive": true
  }'

# 3. Test Instagram API
curl -X GET "http://localhost:3000/api/execute/v1/socialmedia/igprofile?username=instagram" \
  -H "Cookie: next-auth.session-token=..."

# 4. Success! Headers automatically injected
```

## 🎯 Summary

- ✅ Global headers auto-inject to all APIs
- ✅ Priority: user > apiKey owner > creator
- ✅ Per-user headers for security
- ✅ Graceful degradation if headers not found
- ✅ Works with authentication and public APIs
- ✅ Easy to configure via admin panel
