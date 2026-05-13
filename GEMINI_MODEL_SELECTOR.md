# Gemini Model Selector - Dynamic Model Selection

## Overview

Sistem sekarang mendukung pemilihan model Gemini secara dinamis. Anda bisa melihat semua model yang tersedia untuk API key Anda dan memilih model yang paling sesuai.

## Fitur Baru

### 1. **List Available Models**
- Endpoint baru: `/api/gemini/models`
- Menampilkan semua model yang support `generateContent`
- Menampilkan informasi detail setiap model

### 2. **Model Selector di Settings**
- Dropdown untuk memilih model
- Button "Load Available Models" untuk refresh list
- Default model: `gemini-1.5-flash`

### 3. **Dynamic Model Usage**
- Semua endpoint otomatis menggunakan model yang dipilih
- Tersimpan di database (tidak perlu restart server)
- Fallback ke default jika tidak ada model dipilih

## Cara Menggunakan

### Step 1: Masukkan API Key
```
1. Login sebagai Admin
2. Buka /admin/api-settings
3. Masukkan Gemini API Key
```

### Step 2: Load Available Models
```
1. Klik button "Load Available Models"
2. Sistem akan fetch semua model yang tersedia
3. Dropdown akan terisi dengan model-model yang support generateContent
```

### Step 3: Pilih Model
```
1. Pilih model dari dropdown
2. Klik "Save Settings"
3. Klik "Test Connection" untuk verifikasi
```

### Step 4: Test
```
✅ Gemini API connection successful with gemini-1.5-flash!
```

## Model yang Tersedia (Contoh)

Tergantung API key Anda, model yang tersedia bisa berbeda:

### Gemini 1.5 Series (Recommended)
- **gemini-1.5-flash** ⚡ - Fast, efficient, good for most tasks
- **gemini-1.5-pro** 🎯 - More capable, better for complex tasks
- **gemini-1.5-flash-8b** 💨 - Ultra fast, lightweight

### Gemini 1.0 Series (Legacy)
- **gemini-pro** - Original model (may not be available)
- **gemini-pro-vision** - With vision capabilities

### Gemini 2.0 Series (Experimental)
- **gemini-2.0-flash-exp** - Latest experimental model
- May not be available for all API keys

## File yang Dibuat/Diupdate

### 1. `/lib/gemini.ts` (NEW)
Helper functions untuk get API key dan model:
```typescript
export async function getGeminiApiKey(): Promise<string>
export async function getGeminiModel(): Promise<string>
```

### 2. `/api/gemini/models/route.ts` (NEW)
Endpoint untuk list available models:
```typescript
GET /api/gemini/models
Response: { success: true, models: [...], total: number }
```

### 3. `/api/endpoints/submit/route.ts` (UPDATED)
- Menggunakan `getGeminiModel()` helper
- Dynamic model selection

### 4. `/api/gemini/convert/route.ts` (UPDATED)
- Menggunakan `getGeminiModel()` helper
- Dynamic model selection

### 5. `/admin/api-settings/page.tsx` (UPDATED)
- Model selector dropdown
- Load available models button
- Save model to database
- Test connection with selected model

## Database Schema

Model disimpan di table `siteConfig`:

```sql
INSERT INTO siteConfig (key, value) VALUES 
  ('GEMINI_API_KEY', 'your_api_key'),
  ('GEMINI_MODEL', 'gemini-1.5-flash');
```

## Environment Variables

Anda juga bisa set via `.env`:

```bash
# API Key
GEMINI_API_KEY=your_api_key_here

# Model (optional, default: gemini-1.5-flash)
GEMINI_MODEL=gemini-1.5-flash
```

**Priority:**
1. Environment variable (`.env`)
2. Database (`siteConfig`)
3. Default (`gemini-1.5-flash`)

## Model Comparison

| Model | Speed | Capability | Cost | Best For |
|-------|-------|-----------|------|----------|
| **gemini-1.5-flash** | ⚡⚡⚡ | Good | Free | General tasks, code analysis |
| **gemini-1.5-pro** | ⚡⚡ | Excellent | Free | Complex analysis, better accuracy |
| **gemini-1.5-flash-8b** | ⚡⚡⚡⚡ | Basic | Free | Simple tasks, high volume |
| **gemini-2.0-flash-exp** | ⚡⚡⚡ | Experimental | Free | Testing new features |

## API Endpoints

### List Models
```bash
GET /api/gemini/models
Authorization: Admin only

Response:
{
  "success": true,
  "models": [
    {
      "name": "models/gemini-1.5-flash",
      "displayName": "Gemini 1.5 Flash",
      "description": "Fast and versatile...",
      "version": "001",
      "inputTokenLimit": 1048576,
      "outputTokenLimit": 8192,
      "supportedGenerationMethods": ["generateContent"]
    }
  ],
  "total": 5
}
```

### Save Model
```bash
POST /api/config
Authorization: Admin only

Body:
{
  "key": "GEMINI_MODEL",
  "value": "gemini-1.5-flash"
}
```

## Troubleshooting

### Error: "Model not found"
**Solusi:**
1. Klik "Load Available Models"
2. Pilih model dari list yang muncul
3. Jangan manual ketik nama model

### Error: "Failed to load models"
**Penyebab:**
- API key salah atau expired
- Network issue
- API quota habis

**Solusi:**
1. Verify API key di Google AI Studio
2. Check internet connection
3. Check API quota

### Model List Kosong
**Solusi:**
1. Pastikan API key sudah dimasukkan
2. Klik "Load Available Models" lagi
3. Check console browser untuk error

### Test Connection Gagal
**Penyebab:**
- Model tidak support generateContent
- API key tidak valid untuk model tersebut

**Solusi:**
1. Pilih model lain dari dropdown
2. Regenerate API key
3. Gunakan default model (gemini-1.5-flash)

## Best Practices

### 1. **Pilih Model Sesuai Kebutuhan**
- **Simple tasks**: gemini-1.5-flash-8b
- **General use**: gemini-1.5-flash (recommended)
- **Complex analysis**: gemini-1.5-pro

### 2. **Monitor Performance**
- Check response time di monitoring page
- Switch model jika terlalu lambat
- Balance antara speed dan accuracy

### 3. **Manage Quota**
- Different models have different quota
- Monitor usage di Google AI Studio
- Use caching untuk reduce API calls

### 4. **Testing**
- Always test after changing model
- Verify dengan submit script
- Check code converter functionality

## Migration dari Versi Lama

Jika Anda menggunakan hardcoded model:

### Before:
```typescript
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
```

### After:
```typescript
import { getGeminiModel } from '@/lib/gemini';
const modelName = await getGeminiModel();
const model = genAI.getGenerativeModel({ model: modelName });
```

## Support

Untuk informasi lebih lanjut:
- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Model List](https://ai.google.dev/models/gemini)

## Changelog

### v2.1 (Current)
- ✅ Dynamic model selection
- ✅ List available models endpoint
- ✅ Model selector in settings
- ✅ Save model to database
- ✅ Test connection with selected model

### v2.0
- ✅ Update to gemini-2.0-flash-exp
- ❌ Hardcoded model name

### v1.0
- ✅ Initial Gemini integration
- ❌ Used deprecated gemini-pro
