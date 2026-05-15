#!/bin/bash

echo "🔧 Fixing all remaining Prisma routes to Mongoose..."

# List of files to fix
files=(
  "src/app/api/analytics/route.ts"
  "src/app/api/api-keys/route.ts"
  "src/app/api/api-keys/toggle/route.ts"
  "src/app/api/licenses/route.ts"
  "src/app/api/licenses/toggle-renew/route.ts"
  "src/app/api/endpoints/route.ts"
  "src/app/api/endpoints/[id]/route.ts"
  "src/app/api/endpoints/review/route.ts"
  "src/app/api/endpoints/submit/route.ts"
  "src/app/api/projects/[id]/route.ts"
  "src/app/api/experiences/[id]/route.ts"
  "src/app/api/config/route.ts"
  "src/app/api/contact/route.ts"
  "src/app/api/auth/sync-user/route.ts"
  "src/app/api/docs/route.ts"
  "src/app/api/execute/[...path]/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  Processing: $file"
    
    # Replace import prisma with connectDB and models
    sed -i "s/import { prisma } from '@\/lib\/prisma'/import { connectDB } from '@\/lib\/mongodb'/g" "$file"
    
    # Add connectDB() at start of functions if not present
    # This is complex, will be done manually for critical files
    
  else
    echo "  ⚠️  Not found: $file"
  fi
done

echo "✅ Basic replacements done. Manual review needed for complex queries."
