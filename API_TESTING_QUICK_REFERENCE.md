# API Testing Quick Reference

## Test All APIs
```bash
bash /tmp/comprehensive-test.sh
```

## Test Specific Categories

### Social Media APIs
```bash
# X (Twitter) Profile
curl "http://localhost:3000/api/execute/v1/socialmedia/xprofile?username=twitter"

# Instagram Profile
curl "http://localhost:3000/api/execute/v1/socialmedia/igprofile?username=instagram"

# TikTok Profile
curl "http://localhost:3000/api/execute/v1/socialmedia/ttprofile?username=tiktok"
```

### AI APIs
```bash
# ChatGPT
curl "http://localhost:3000/api/execute/v1/ai/chatGpt?prompt=Hello"

# Blackbox AI
curl "http://localhost:3000/api/execute/v1/ai/blackboxAi?prompt=Hello"
```

### Domain APIs
```bash
# WHOIS
curl "http://localhost:3000/api/execute/v1/domain/whois?domain=google.com"

# DNS Records
curl "http://localhost:3000/api/execute/v1/domain/dnsrecord?domain=google.com"
```

### Game APIs
```bash
# Mobile Legends
curl "http://localhost:3000/api/execute/v1/game/checkUsernameMobileLegends?gameId=123456789&zoneId=1234"

# Free Fire
curl "http://localhost:3000/api/execute/v1/game/checkUsernameFreeFire?gameId=123456789"
```

### Tool APIs
```bash
# Translate
curl "http://localhost:3000/api/execute/v1/tool/translate?text=hello&to=id"

# Screenshot
curl "http://localhost:3000/api/execute/v1/tool/ssweb?url=https://google.com"
```

## Success Criteria
- HTTP Status: 200
- Response contains: `"status": true`
- Response contains: `"message": "Success"`

## Current Status
- ✅ **34 APIs Working** (97.1%)
- ❌ **1 API Failed** (YouTube DL - external dependency)
- 📦 **35 Total APIs**

## Scripts Location
- Import Script: `frontend/scripts/import-api-endpoints.mjs`
- Fix Scripts: `frontend/scripts/fix-*.mjs`
- Test Script: `/tmp/comprehensive-test.sh`
- Quick Test: `/tmp/final-test.sh`

## Database
All APIs stored in `ApiEndpoint` table with:
- Status: approved
- Enabled: true
- Rate Limit: 100 requests
- Language: nodejs

## Execution Endpoint
All APIs accessible via:
```
/api/execute/v1/{category}/{endpoint}
```

Example:
```
/api/execute/v1/socialmedia/xprofile?username=twitter
```
