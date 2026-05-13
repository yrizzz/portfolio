# Package Update: @google/genai

## Overview

Package Gemini AI telah diupdate dari `@google/generative-ai` ke `@google/genai` (official Google Gen AI SDK).

## Alasan Update

### Package Lama (`@google/generative-ai`)
- ❌ Legacy package
- ❌ Tidak support Gemini 2.0+ features
- ❌ API yang lebih kompleks

### Package Baru (`@google/genai`)
- ✅ Official Google Gen AI SDK
- ✅ Support Gemini 2.0+ features
- ✅ API yang lebih simple dan modern
- ✅ Better TypeScript support
- ✅ Designed untuk Gemini Developer API dan Enterprise Agent Platform

## Installation

```bash
# Uninstall old package
npm uninstall @google/generative-ai

# Install new package
npm install @google/genai
```

## API Changes

### Old API (`@google/generative-ai`)

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const result = await model.generateContent(prompt);
const response = await result.response;
const text = response.text();
```

### New API (`@google/genai`)

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey });

const result = await ai.models.generateContent({
  model: 'gemini-1.5-flash',
  contents: prompt,
});

const text = result.text;
```

## Key Differences

| Feature | Old Package | New Package |
|---------|------------|-------------|
| **Import** | `GoogleGenerativeAI` | `GoogleGenAI` |
| **Init** | `new GoogleGenerativeAI(apiKey)` | `new GoogleGenAI({ apiKey })` |
| **Generate** | `model.generateContent(prompt)` | `ai.models.generateContent({ model, contents })` |
| **Response** | `result.response.text()` | `result.text` |
| **TypeScript** | Basic | Enhanced |
| **Gemini 2.0** | ❌ Limited | ✅ Full Support |

## Files Updated

### 1. `/api/endpoints/submit/route.ts`

**Before:**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: modelName });

const result = await model.generateContent(prompt);
const response = await result.response;
const aiResponseText = response.text();
```

**After:**
```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey });

const result = await ai.models.generateContent({
  model: modelName,
  contents: prompt,
});

const aiResponseText = result.text || '';
```

### 2. `/api/gemini/convert/route.ts`

**No changes needed** - Endpoint ini menggunakan REST API langsung, bukan SDK.

### 3. `/api/gemini/models/route.ts`

**No changes needed** - Endpoint ini menggunakan REST API langsung.

## Benefits

### 1. **Simpler API**
- Lebih sedikit boilerplate code
- Lebih intuitive
- Lebih mudah dibaca

### 2. **Better Performance**
- Optimized untuk Gemini 2.0+
- Faster response handling
- Better error handling

### 3. **Modern Features**
- Support untuk streaming
- Support untuk function calling
- Support untuk multimodal inputs
- Better token management

### 4. **Future-Proof**
- Official SDK dari Google
- Regular updates
- Long-term support

## Migration Guide

### Step 1: Update Package

```bash
cd frontend
npm uninstall @google/generative-ai
npm install @google/genai
```

### Step 2: Update Imports

Find and replace in your code:
```typescript
// Old
import { GoogleGenerativeAI } from '@google/generative-ai';

// New
import { GoogleGenAI } from '@google/genai';
```

### Step 3: Update Initialization

```typescript
// Old
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: modelName });

// New
const ai = new GoogleGenAI({ apiKey });
```

### Step 4: Update Generate Calls

```typescript
// Old
const result = await model.generateContent(prompt);
const response = await result.response;
const text = response.text();

// New
const result = await ai.models.generateContent({
  model: modelName,
  contents: prompt,
});
const text = result.text || '';
```

### Step 5: Build & Test

```bash
npm run build
```

## Advanced Features

### Streaming

```typescript
const stream = await ai.models.generateContentStream({
  model: 'gemini-1.5-flash',
  contents: 'Tell me a story',
});

for await (const chunk of stream) {
  console.log(chunk.text);
}
```

### Function Calling

```typescript
const result = await ai.models.generateContent({
  model: 'gemini-1.5-flash',
  contents: 'What is the weather in Tokyo?',
  tools: [{
    functionDeclarations: [{
      name: 'getWeather',
      description: 'Get weather for a location',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' }
        }
      }
    }]
  }]
});
```

### Multimodal

```typescript
const result = await ai.models.generateContent({
  model: 'gemini-1.5-flash',
  contents: [
    { text: 'What is in this image?' },
    { 
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image
      }
    }
  ]
});
```

## Troubleshooting

### Error: "Export GoogleGenerativeAI doesn't exist"

**Solution:** Update import statement
```typescript
// Wrong
import { GoogleGenerativeAI } from '@google/genai';

// Correct
import { GoogleGenAI } from '@google/genai';
```

### Error: "Type 'string' has no properties in common with type 'GoogleGenAIOptions'"

**Solution:** Wrap apiKey in object
```typescript
// Wrong
const ai = new GoogleGenAI(apiKey);

// Correct
const ai = new GoogleGenAI({ apiKey });
```

### Error: "'text' is possibly 'undefined'"

**Solution:** Add fallback
```typescript
// Wrong
const text = result.text;

// Correct
const text = result.text || '';
```

## Documentation

- **Official Docs:** https://googleapis.github.io/js-genai/
- **GitHub:** https://github.com/googleapis/js-genai
- **NPM:** https://www.npmjs.com/package/@google/genai
- **Gemini API:** https://ai.google.dev/gemini-api/docs

## Compatibility

- **Node.js:** 20 or later
- **TypeScript:** 4.5 or later
- **Next.js:** 14+ (tested with 16.2.4)

## Testing

After migration, test all Gemini endpoints:

1. **Settings Page**
   - Load available models
   - Test connection
   - Save settings

2. **Submit Script**
   - Submit a test script
   - Verify AI analysis works

3. **Code Converter**
   - Convert code between languages
   - Verify conversion works

## Rollback

If you need to rollback:

```bash
npm uninstall @google/genai
npm install @google/generative-ai
```

Then revert code changes using git:
```bash
git checkout HEAD -- src/app/api/endpoints/submit/route.ts
```

## Summary

✅ **Completed:**
- Package updated to `@google/genai`
- All endpoints migrated to new API
- Build successful
- TypeScript errors resolved

✅ **Benefits:**
- Simpler, cleaner code
- Better TypeScript support
- Future-proof with Gemini 2.0+ support
- Official Google SDK

✅ **No Breaking Changes:**
- Functionality remains the same
- API key configuration unchanged
- Model selection unchanged
- All features working
