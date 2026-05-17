# Test Global Headers Integration

## Quick Test Steps

### 1. Make sure you're logged in
Open browser and go to: `http://localhost:3000/login`
Login with admin credentials.

### 2. Check session
Open browser console (F12) and run:
```javascript
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log)
```

Expected output:
```json
{
  "user": {
    "email": "arisedyhandoko@gmail.com",
    "name": "Aris Edy H",
    "role": "ADMIN"
  },
  "expires": "..."
}
```

### 3. Check global headers API
```javascript
fetch('/api/global-headers')
  .then(r => r.json())
  .then(console.log)
```

Expected output:
```json
{
  "success": true,
  "headers": [
    {
      "id": "...",
      "name": "Instagram Default Headers",
      "service": "instagram",
      "isActive": true,
      "headers": { ... }
    }
  ]
}
```

### 4. Test sandbox with global headers
```javascript
fetch('/api/sandbox', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: `module.exports = async (params) => {
      return {
        code: 200,
        status: true,
        data: {
          hasGlobalHeaders: !!params._globalHeaders,
          services: Object.keys(params._globalHeaders || {}),
          instagramHeaders: params._globalHeaders?.instagram ? Object.keys(params._globalHeaders.instagram) : []
        }
      };
    }`,
    language: 'nodejs',
    testData: {}
  })
})
.then(r => r.json())
.then(console.log)
```

Expected output:
```json
{
  "success": true,
  "result": {
    "success": true,
    "output": {
      "code": 200,
      "status": true,
      "data": {
        "hasGlobalHeaders": true,
        "services": ["instagram"],
        "instagramHeaders": ["Cookie", "X-Csrftoken", ...]
      }
    }
  }
}
```

### 5. Test Instagram API
Go to: `http://localhost:3000/admin/api-edit/[instagram-api-id]`

Click "Test Code" button.

Check browser console for logs:
- `[Sandbox] Session check: ...`
- `[Sandbox] Fetching global headers for user: ...`
- `[Sandbox] Global headers found: ...`
- `[Sandbox] Global headers injected successfully`

## Troubleshooting

### If you get "Unauthorized"
- You're not logged in
- Session expired
- Not admin user

**Solution**: Login again

### If you get "Instagram headers not configured"
- Global headers not injected
- Check console logs for:
  - `[Sandbox] No user email in session`
  - `[Sandbox] No global headers found for user`

**Solution**: 
1. Make sure you're logged in
2. Check `/admin/global-headers` - headers must exist and be active
3. Check console logs for detailed error

### If headers exist but not working
- Check userId in database matches session email
- Check isActive = true
- Check service = "instagram" (lowercase)

## Debug Commands

### Check database directly
```bash
cd frontend
npx tsx scripts/test-global-headers-query.ts
```

### Check session in terminal
```bash
# This won't work in terminal, must use browser
# Session cookies are httpOnly
```

### Check logs
Look at terminal where Next.js is running for:
```
[Sandbox] Session check: { hasSession: true, hasUser: true, userEmail: '...', userRole: 'ADMIN' }
[Sandbox] Fetching global headers for user: arisedyhandoko@gmail.com
[Sandbox] Global headers found: [ 'instagram' ]
[Sandbox] Global headers injected successfully
```

## Common Issues

### 1. Not Logged In
**Symptom**: 401 Unauthorized
**Fix**: Login at `/login`

### 2. Session Expired
**Symptom**: 401 Unauthorized after some time
**Fix**: Login again

### 3. Headers Not Active
**Symptom**: "Instagram headers not configured"
**Fix**: Go to `/admin/global-headers`, edit header, set Active = true

### 4. Wrong Service Name
**Symptom**: Headers exist but not found
**Fix**: Service must be exactly "instagram" (lowercase)

### 5. Wrong User Email
**Symptom**: Headers exist but not found
**Fix**: userId in globalheaders must match session user email
