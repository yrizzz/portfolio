# API Script Submission System

Sistem untuk submit, review, dan execute API scripts secara dinamis dengan validasi AI menggunakan Gemini.

## 🎯 Fitur Utama

1. **Submit API Script** - User bisa paste script API mereka
2. **AI Analysis** - Gemini AI menganalisis dan mengadaptasi script
3. **Admin Review** - Admin review dan approve/reject submissions
4. **Dynamic Execution** - Approved APIs langsung bisa diakses
5. **Sandbox Security** - Scripts dijalankan dalam VM2 sandbox

## 📋 Workflow

```
User Submit Script → AI Analysis → Pending Review → Admin Approve → API Live
```

## 🚀 Cara Penggunaan

### 1. Submit API Script

Akses halaman: `/submit-api`

Paste script Anda dengan format:

```javascript
export default {
    name: "phoneChecker",
    category: "tool",
    path: "/v1/tool/phoneChecker",
    method: "GET",
    params: [
        {
            name: "phone",
            type: "string",
            required: true
        }
    ],
    description: "Phone number checker",
    code: async (params) => {
        const { phone } = params;
        // Your logic here
        return {
            code: 200,
            status: true,
            data: { phone }
        };
    }
}
```

### 2. AI Analysis

Gemini AI akan otomatis:
- Extract metadata (name, path, method, params)
- Analyze security concerns
- Provide suggestions
- Adapt code untuk sistem kita

### 3. Admin Review

Admin bisa:
- View semua pending submissions di `/admin/api-review`
- Review original script dan adapted code
- Lihat AI analysis
- Approve atau reject dengan reason

### 4. API Execution

Setelah approved, API bisa diakses di:
```
/api/execute/{path}
```

Contoh:
```bash
curl https://yourdomain.com/api/execute/v1/tool/phoneChecker?phone=08123456789
```

## 🔧 Setup

### 1. Environment Variables

Tambahkan ke `.env`:

```env
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Database (sudah ada)
DATABASE_URL="file:./dev.db"
```

### 2. Install Dependencies

```bash
npm install @google/generative-ai vm2
```

### 3. Database Migration

```bash
npx prisma db push
```

## 📁 File Structure

```
frontend/
├── src/app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── submit/route.ts      # Submit script endpoint
│   │   │   └── review/route.ts      # Review & approve/reject
│   │   └── execute/
│   │       └── [...path]/route.ts   # Dynamic API executor
│   ├── submit-api/
│   │   └── page.tsx                 # Submit form UI
│   └── admin/
│       └── api-review/
│           └── page.tsx             # Admin review dashboard
└── prisma/
    └── schema.prisma                # Database schema
```

## 🔒 Security Features

1. **VM2 Sandbox** - Scripts dijalankan dalam isolated environment
2. **Timeout Protection** - 30 detik max execution time
3. **Admin Approval** - Semua scripts harus di-review admin
4. **AI Security Check** - Gemini mengidentifikasi security concerns
5. **Rate Limiting** - Configurable per endpoint

## 📊 Database Schema

```prisma
model ApiEndpoint {
  id             String   @id @default(cuid())
  name           String
  description    String?
  method         String   // GET, POST, PUT, DELETE, PATCH
  path           String   // /api/users, /api/products/:id
  category       String?  // tool, ai, data, etc
  language       String   // go, php, nodejs
  rawScript      String   // Original script
  code           String   // Adapted code
  aiAnalysis     String?  // AI analysis result
  enabled        Boolean  @default(false)
  status         String   @default("pending") // pending, approved, rejected
  requiresAuth   Boolean  @default(false)
  rateLimit      Int      @default(100)
  params         String?  // JSON string
  exampleCode    String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  approvedAt     DateTime?
  approvedBy     String?
  rejectedReason String?
}
```

## 🎨 UI Screenshots

### Submit Page
- Textarea untuk paste script
- Language selector
- AI analysis result display
- Success/error messages

### Admin Review Page
- List semua submissions (pending/approved/rejected)
- Filter tabs
- Detail modal dengan original & adapted code
- Approve/Reject buttons
- AI analysis display

## 🧪 Testing

### Test Submit API

```bash
curl -X POST http://localhost:3000/api/endpoints/submit \
  -H "Content-Type: application/json" \
  -d '{
    "rawScript": "export default { name: \"test\", ... }",
    "language": "nodejs"
  }'
```

### Test Execute API

```bash
curl http://localhost:3000/api/execute/v1/tool/phoneChecker?phone=08123456789
```

## ⚠️ Limitations

1. **VM2 Sandbox** - Tidak semua Node.js modules bisa diakses
2. **Timeout** - Max 30 detik execution time
3. **Memory** - Limited by Node.js process
4. **External APIs** - Harus handle rate limits sendiri

## 🔄 Future Improvements

- [ ] Redis rate limiting
- [ ] API versioning
- [ ] Webhook support
- [ ] API analytics dashboard
- [ ] Auto-generated documentation
- [ ] API testing interface
- [ ] Multi-language support (PHP, Python, Go)

## 📝 Notes

- Semua scripts default `enabled: false` sampai di-approve
- Admin bisa modify code sebelum approve
- AI analysis disimpan untuk reference
- Request logging otomatis ke `ApiRequest` table

## 🆘 Troubleshooting

### Script tidak jalan setelah approved
- Check console logs untuk error
- Pastikan script format sesuai
- Verify sandbox restrictions

### AI analysis gagal
- Check GEMINI_API_KEY di .env
- Verify API quota
- Check script format

### Database error
- Run `npx prisma db push`
- Check DATABASE_URL
- Verify schema.prisma

## 📞 Support

Untuk pertanyaan atau issues, contact admin atau buat issue di repository.
