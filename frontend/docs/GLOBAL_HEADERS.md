# Global Headers System

Sistem untuk mengelola header global yang dapat digunakan oleh API endpoints. Setiap user dapat memiliki header global untuk berbagai service (Instagram, TikTok, Twitter, dll).

## Database Schema

**Collection:** `globalheaders`

```typescript
{
  userId: string;          // Email user
  name: string;            // Nama header set
  description?: string;    // Deskripsi
  service: string;         // instagram, tiktok, twitter, facebook, youtube, custom
  headers: Map<string, string>;  // Key-value pairs untuk headers
  isActive: boolean;       // Aktif atau tidak
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### 1. List Global Headers
```
GET /api/global-headers
Query params:
  - service: string (optional) - Filter by service
  - isActive: boolean (optional) - Filter by active status
```

### 2. Get Single Header
```
GET /api/global-headers/:id
```

### 3. Create Global Header
```
POST /api/global-headers
Body:
{
  "name": "Instagram Headers",
  "description": "Headers for Instagram API",
  "service": "instagram",
  "headers": {
    "Cookie": "...",
    "X-Csrftoken": "...",
    ...
  },
  "isActive": true
}
```

### 4. Update Global Header
```
PUT /api/global-headers/:id
Body: (same as create, all fields optional)
```

### 5. Delete Global Header
```
DELETE /api/global-headers/:id
```

## Cara Menggunakan di API Code

Global headers otomatis di-inject ke dalam `params._globalHeaders` saat API dijalankan.

### Contoh Penggunaan:

```javascript
module.exports = async (params) => {
  const axios = require("axios");
  
  // Get global headers untuk Instagram
  const globalHeaders = params._globalHeaders?.instagram || {};
  
  // Default headers (fallback)
  const defaultHeaders = {
    'User-Agent': 'Mozilla/5.0...',
    'Accept': '*/*'
  };
  
  // Merge: global headers akan override default headers
  const headers = { ...defaultHeaders, ...globalHeaders };
  
  // Gunakan headers di request
  const response = await axios.get('https://api.instagram.com/...', {
    headers
  });
  
  return {
    code: 200,
    status: true,
    data: response.data
  };
};
```

## Format `params._globalHeaders`

```javascript
{
  instagram: {
    'Cookie': '...',
    'X-Csrftoken': '...',
    ...
  },
  tiktok: {
    'Cookie': '...',
    ...
  },
  // ... service lainnya
}
```

## Scripts

### 1. Seed Instagram Headers
```bash
npx tsx scripts/seed-instagram-headers.ts
```
Membuat default Instagram headers untuk admin user.

### 2. Update Instagram APIs
```bash
npx tsx scripts/update-instagram-apis.ts
```
Update semua Instagram APIs untuk menggunakan global headers.

## Keuntungan

1. ✅ **Centralized Management** - Kelola semua headers di satu tempat
2. ✅ **Per-User Headers** - Setiap user bisa punya headers sendiri
3. ✅ **Easy Updates** - Update headers tanpa perlu edit code API
4. ✅ **Multiple Services** - Support berbagai service (Instagram, TikTok, dll)
5. ✅ **Fallback Support** - API tetap jalan meski tidak ada global headers
6. ✅ **Active/Inactive** - Bisa disable headers tanpa hapus

## Updated APIs

API yang sudah menggunakan global headers:
- ✅ igprofile
- ✅ igpost
- ✅ igstory
- ✅ ighighlight

## Next Steps

1. Tambahkan UI untuk manage global headers di admin panel
2. Tambahkan support untuk service lain (TikTok, Twitter, dll)
3. Tambahkan validation untuk headers
4. Tambahkan logging untuk tracking penggunaan headers
