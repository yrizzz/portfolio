# 🚀 API Management System - Complete Guide

Sistem manajemen API lengkap dengan CRUD, monitoring, logs, dan AI-powered script submission.

## 📋 Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [User Guide](#user-guide)
5. [API Reference](#api-reference)
6. [Screenshots](#screenshots)

---

## ✨ Features

### 🎯 Core Features
- **Full CRUD Operations** - Create, Read, Update, Delete APIs
- **AI-Powered Submission** - Gemini AI analyzes and adapts scripts
- **Admin Review System** - Approve/reject pending submissions
- **Dynamic Execution** - Run approved APIs in sandboxed environment
- **Real-time Monitoring** - Track performance and usage
- **Comprehensive Logging** - All requests logged with details
- **Settings Management** - Configure Gemini API key and system settings

### 🔒 Security Features
- VM2 sandbox execution
- 30-second timeout protection
- Admin approval required
- Rate limiting per endpoint
- Request logging and monitoring
- Authentication support

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                     │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Dashboard   │  │   API Data   │  │  Monitoring  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Create API  │  │   Edit API   │  │   Settings   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Submit Script│  │ Review Queue │  │   API Logs   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    API Layer (REST)                      │
├─────────────────────────────────────────────────────────┤
│  /api/endpoints      - CRUD operations                   │
│  /api/endpoints/[id] - Single endpoint operations        │
│  /api/endpoints/submit - AI-powered submission           │
│  /api/endpoints/review - Admin review                    │
│  /api/execute/[...path] - Dynamic API execution          │
│  /api/logs           - Request logs                      │
│  /api/analytics      - Monitoring data                   │
│  /api/config         - Settings management               │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Services & Integrations                 │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Gemini AI    │  │  VM2 Sandbox │  │   Prisma     │  │
│  │ (Analysis)   │  │  (Execution) │  │  (Database)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Gemini API Key

### Installation

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Setup Environment Variables**
```bash
# Create .env file
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL="file:./dev.db"
```

3. **Setup Database**
```bash
npx prisma db push
npx prisma generate
```

4. **Run Development Server**
```bash
npm run dev
```

5. **Access Admin Panel**
```
http://localhost:3000/admin/api-management
```

---

## 📖 User Guide

### 1. Dashboard (`/admin/api-management`)

**Overview halaman utama dengan:**
- Total requests (24h)
- Active APIs count
- Success rate percentage
- Average response time
- Quick actions (Create, Submit, Review)
- Recent APIs list
- Recent errors (if any)

### 2. API Data (`/admin/api-management/apis`)

**Manage semua API endpoints:**

**Features:**
- Filter by status, category, enabled, language
- View all APIs in table format
- Toggle enable/disable per API
- Edit or delete APIs
- Quick status indicators

**Actions:**
- Click "Edit" → Edit API page
- Click "Delete" → Confirm and delete
- Toggle switch → Enable/disable API

### 3. Create API (`/admin/api-management/create`)

**Buat API baru secara manual:**

**Form Fields:**
- **Name** - Nama API (required)
- **Path** - URL path (required)
- **Method** - GET, POST, PUT, DELETE, PATCH
- **Category** - tool, ai, data, custom
- **Language** - nodejs, php, go, python
- **Rate Limit** - Requests per minute
- **Description** - Deskripsi API
- **Requires Auth** - Checkbox
- **Enabled** - Checkbox
- **Code** - Script code (required)

**Template Code:**
```javascript
export default {
  name: "myAPI",
  path: "/api/example",
  method: "GET",
  code: async (params) => {
    try {
      const { param1, param2 } = params;
      
      return {
        code: 200,
        status: true,
        message: 'Success',
        data: { param1, param2 }
      };
    } catch (error) {
      return {
        code: 500,
        status: false,
        message: error.message
      };
    }
  }
}
```

### 4. Submit Script (`/submit-api`)

**Submit script dengan AI analysis:**

**Workflow:**
1. Pilih language (nodejs, php, go, python)
2. Paste script di textarea
3. Click "Submit Script"
4. AI (Gemini) akan analyze:
   - Extract metadata
   - Identify security concerns
   - Provide suggestions
   - Adapt code untuk sistem
5. Script masuk pending review

**AI Analysis Output:**
- Name, description, method, path
- Parameters
- Security concerns
- Suggestions
- Adapted code

### 5. Review Queue (`/admin/api-review`)

**Review pending submissions:**

**Features:**
- Filter by status (pending, approved, rejected)
- View AI analysis
- View original & adapted code
- Approve or reject with reason

**Actions:**
- **Approve** → API goes live
- **Reject** → Provide reason
- **View Details** → Modal dengan full info

### 6. Monitoring (`/admin/api-management/monitoring`)

**Track API performance:**

**Metrics:**
- Total requests
- Success rate
- Average response time
- Active endpoints

**Charts:**
- Requests by status code (bar chart)
- Top endpoints (bar chart)
- Recent errors table

**Time Periods:**
- Last 24 hours
- Last 7 days
- Last 30 days

### 7. API Logs (`/admin/api-management/logs`)

**View all request logs:**

**Features:**
- Filter by endpoint
- Pagination (50, 100, 200 per page)
- Real-time refresh

**Log Details:**
- Timestamp
- Endpoint path
- HTTP method
- Status code
- Response time
- IP address
- User agent

### 8. Settings (`/admin/api-management/settings`)

**Configure system:**

**Gemini API Configuration:**
- Input API key
- Test connection
- Save configuration

**System Information:**
- API version
- Database type
- Sandbox engine
- AI provider

**Security Notes:**
- Sandbox info
- Timeout limits
- Approval requirements
- Best practices

---

## 🔌 API Reference

### Endpoints CRUD

#### GET `/api/endpoints`
List all API endpoints with filters.

**Query Parameters:**
- `status` - pending, approved, rejected
- `category` - tool, ai, data, custom
- `enabled` - true, false
- `language` - nodejs, php, go, python

**Response:**
```json
{
  "success": true,
  "endpoints": [
    {
      "id": "...",
      "name": "Phone Checker",
      "path": "/v1/tool/phoneChecker",
      "method": "GET",
      "enabled": true,
      "status": "approved",
      ...
    }
  ]
}
```

#### POST `/api/endpoints`
Create new API endpoint.

**Body:**
```json
{
  "name": "My API",
  "path": "/api/myapi",
  "method": "GET",
  "category": "custom",
  "language": "nodejs",
  "code": "...",
  "requiresAuth": false,
  "rateLimit": 100,
  "enabled": true
}
```

#### GET `/api/endpoints/[id]`
Get single endpoint by ID.

#### PUT `/api/endpoints/[id]`
Update endpoint.

#### DELETE `/api/endpoints/[id]`
Delete endpoint.

### Submit & Review

#### POST `/api/endpoints/submit`
Submit script with AI analysis.

**Body:**
```json
{
  "rawScript": "export default { ... }",
  "language": "nodejs"
}
```

#### GET `/api/endpoints/review`
Get pending submissions.

**Query:** `?status=pending`

#### PATCH `/api/endpoints/review`
Approve or reject submission.

**Body:**
```json
{
  "id": "...",
  "action": "approve",
  "rejectedReason": "..."
}
```

### Execution

#### ANY `/api/execute/[...path]`
Execute approved API dynamically.

**Example:**
```bash
GET /api/execute/v1/tool/phoneChecker?phone=08123456789
```

### Monitoring

#### GET `/api/analytics`
Get analytics data.

**Query:** `?period=24h` (24h, 7d, 30d)

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalRequests": 1234,
    "successRate": 98.5,
    "avgResponseTime": 150
  },
  "requestsByStatus": [...],
  "requestsByEndpoint": [...],
  "recentErrors": [...]
}
```

#### GET `/api/logs`
Get request logs.

**Query:**
- `endpoint` - Filter by endpoint
- `limit` - Results per page
- `offset` - Pagination offset

### Configuration

#### GET `/api/config`
Get site config.

**Query:** `?key=GEMINI_API_KEY`

#### POST `/api/config`
Save config.

**Body:**
```json
{
  "key": "GEMINI_API_KEY",
  "value": "your_api_key"
}
```

---

## 📸 Screenshots

### Dashboard
- Overview stats
- Quick actions
- Recent APIs
- Recent errors

### API Data
- Filterable table
- Enable/disable toggle
- Edit/delete actions

### Create/Edit API
- Form with all fields
- Code editor
- Template button

### Monitoring
- Charts and graphs
- Performance metrics
- Error tracking

### Logs
- Detailed request logs
- Pagination
- Filtering

### Settings
- Gemini API key input
- Test connection
- System info

---

## 🔧 Troubleshooting

### API tidak jalan setelah approved
- Check console logs
- Verify code format
- Test in sandbox manually

### AI analysis gagal
- Check GEMINI_API_KEY di settings
- Verify API quota
- Check script format

### Database error
- Run `npx prisma db push`
- Check DATABASE_URL
- Verify schema.prisma

### Logs tidak muncul
- Check ApiRequest model
- Verify logging in execute route
- Check database connection

---

## 📝 Best Practices

1. **Review Scripts Carefully**
   - Check for malicious code
   - Verify external API calls
   - Test before approving

2. **Set Appropriate Rate Limits**
   - Consider endpoint complexity
   - Monitor usage patterns
   - Adjust as needed

3. **Monitor Regularly**
   - Check error rates
   - Review slow endpoints
   - Track usage trends

4. **Secure Your Keys**
   - Rotate Gemini API key periodically
   - Use environment variables
   - Never commit keys to git

5. **Enable Auth for Sensitive APIs**
   - User data endpoints
   - Write operations
   - Admin functions

---

## 🆘 Support

Untuk pertanyaan atau issues:
- Check dokumentasi ini
- Review API_SUBMISSION_GUIDE.md
- Contact admin

---

## 📄 License

MIT License - See LICENSE file for details
