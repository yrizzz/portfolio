# Global Headers - Complete Guide

## 🎯 Overview

Sistem Global Headers memungkinkan setiap user untuk mengelola headers HTTP yang akan otomatis di-inject ke dalam API requests. Sangat berguna untuk API yang memerlukan authentication headers seperti Instagram, TikTok, Twitter, dll.

## 📁 File Structure

```
frontend/
├── src/
│   ├── models/
│   │   └── GlobalHeader.ts          # Database schema
│   ├── lib/
│   │   └── global-headers.ts        # Helper functions
│   ├── app/
│   │   ├── api/
│   │   │   ├── global-headers/
│   │   │   │   ├── route.ts         # GET, POST
│   │   │   │   └── [id]/route.ts    # GET, PUT, DELETE
│   │   │   └── sandbox/route.ts     # Inject headers
│   │   └── admin/
│   │       └── global-headers/
│   │           ├── page.tsx         # List page
│   │           ├── create/page.tsx  # Create page
│   │           └── edit/[id]/page.tsx # Edit page
├── scripts/
│   ├── seed-instagram-headers.ts    # Seed default headers
│   └── update-instagram-apis.ts     # Update APIs
└── docs/
    └── GLOBAL_HEADERS.md            # Documentation
```

## 🚀 Quick Start

### 1. Seed Instagram Headers (Already Done)
```bash
npx tsx scripts/seed-instagram-headers.ts
```

### 2. Access Admin Panel
Navigate to: `http://localhost:3000/admin/global-headers`

### 3. Create New Header
- Click "Add Header" button
- Fill in the form:
  - **Name**: e.g., "Instagram Headers"
  - **Service**: Select from dropdown (instagram, tiktok, etc)
  - **Headers**: Add key-value pairs
- Click "Create Header"

## 📋 Features

### ✅ List Page (`/admin/global-headers`)
- View all global headers
- Filter by service (instagram, tiktok, twitter, etc)
- See active/inactive status
- Quick actions: Edit, Delete, Toggle Active
- Preview headers in expandable section

### ✅ Create Page (`/admin/global-headers/create`)
- Form untuk create header baru
- Service selector
- Dynamic header fields (add/remove)
- Preset loader untuk Instagram, TikTok, Twitter
- Active/Inactive toggle

### ✅ Edit Page (`/admin/global-headers/edit/:id`)
- Update existing headers
- Same features as create page
- Load existing data

## 🔧 API Endpoints

### GET /api/global-headers
List all headers for current user
```bash
# All headers
GET /api/global-headers

# Filter by service
GET /api/global-headers?service=instagram

# Filter by active status
GET /api/global-headers?isActive=true
```

### POST /api/global-headers
Create new header
```json
{
  "name": "Instagram Headers",
  "description": "Default headers for Instagram",
  "service": "instagram",
  "headers": {
    "Cookie": "...",
    "X-Csrftoken": "..."
  },
  "isActive": true
}
```

### GET /api/global-headers/:id
Get single header

### PUT /api/global-headers/:id
Update header
```json
{
  "name": "Updated Name",
  "isActive": false
}
```

### DELETE /api/global-headers/:id
Delete header

## 💻 Usage in API Code

Headers otomatis di-inject ke `params._globalHeaders`:

```javascript
module.exports = async (params) => {
  const axios = require("axios");
  
  // Get global headers for Instagram
  const globalHeaders = params._globalHeaders?.instagram || {};
  
  // Default headers (fallback)
  const defaultHeaders = {
    'User-Agent': 'Mozilla/5.0...',
    'Accept': '*/*'
  };
  
  // Merge (global headers override defaults)
  const headers = { ...defaultHeaders, ...globalHeaders };
  
  // Use in request
  const response = await axios.get(url, { headers });
  
  return {
    code: 200,
    status: true,
    data: response.data
  };
};
```

## 🎨 UI Components

### List Page Features:
- ✅ Service badges with colors
- ✅ Active/Inactive indicators
- ✅ Headers count
- ✅ Last updated timestamp
- ✅ Expandable headers preview
- ✅ Quick toggle active/inactive
- ✅ Edit and delete buttons

### Create/Edit Page Features:
- ✅ Service selector
- ✅ Dynamic header fields
- ✅ Add/Remove header rows
- ✅ Preset loader (Instagram, TikTok, Twitter)
- ✅ Active toggle
- ✅ Form validation
- ✅ Loading states

## 📊 Database Schema

```typescript
{
  userId: string;              // User email
  name: string;                // Header set name
  description?: string;        // Optional description
  service: string;             // instagram, tiktok, twitter, etc
  headers: Map<string, string>; // Key-value pairs
  isActive: boolean;           // Active status
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔐 Security

- ✅ Only authenticated users can access
- ✅ Users can only see/edit their own headers
- ✅ Headers are stored securely in database
- ✅ Validation on create/update

## 📝 Updated APIs

APIs yang sudah support global headers:
- ✅ `igprofile` - Instagram Profile
- ✅ `igpost` - Instagram Post
- ✅ `igstory` - Instagram Story
- ✅ `ighighlight` - Instagram Highlight

## 🎯 Next Steps

1. ✅ UI untuk CRUD global headers - **DONE**
2. ✅ Menu di sidebar admin - **DONE**
3. ✅ Preset loader untuk service populer - **DONE**
4. ⏳ Add more service presets (TikTok, Twitter, Facebook)
5. ⏳ Add header validation
6. ⏳ Add usage logging
7. ⏳ Add header testing feature

## 🐛 Troubleshooting

### Headers tidak terdeteksi di API
- Pastikan header isActive = true
- Pastikan service name sesuai (instagram, tiktok, dll)
- Check di API code: `params._globalHeaders?.instagram`

### Error saat create/update
- Pastikan semua required fields terisi
- Pastikan minimal 1 header key-value pair
- Check console untuk error details

## 📞 Support

Jika ada masalah atau pertanyaan, check:
1. Console logs di browser
2. Server logs
3. Database collection `globalheaders`
