#!/bin/bash

echo "🧹 Cleaning sensitive console logs from production code..."
echo ""

# Backup
echo "📦 Creating backup..."
tar -czf /tmp/frontend-backup-$(date +%Y%m%d-%H%M%S).tar.gz /home/yrizzz/Desktop/Porto/frontend/src/app/api 2>/dev/null

cd /home/yrizzz/Desktop/Porto/frontend/src

# Remove console.log that might leak sensitive data
echo "🔍 Removing sensitive console logs..."

# Remove console.log with data/body/params/request/response
find app/api -type f -name "*.ts" -exec sed -i '/console\.log.*\(data\|body\|params\|request\|response\|password\|token\|key\|secret\)/Id' {} \;

# Remove console.log with JSON.stringify
find app/api -type f -name "*.ts" -exec sed -i '/console\.log.*JSON\.stringify/d' {} \;

# Remove console.log in POST/PUT/PATCH handlers (might contain sensitive data)
# Keep console.error for error tracking

echo "✅ Cleaned sensitive console logs"
echo ""
echo "📊 Remaining console statements:"
grep -r "console\." app/api --include="*.ts" | wc -l
echo ""
echo "⚠️  Note: console.error kept for error tracking"
echo "💡 Tip: Use proper logging service in production (e.g., Sentry, LogRocket)"
