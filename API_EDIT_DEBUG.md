# Debug: API Edit Page - Code & Params Empty

## Added Debug Logs

### Backend (API)
File: `src/app/api/endpoints/[id]/route.ts`

Added console.log to see:
- Raw endpoint data from database
- Parsed params
- Final response

### Frontend
File: `src/app/admin/api-edit/[id]/page.tsx`

Added console.log to see:
- API response data
- Parsed endpoint
- FormData being set
- Params being set

## How to Debug

1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to API edit page
4. Look for logs:
   - `[API GET] Endpoint data:` - Backend log
   - `[Edit Page] API Response:` - Frontend log
   - `[Edit Page] Setting formData:` - Form data
   - `[Edit Page] Setting params:` - Params array

## Expected Output

You should see:
```
[API GET] Endpoint data: { code: "...", rawScript: "...", params: "[...]" }
[API GET] Parsed params: [{ name: "...", type: "..." }]
[Edit Page] API Response: { success: true, endpoint: {...} }
[Edit Page] Setting formData: { code: "...", ... }
[Edit Page] Setting params: [{ name: "...", ... }]
```

## Next Steps

Share the console output and I can identify exactly where the data is being lost.

---

**Status**: 🔍 Debugging  
**Date**: 2026-05-17
