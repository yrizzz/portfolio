# 🚀 Cara Akses API Examples untuk User

Dokumentasi lengkap cara mengakses dan menggunakan API examples.

## 📍 Lokasi File

```
/home/yrizzz/Desktop/Porto/frontend/examples/
```

## 🎯 Untuk User Ada 3 Cara Akses

### 1️⃣ Via Web Browser (Recommended untuk User)

#### A. Lihat API Documentation
```
URL: http://localhost:3000/api-docs
atau: http://yoursite.com/api-docs
```

User bisa:
- ✅ Lihat semua API yang tersedia
- ✅ Lihat parameter yang dibutuhkan
- ✅ Lihat contoh penggunaan
- ✅ Test API langsung dari browser

#### B. Download API Docs (JSON)
```
URL: http://localhost:3000/api/docs
atau: http://localhost:3000/api/docs?format=openapi
```

Response:
```json
{
  "endpoints": [
    {
      "id": "...",
      "name": "xprofile",
      "method": "GET",
      "path": "/v1/socialmedia/xprofile",
      "params": [...],
      "exampleCode": "..."
    }
  ]
}
```

---

### 2️⃣ Via GitHub/GitLab Repository

Jika project di-push ke GitHub/GitLab:

```
https://github.com/username/repo/tree/main/frontend/examples
```

User bisa:
- ✅ Browse semua template
- ✅ Download template yang dibutuhkan
- ✅ Fork repository
- ✅ Clone dan customize

**File yang harus dibaca:**
1. `START_HERE.md` - Mulai dari sini
2. `README.md` - Dokumentasi lengkap
3. `QUICKSTART.md` - Quick start guide
4. `api-templates/` - Browse templates

---

### 3️⃣ Via Admin Panel (Untuk Developer)

#### A. Submit New API
```
URL: http://localhost:3000/admin/api-submit
```

Steps:
1. Login sebagai admin
2. Buka "API Management" → "Submit New API"
3. Paste code dari template atau upload file
4. AI akan analyze dan extract metadata
5. Review dan submit

#### B. Browse Existing APIs
```
URL: http://localhost:3000/admin/api-dashboard
```

Admin bisa:
- ✅ Lihat semua API
- ✅ Edit API
- ✅ Enable/disable API
- ✅ Review submissions
- ✅ View analytics

---

## 📚 Cara User Menggunakan Examples

### Scenario 1: User Ingin Belajar Format API

**Via Web:**
```
1. Buka: http://yoursite.com/api-docs
2. Lihat contoh API yang ada
3. Klik "View Example" untuk lihat code
4. Copy format yang sesuai
```

**Via GitHub:**
```
1. Buka: https://github.com/username/repo/tree/main/frontend/examples
2. Baca START_HERE.md
3. Browse api-templates/
4. Download template yang dibutuhkan
```

---

### Scenario 2: User Ingin Submit API Baru

**Step 1: Pilih Template**
```bash
# Via GitHub
git clone https://github.com/username/repo.git
cd repo/frontend/examples/api-templates

# Pilih template
cp 01-basic-get.js my-api.js
```

**Step 2: Customize**
```javascript
// Edit my-api.js
export default {
  name: "myapi",
  category: "tool",
  path: "/v1/tool/myapi",
  method: "GET",
  params: [...],
  code: async (params) => {
    // Your logic here
  }
};
```

**Step 3: Submit via Admin Panel**
```
1. Login: http://yoursite.com/login
2. Go to: http://yoursite.com/admin/api-submit
3. Paste code atau upload file
4. Submit
```

---

### Scenario 3: User Ingin Generate Template Otomatis

**Via Local (jika punya akses server):**
```bash
cd /home/yrizzz/Desktop/Porto/frontend/examples
node generate-template.js
```

**Via Web (TODO: Bisa dibuat web interface):**
```
Future feature: Web-based template generator
URL: http://yoursite.com/api-generator
```

---

## 🌐 Public Access Setup

### Option 1: Serve Examples via Static Files

Tambahkan di `next.config.js`:
```javascript
module.exports = {
  async rewrites() {
    return [
      {
        source: '/examples/:path*',
        destination: '/examples/:path*'
      }
    ]
  }
}
```

User bisa akses:
```
http://yoursite.com/examples/START_HERE.md
http://yoursite.com/examples/api-templates/01-basic-get.js
```

---

### Option 2: Create API Docs Page

Buat page baru: `src/app/api-examples/page.tsx`

```typescript
export default function ApiExamplesPage() {
  return (
    <div>
      <h1>API Examples & Templates</h1>
      <p>Browse our collection of API templates</p>
      
      {/* List templates */}
      {/* Show documentation */}
      {/* Download buttons */}
    </div>
  );
}
```

User akses via:
```
http://yoursite.com/api-examples
```

---

### Option 3: GitHub Pages

Deploy examples ke GitHub Pages:

```bash
# Push to GitHub
git add examples/
git commit -m "Add API examples"
git push origin main

# Enable GitHub Pages
# Settings → Pages → Source: main branch → /examples folder
```

User akses via:
```
https://username.github.io/repo/examples/
```

---

## 📖 Documentation URLs

Setelah deploy, user bisa akses:

### Main Documentation
```
/examples/START_HERE.md          - Entry point
/examples/README.md              - Complete docs
/examples/QUICKSTART.md          - Quick start
/examples/INDEX.md               - Master navigation
```

### Templates
```
/examples/api-templates/INDEX.md           - Templates catalog
/examples/api-templates/01-basic-get.js    - Simple GET
/examples/api-templates/02-post-with-body.js - POST JSON
... (9 templates total)
```

### Tools
```
/examples/generate-template.js   - Generator script
/examples/GENERATOR.md           - Generator guide
```

---

## 🔗 Link Examples di Website

Tambahkan link di navigation atau footer:

```typescript
// components/Navigation.tsx
<nav>
  <Link href="/api-docs">API Documentation</Link>
  <Link href="/api-examples">API Examples</Link>
  <Link href="/admin/api-submit">Submit API</Link>
</nav>
```

---

## 📱 Mobile Access

User bisa akses via mobile browser:
```
http://yoursite.com/api-docs
http://yoursite.com/api-examples
```

Atau download via GitHub mobile app.

---

## 💡 Best Practices

### Untuk Public Users:
1. ✅ Provide web-based documentation
2. ✅ Link to GitHub repository
3. ✅ Add download buttons
4. ✅ Show live examples
5. ✅ Add search functionality

### Untuk Developers:
1. ✅ Provide admin panel access
2. ✅ Enable API submission
3. ✅ Show template generator
4. ✅ Add testing tools
5. ✅ Provide CLI access

---

## 🎯 Summary

**User bisa akses via:**

1. **Web Browser** → `http://yoursite.com/api-docs`
2. **GitHub** → `https://github.com/username/repo/tree/main/frontend/examples`
3. **Admin Panel** → `http://yoursite.com/admin/api-submit`
4. **Direct File** → `/home/yrizzz/Desktop/Porto/frontend/examples/`

**File penting untuk user:**
- `START_HERE.md` - Mulai dari sini
- `QUICKSTART.md` - Quick start (5 menit)
- `README.md` - Complete documentation
- `api-templates/` - 9 ready-to-use templates

**Next steps:**
1. Deploy examples ke GitHub
2. Buat API docs page di website
3. Add navigation links
4. Enable public access

---

Made with ❤️ for developers
