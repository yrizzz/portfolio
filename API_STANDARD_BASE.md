# API Standard Base Code

## Standar yang Akan Diterapkan ke Semua API Routes

### 1. Import Structure
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
// ... other imports
```

### 2. Database Connection
- Selalu panggil `await connectDB()` di awal setiap handler jika menggunakan MongoDB
- Letakkan setelah try block dimulai

### 3. Authentication & Authorization
```typescript
const session = await auth();

// For unauthorized (not logged in)
if (!session?.user?.email) {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  );
}

// For forbidden (logged in but no permission)
if (session.user?.role !== 'ADMIN') {
  return NextResponse.json(
    { success: false, error: 'Forbidden - Admin only' },
    { status: 403 }
  );
}
```

### 4. Response Format
**Success Response:**
```typescript
return NextResponse.json({
  success: true,
  data: result,
  // or specific fields like: users, projects, etc.
});
```

**Error Response:**
```typescript
return NextResponse.json(
  { 
    success: false, 
    error: 'User-friendly error message',
    details: error.message // Only in development/for debugging
  },
  { status: 500 } // or appropriate status code
);
```

### 5. Error Handling Structure
```typescript
export async function GET(request: NextRequest) {
  try {
    await connectDB(); // If using MongoDB
    
    const session = await auth();
    // ... auth checks
    
    // ... business logic
    
    return NextResponse.json({
      success: true,
      data: result,
    });
    
  } catch (error: any) {
    console.error('[API_NAME] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform operation',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
```

### 6. Status Codes
- 200: Success
- 400: Bad Request (validation errors)
- 401: Unauthorized (not logged in)
- 403: Forbidden (no permission)
- 404: Not Found
- 500: Internal Server Error

### 7. Validation
```typescript
if (!requiredField) {
  return NextResponse.json(
    { success: false, error: 'Field is required' },
    { status: 400 }
  );
}
```

### 8. Console Logging
```typescript
console.error('[API_NAME] Error:', error);
console.log('[API_NAME] Info:', data);
```

## Files to Update (32 total)
1. /frontend/src/app/api/admin/stats/route.ts
2. /frontend/src/app/api/admin/users/route.ts
3. /frontend/src/app/api/analytics/route.ts
4. /frontend/src/app/api/api-keys/route.ts
5. /frontend/src/app/api/api-keys/toggle/route.ts
6. /frontend/src/app/api/auth/sync-user/route.ts
7. /frontend/src/app/api/config/route.ts
8. /frontend/src/app/api/contact/route.ts
9. /frontend/src/app/api/contact-info/route.ts
10. /frontend/src/app/api/docs/route.ts
11. /frontend/src/app/api/endpoints/route.ts
12. /frontend/src/app/api/endpoints/[id]/route.ts
13. /frontend/src/app/api/endpoints/review/route.ts
14. /frontend/src/app/api/endpoints/submit/route.ts
15. /frontend/src/app/api/execute/[...path]/route.ts
16. /frontend/src/app/api/experiences/route.ts
17. /frontend/src/app/api/experiences/[id]/route.ts
18. /frontend/src/app/api/gemini/convert/route.ts
19. /frontend/src/app/api/gemini/detect-params/route.ts
20. /frontend/src/app/api/gemini/models/route.ts
21. /frontend/src/app/api/gemini/test/route.ts
22. /frontend/src/app/api/licenses/route.ts
23. /frontend/src/app/api/logs/route.ts
24. /frontend/src/app/api/messages/route.ts
25. /frontend/src/app/api/profile/route.ts
26. /frontend/src/app/api/projects/route.ts
27. /frontend/src/app/api/projects/[id]/route.ts
28. /frontend/src/app/api/sandbox/route.ts
29. /frontend/src/app/api/settings/route.ts
30. /frontend/src/app/api/skills/route.ts
31. /frontend/src/app/api/skills/[id]/route.ts
32. /frontend/src/app/api/testimonials/route.ts

Note: /frontend/src/app/api/auth/[...nextauth]/route.ts tidak diubah karena ini adalah NextAuth handler
