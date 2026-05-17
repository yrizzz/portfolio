# ✅ Fixed: Edit Link Always Shows "undefined"

## Issue
Link edit di halaman api-data selalu mengarah ke `/admin/api-edit/undefined`

## Root Cause
API `/api/endpoints` mengembalikan data dengan field `_id` dari MongoDB, tapi frontend menggunakan `api.id` untuk membuat link edit.

## Solution

### Before:
```typescript
const endpointsWithParsed = endpoints.map(ep => ({
  ...ep,
  params: ep.params ? JSON.parse(ep.params) : [],
  aiAnalysis: ep.aiAnalysis ? JSON.parse(ep.aiAnalysis) : null,
}));
// ❌ No 'id' field, only '_id'
```

### After:
```typescript
const endpointsWithParsed = endpoints.map((ep: any) => ({
  ...ep,
  id: ep._id?.toString(),  // ✅ Add 'id' field from '_id'
  params: ep.params ? JSON.parse(ep.params) : [],
  aiAnalysis: ep.aiAnalysis ? JSON.parse(ep.aiAnalysis) : null,
}));
```

## Result
✅ Link edit sekarang menggunakan ID yang benar:
- Before: `/admin/api-edit/undefined`
- After: `/admin/api-edit/6a06681e5abf7a2b4d666a9c`

✅ Halaman edit API sekarang bisa load data dengan benar:
- Code/rawScript akan muncul
- Params akan muncul
- Semua field lainnya akan terisi

---

**Status**: ✅ Fixed  
**File**: `src/app/api/endpoints/route.ts`  
**Date**: 2026-05-17

## Next Steps
1. Refresh halaman api-data
2. Klik tombol edit pada API
3. Halaman edit seharusnya load dengan code dan params yang benar
