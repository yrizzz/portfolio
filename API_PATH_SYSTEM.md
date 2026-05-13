# 🔗 API Path System - Structured & Organized

Sistem path terstruktur untuk API Management dengan auto-generation dan validation.

## 📋 Path Format

### Standard Format:
```
/api/{version}/{category}/{endpoint-name}
```

### Examples:
```
/api/v1/tool/phone-checker
/api/v1/ai/text-generator
/api/v1/data/user-info
/api/v1/media/image-resize
/api/v1/social/twitter-post
```

## 🎯 Components

### 1. Version
Available versions:
- `v1` - Current stable version
- `v2` - Next version (future)
- `v3` - Future version

### 2. Category
| Category | Description | Example |
|----------|-------------|---------|
| `tool` | Utility tools & helpers | `/api/v1/tool/phone-checker` |
| `ai` | AI-powered services | `/api/v1/ai/text-generator` |
| `data` | Data processing & retrieval | `/api/v1/data/user-info` |
| `media` | Image, video, audio processing | `/api/v1/media/image-resize` |
| `social` | Social media integrations | `/api/v1/social/twitter-post` |
| `payment` | Payment & transactions | `/api/v1/payment/stripe-checkout` |
| `notification` | Notifications & alerts | `/api/v1/notification/send-email` |
| `auth` | Authentication & authorization | `/api/v1/auth/verify-token` |
| `custom` | Custom endpoints | `/api/v1/custom/my-endpoint` |

### 3. Endpoint Name
Rules:
- Lowercase only
- Use hyphens for spaces
- No special characters
- Descriptive & clear

**Good:**
- `phone-checker`
- `text-generator`
- `user-info`

**Bad:**
- `PhoneChecker` (uppercase)
- `phone_checker` (underscore)
- `phone checker` (space)
- `phone@checker` (special char)

## 🎨 Path Builder UI

### Visual Interface:
```
┌─────────────────────────────────────────────────────┐
│  🔗 API Path Builder                                │
├─────────────────────────────────────────────────────┤
│  Version     │  Category    │  Endpoint Name        │
│  [v1 ▼]      │  [tool ▼]    │  [phone-checker]      │
│              │  Utility...  │  Use lowercase...     │
├─────────────────────────────────────────────────────┤
│  Generated API Path:                                │
│  /api/v1/tool/phone-checker                    ✓   │
│  💡 Example: /api/v1/tool/phone-checker             │
└─────────────────────────────────────────────────────┘
```

### Features:
- ✅ Real-time path generation
- ✅ Auto-validation
- ✅ Visual feedback (green/red)
- ✅ Example paths per category
- ✅ Category descriptions
- ✅ Error messages

## 🔧 Implementation

### Path Generator Function:
```typescript
import { generateApiPath } from '@/lib/api-path-generator';

const path = generateApiPath({
  version: 'v1',
  category: 'tool',
  name: 'Phone Checker'
});
// Result: /api/v1/tool/phone-checker
```

### Path Parser:
```typescript
import { parseApiPath } from '@/lib/api-path-generator';

const parsed = parseApiPath('/api/v1/tool/phone-checker');
// Result: { version: 'v1', category: 'tool', name: 'phone-checker' }
```

### Path Validator:
```typescript
import { validateApiPath } from '@/lib/api-path-generator';

const validation = validateApiPath('/api/v1/tool/phone-checker');
// Result: { valid: true }

const invalid = validateApiPath('/api/tool/phone-checker');
// Result: { valid: false, error: 'Invalid path format...' }
```

## 📝 Usage in Forms

### Create API Form:
1. User enters API name: "Phone Checker"
2. Auto-fills endpoint name: "phone-checker"
3. User selects category: "tool"
4. Path auto-generates: `/api/v1/tool/phone-checker`
5. Real-time validation shows ✓ or error

### Edit API Form:
1. Existing path is parsed
2. Builder fields are populated
3. User can modify any component
4. Path regenerates automatically
5. Validation runs on change

## ✅ Validation Rules

### Valid Paths:
```
✓ /api/v1/tool/phone-checker
✓ /api/v1/ai/text-generator
✓ /api/v2/data/user-info
✓ /api/v1/custom/my-api-123
```

### Invalid Paths:
```
✗ /tool/phone-checker          (missing /api/v1)
✗ /api/tool/phone-checker       (missing version)
✗ /api/v1/invalid/test          (invalid category)
✗ /api/v1/tool/Phone_Checker    (uppercase/underscore)
✗ /api/v1/tool/phone checker    (space)
```

### Error Messages:
- "Path must start with /api/"
- "Invalid path format. Use: /api/v{version}/{category}/{name}"
- "Invalid version. Use: v1, v2, v3"
- "Invalid category. Use: tool, ai, data, ..."
- "Name must contain only lowercase letters, numbers, and hyphens"

## 🎯 Benefits

### Before (Manual Input):
```
User types: /v1/tool/phoneChecker
Problems:
- Inconsistent format
- Typos
- Wrong casing
- Missing /api/ prefix
- Invalid categories
```

### After (Path Builder):
```
User selects:
- Version: v1
- Category: tool
- Name: phone-checker

Auto-generates: /api/v1/tool/phone-checker
Benefits:
✓ Consistent format
✓ No typos
✓ Correct casing
✓ Valid structure
✓ Real-time validation
```

## 🚀 Features

### Auto-Generation:
- Path generates as you type
- Converts to kebab-case automatically
- Adds proper prefixes
- Validates in real-time

### Visual Feedback:
- Green background = valid path
- Red background = invalid path
- Checkmark icon = ready to use
- Error message = what to fix

### Smart Defaults:
- Version defaults to v1
- Category defaults to tool
- Name syncs with API name
- Examples shown per category

## 📊 Category Examples

### Tool APIs:
```
/api/v1/tool/phone-checker
/api/v1/tool/qr-generator
/api/v1/tool/url-shortener
/api/v1/tool/password-generator
```

### AI APIs:
```
/api/v1/ai/text-generator
/api/v1/ai/image-analyzer
/api/v1/ai/sentiment-analysis
/api/v1/ai/translation
```

### Data APIs:
```
/api/v1/data/user-info
/api/v1/data/weather
/api/v1/data/stock-price
/api/v1/data/currency-rate
```

### Media APIs:
```
/api/v1/media/image-resize
/api/v1/media/video-compress
/api/v1/media/audio-convert
/api/v1/media/pdf-generate
```

## 🔒 Best Practices

### DO:
✓ Use descriptive names
✓ Keep names short but clear
✓ Use hyphens for multi-word names
✓ Choose appropriate category
✓ Stick to lowercase

### DON'T:
✗ Use uppercase letters
✗ Use underscores or spaces
✗ Use special characters
✗ Make names too long
✗ Use generic names like "api" or "endpoint"

## 📱 Mobile Responsive

Path Builder adapts to screen size:
- Desktop: 3 columns (version, category, name)
- Tablet: 2 columns
- Mobile: 1 column (stacked)

## 🎨 UI Components

### Path Builder Card:
- Gradient background (blue)
- Border highlight
- Icon indicator (🔗)
- Responsive grid

### Generated Path Display:
- Code block style
- Monospace font
- Color-coded (green/red)
- Copy-friendly format

### Helper Text:
- Category descriptions
- Format hints
- Example paths
- Error messages

## 🔄 Auto-Sync

### Form Integration:
1. API Name field → Auto-fills endpoint name
2. Category selector → Updates path & form category
3. Endpoint name → Regenerates path
4. Version selector → Updates path

### Real-time Updates:
- Path updates on every keystroke
- Validation runs immediately
- Visual feedback instant
- No manual refresh needed

## 📝 Summary

**Path Builder System provides:**
- ✅ Structured & consistent paths
- ✅ Auto-generation from components
- ✅ Real-time validation
- ✅ Visual feedback
- ✅ Category organization
- ✅ Version management
- ✅ Error prevention
- ✅ Better UX

**Result:**
Clean, organized, and professional API paths that follow best practices and are easy to manage!

---

**Updated:** 2026-05-10
**Version:** 1.0
**Status:** ✅ Complete
