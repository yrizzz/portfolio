# Instagram APIs - Header Implementation

## 📋 Overview

Instagram APIs (`igprofile` dan `ighighlight`) sekarang menggunakan header lengkap dari `utils/endpoint.js` sebagai default, dengan kemampuan override menggunakan Global Headers dari database.

## 🔧 Updated APIs

### 1. igprofile (Instagram Profile)
**Path:** `/v1/socialmedia/igprofile`  
**Method:** GET  
**Params:** `username` (required)

**Features:**
- ✅ Full headers dari utils/endpoint.js sebagai default
- ✅ Support global headers override
- ✅ Fetch user ID dari search API
- ✅ Fetch profile data dari GraphQL API

**Example Request:**
```bash
GET /api/v1/socialmedia/igprofile?username=instagram
```

**Response:**
```json
{
  "code": 200,
  "status": true,
  "message": "Success",
  "data": {
    "id": "...",
    "username": "instagram",
    "full_name": "Instagram",
    "biography": "...",
    "profile_pic_url": "...",
    "edge_followed_by": { "count": 123456 },
    "edge_follow": { "count": 123 }
  }
}
```

### 2. ighighlight (Instagram Highlights)
**Path:** `/v1/socialmedia/ighighlight`  
**Method:** GET  
**Params:** `username` (required)

**Features:**
- ✅ Full headers dari utils/endpoint.js sebagai default
- ✅ Support global headers override
- ✅ Fetch user ID dari search API
- ✅ Fetch highlights dari GraphQL API
- ✅ Return structured highlight data

**Example Request:**
```bash
GET /api/v1/socialmedia/ighighlight?username=instagram
```

**Response:**
```json
{
  "code": 200,
  "status": true,
  "message": "Success",
  "data": {
    "username": "instagram",
    "userId": "...",
    "highlights": [
      {
        "id": "...",
        "title": "Highlight Title",
        "cover": "https://..."
      }
    ]
  }
}
```

## 🔑 Headers Implementation

### Default Headers (dari utils/endpoint.js)
```javascript
const defaultHeaders = {
  'Cookie': 'datr=...; ig_did=...; ds_user_id=...; sessionid=...',
  'X-Asbd-Id': '359341',
  'X-Fb-Friendly-Name': 'PolarisStoriesV3TrayContainerQuery',
  'X-Bloks-Version-Id': '41a4871badc8ef00114860033dd42edcd50935d511345a5a37fbaa878479ad3c',
  'X-Csrftoken': 'FCqhHTlNBWHpj5q72pnDIdcIzgdqSOzM',
  'X-Fb-Lsd': 'D9mibKcyJZihK45YuXAXLd',
  'X-Ig-App-Id': '1217981644879628',
  'Content-Type': 'application/x-www-form-urlencoded',
  'x-root-field-name': 'xdt_api__v1__feed__user_timeline_graphql_connection',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};
```

### Header Priority
1. **Global Headers** (dari database) - Highest priority
2. **Default Headers** (dari utils/endpoint.js) - Fallback

### Code Implementation
```javascript
// Default headers
const defaultHeaders = { /* headers dari utils/endpoint.js */ };

// Get global headers (if available)
const globalHeaders = params._globalHeaders?.instagram || {};

// Merge: global headers override defaults
const headers = { ...defaultHeaders, ...globalHeaders };

// Use in request
const response = await axios.get(url, { headers });
```

## 🎯 Benefits

1. ✅ **Always Working** - Default headers memastikan API tetap jalan
2. ✅ **Customizable** - User bisa override dengan global headers
3. ✅ **Centralized** - Headers di utils/endpoint.js mudah diupdate
4. ✅ **Per-User** - Setiap user bisa punya headers sendiri
5. ✅ **No Breaking Changes** - Backward compatible

## 🔄 How It Works

### Without Global Headers
```
Request → Use Default Headers → Instagram API → Response
```

### With Global Headers
```
Request → Merge (Global + Default) → Instagram API → Response
```

## 📝 Update Global Headers

### Via Admin Panel
1. Go to `/admin/global-headers`
2. Edit Instagram headers
3. Update Cookie, X-Csrftoken, atau header lainnya
4. Save changes
5. API akan otomatis menggunakan header baru

### Via API
```bash
PUT /api/global-headers/:id
Content-Type: application/json

{
  "headers": {
    "Cookie": "new_cookie_value",
    "X-Csrftoken": "new_csrf_token"
  }
}
```

## 🧪 Testing

### Test igprofile
```bash
# Test dengan username populer
curl "http://localhost:3000/api/v1/socialmedia/igprofile?username=instagram"

# Expected: Profile data dengan followers, following, posts, dll
```

### Test ighighlight
```bash
# Test dengan username yang punya highlights
curl "http://localhost:3000/api/v1/socialmedia/ighighlight?username=instagram"

# Expected: Array of highlights dengan id, title, cover
```

## ⚠️ Important Notes

1. **Cookie Expiration**: Instagram cookies bisa expire, perlu update berkala
2. **Rate Limiting**: Instagram punya rate limit, jangan spam request
3. **CSRF Token**: X-Csrftoken harus match dengan Cookie
4. **Session ID**: sessionid di Cookie harus valid

## 🔧 Maintenance

### Update Headers di utils/endpoint.js
1. Login ke Instagram di browser
2. Open DevTools → Network tab
3. Refresh halaman
4. Copy headers dari request
5. Update `utils/endpoint.js`
6. Restart server

### Update Global Headers
1. Go to `/admin/global-headers`
2. Edit Instagram headers
3. Paste new headers
4. Save

## 📊 Monitoring

Check API logs untuk error:
- `401 Unauthorized` → Cookie expired
- `429 Too Many Requests` → Rate limited
- `404 Not Found` → Username tidak ada

## 🚀 Next Steps

1. ⏳ Add automatic cookie refresh
2. ⏳ Add rate limiting protection
3. ⏳ Add caching untuk reduce requests
4. ⏳ Add more Instagram endpoints (stories, posts, reels)
5. ⏳ Add error handling untuk expired cookies

## 📞 Support

Jika API tidak bekerja:
1. Check headers di `/admin/global-headers`
2. Verify Cookie masih valid
3. Check Instagram rate limits
4. Update headers dari browser
