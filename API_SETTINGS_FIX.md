# API Settings Fix - Gemini API Key & Model Loading

## Problem
API Settings page gagal load models dengan error:
```
❌ Failed to load models: {"error":{"code":400,"message":"API key expired. Please renew the API key."}}
```

## Root Cause
1. API key tidak tersimpan di database sebelum mencoba load models
2. Error handling tidak menampilkan detail error dengan jelas
3. Frontend tidak menyimpan API key terlebih dahulu sebelum fetch models

## Solution Implemented

### 1. Updated Frontend Logic (`/frontend/src/app/admin/api-settings/page.tsx`)
**Changes:**
- Modified `loadAvailableModels()` function to save API key first before fetching models
- Added better error message display with detailed error information

**Before:**
```typescript
const loadAvailableModels = async () => {
  // Langsung fetch models tanpa save API key
  const response = await fetch('/api/gemini/models');
  // ...
}
```

**After:**
```typescript
const loadAvailableModels = async () => {
  // Save API key first
  await fetch('/api/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: 'GEMINI_API_KEY',
      value: geminiKey,
    }),
  });

  // Then fetch models
  const response = await fetch('/api/gemini/models');
  const data = await response.json();
  
  if (data.success) {
    setAvailableModels(data.models);
    setMessage(`✅ Found ${data.total} available models`);
  } else {
    const errorDetails = data.details ? JSON.stringify(data.details) : data.error;
    setMessage(`❌ Failed to load models: ${errorDetails}`);
  }
}
```

### 2. Enhanced Error Handling (`/frontend/src/app/api/gemini/models/route.ts`)
**Changes:**
- Added detailed error information in response
- Include error.response.data if available

**Before:**
```typescript
catch (error: any) {
  return NextResponse.json(
    { success: false, error: error.message || 'Failed to list models' },
    { status: 500 }
  );
}
```

**After:**
```typescript
catch (error: any) {
  console.error('List models error:', error);
  
  return NextResponse.json(
    { 
      success: false, 
      error: error.message || 'Failed to list models',
      details: error.response?.data || error
    },
    { status: 500 }
  );
}
```

## How to Use (Updated Flow)

### Step 1: Enter API Key
1. Navigate to `/admin/api-settings`
2. Paste your Gemini API key in the "Gemini API Key" field
3. The input will automatically sanitize non-ASCII characters

### Step 2: Load Available Models
1. Click "Load Available Models" button
2. System will:
   - Save the API key to database first
   - Then fetch available models from Gemini API
   - Display success message with model count

### Step 3: Select Model
1. Choose your preferred model from the dropdown
2. Models are filtered to only show those supporting `generateContent`

### Step 4: Save Settings
1. Click "Save Settings" to persist both API key and selected model
2. Success message will appear

### Step 5: Test Connection (Optional)
1. Click "Test Connection" to verify the API key works
2. System will test with the selected model

## API Key Requirements

### Valid API Key Format:
- Must be at least 30 characters long
- Should start with a valid prefix (e.g., `AIza...`)
- No special characters or non-ASCII characters
- Properly trimmed (no leading/trailing spaces)

### Get a Valid API Key:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the entire key
4. Paste into the settings page

## Error Messages Explained

### "API key expired. Please renew the API key."
- **Cause:** The API key is no longer valid or has expired
- **Solution:** Generate a new API key from Google AI Studio

### "Gemini API key not configured"
- **Cause:** No API key found in database or environment
- **Solution:** Enter and save a valid API key in settings

### "Invalid API key. Please check and try again."
- **Cause:** API key is too short or invalid format
- **Solution:** Verify you copied the complete API key

### "Unauthorized - Admin only"
- **Cause:** User is not logged in as admin
- **Solution:** Login with admin credentials

## Database Schema

The API key and model are stored in `SiteConfig` table:

```prisma
model SiteConfig {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt
}
```

**Keys used:**
- `GEMINI_API_KEY` - Stores the Gemini API key
- `GEMINI_MODEL` - Stores the selected model name

## Testing

### Test 1: Save API Key
```bash
# Should save successfully
curl -X POST http://localhost:3000/api/config \
  -H "Content-Type: application/json" \
  -d '{"key":"GEMINI_API_KEY","value":"YOUR_API_KEY"}'
```

### Test 2: Load Models
```bash
# Should return list of models
curl http://localhost:3000/api/gemini/models
```

### Test 3: Get Saved Config
```bash
# Should return saved API key
curl http://localhost:3000/api/config?key=GEMINI_API_KEY
```

## Files Modified

1. `/frontend/src/app/admin/api-settings/page.tsx` - Updated load models logic
2. `/frontend/src/app/api/gemini/models/route.ts` - Enhanced error handling

## Status
✅ **FIXED** - API Settings now properly saves API key before loading models and displays detailed error messages.

## Next Steps (If Still Having Issues)

1. **Check API Key Validity:**
   - Verify the API key is active in Google AI Studio
   - Check if there are any usage limits or restrictions

2. **Check Database:**
   ```bash
   # Verify API key is saved
   npx prisma studio
   # Navigate to SiteConfig table
   # Look for GEMINI_API_KEY entry
   ```

3. **Check Server Logs:**
   - Look for detailed error messages in terminal
   - Check for network issues or API rate limits

4. **Regenerate API Key:**
   - If key is expired, generate a new one
   - Delete old key from database
   - Save new key in settings
