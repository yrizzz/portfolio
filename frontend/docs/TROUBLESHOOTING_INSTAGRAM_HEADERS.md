# TROUBLESHOOTING: Instagram Headers Not Configured

## Problem
Getting error when testing Instagram APIs:
```json
{
  "code": 400,
  "status": false,
  "message": "Instagram headers not configured. Please add Instagram headers in Global Headers settings."
}
```

## Root Cause Analysis

The error means `params._globalHeaders.instagram` is undefined or empty in the API code.

This happens when:
1. ❌ User not logged in
2. ❌ Session expired
3. ❌ Global headers not in database
4. ❌ Global headers not active
5. ❌ Cookies not sent with request

## Step-by-Step Fix

### Step 1: Verify You're Logged In

**In Browser Console (F12):**
```javascript
fetch('/api/auth/session')
  .then(r => r.json())
  .then(d => console.log('Session:', d))
```

**Expected:**
```json
{
  "user": {
    "email": "arisedyhandoko@gmail.com",
    "name": "Aris Edy H",
    "role": "ADMIN"
  },
  "expires": "2026-06-17T..."
}
```

**If you get `null` or `{}`:**
- ❌ You're NOT logged in
- ✅ **FIX**: Go to `/login` and login

### Step 2: Verify Global Headers Exist

**In Browser Console:**
```javascript
fetch('/api/global-headers')
  .then(r => r.json())
  .then(d => console.log('Headers:', d))
```

**Expected:**
```json
{
  "success": true,
  "headers": [
    {
      "id": "...",
      "name": "Instagram Default Headers",
      "service": "instagram",
      "isActive": true,
      "headers": {
        "Cookie": "...",
        "X-Csrftoken": "...",
        ...
      }
    }
  ]
}
```

**If you get empty array or error:**
- ❌ Headers not configured
- ✅ **FIX**: Go to `/admin/global-headers` and add Instagram headers

### Step 3: Test Sandbox Directly

**In Browser Console:**
```javascript
fetch('/api/sandbox', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    code: `module.exports = async (params) => {
      return {
        code: 200,
        status: true,
        data: {
          hasGlobalHeaders: !!params._globalHeaders,
          services: Object.keys(params._globalHeaders || {}),
          instagram: params._globalHeaders?.instagram ? 
            Object.keys(params._globalHeaders.instagram) : null
        }
      };
    }`,
    language: 'nodejs',
    testData: {}
  })
})
.then(r => r.json())
.then(d => console.log('Sandbox result:', d))
```

**Expected:**
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
        "instagram": ["Cookie", "X-Csrftoken", ...]
      }
    }
  }
}
```

**If `hasGlobalHeaders` is false:**
- ❌ Headers not injected
- Check terminal logs (where Next.js is running)
- Look for: `[Sandbox] Session check:`, `[Sandbox] Fetching global headers...`

### Step 4: Check Terminal Logs

**In terminal where Next.js is running, you should see:**
```
[Sandbox] Session check: { hasSession: true, hasUser: true, userEmail: 'arisedyhandoko@gmail.com', userRole: 'ADMIN' }
[Sandbox] Fetching global headers for user: arisedyhandoko@gmail.com
[Sandbox] Global headers found: [ 'instagram' ]
[Sandbox] Global headers injected successfully
```

**If you see:**
```
[Sandbox] No user email in session: { ... }
```
- ❌ Session doesn't have email
- ✅ **FIX**: Logout and login again

**If you see:**
```
[Sandbox] No global headers found for user
```
- ❌ Headers not in database for this user
- ✅ **FIX**: Add headers at `/admin/global-headers`

### Step 5: Verify Database

**Run this command:**
```bash
cd frontend
npx tsx scripts/test-global-headers-query.ts
```

**Expected output:**
```
✅ Admin user found:
   Email: arisedyhandoko@gmail.com
   
📊 Found 1 header(s)

1. Instagram Default Headers
   Service: instagram
   Active: true
   Headers count: 9
```

**If no headers found:**
- ❌ Headers not in database
- ✅ **FIX**: Run seed script:
```bash
npx tsx scripts/seed-instagram-headers.ts
```

## Common Scenarios

### Scenario 1: Fresh Install
**Problem**: No headers in database
**Solution**:
```bash
cd frontend
npx tsx scripts/seed-instagram-headers.ts
```

### Scenario 2: Not Logged In
**Problem**: Session is null
**Solution**:
1. Go to `/login`
2. Login with admin credentials
3. Try again

### Scenario 3: Session Expired
**Problem**: Was logged in, now getting 401
**Solution**:
1. Logout
2. Login again
3. Try again

### Scenario 4: Headers Inactive
**Problem**: Headers exist but isActive = false
**Solution**:
1. Go to `/admin/global-headers`
2. Click edit on Instagram headers
3. Check "Active" checkbox
4. Save

### Scenario 5: Wrong Service Name
**Problem**: Headers exist but service != "instagram"
**Solution**:
1. Go to `/admin/global-headers`
2. Edit header
3. Set service = "instagram" (lowercase)
4. Save

## Quick Fix Checklist

- [ ] Logged in to admin panel
- [ ] Session is valid (check with `/api/auth/session`)
- [ ] Global headers exist (check with `/api/global-headers`)
- [ ] Headers are active (isActive = true)
- [ ] Service name is "instagram" (lowercase)
- [ ] User email matches (session email = headers userId)
- [ ] Browser cookies enabled
- [ ] No browser extensions blocking cookies

## Still Not Working?

### Last Resort: Full Reset

```bash
# 1. Clear browser cookies
# In browser: DevTools > Application > Cookies > Clear all

# 2. Logout
# Go to /logout

# 3. Re-seed headers
cd frontend
npx tsx scripts/seed-instagram-headers.ts

# 4. Login again
# Go to /login

# 5. Test
# Go to /admin/api-edit/[id] and click Test Code
```

## Debug Mode

Add this code to test:
```javascript
module.exports = async (params) => {
  console.log('DEBUG params:', {
    keys: Object.keys(params),
    hasGlobalHeaders: !!params._globalHeaders,
    globalHeadersKeys: params._globalHeaders ? Object.keys(params._globalHeaders) : null,
    instagramHeaders: params._globalHeaders?.instagram ? 
      Object.keys(params._globalHeaders.instagram) : null
  });
  
  return {
    code: 200,
    status: true,
    data: params
  };
};
```

Check terminal logs for the DEBUG output.

## Contact Support

If still not working after all steps:
1. Check terminal logs
2. Check browser console logs
3. Run all test scripts
4. Provide logs when asking for help
