#!/bin/bash

echo "==================================="
echo "Google OAuth Setup"
echo "==================================="
echo ""
echo "Paste your GOOGLE_CLIENT_ID (from Google Cloud Console):"
read CLIENT_ID

echo ""
echo "Paste your GOOGLE_CLIENT_SECRET:"
read CLIENT_SECRET

# Update .env file
cd /media/yrizzz/DATA1/Web/porto/apps/frontend

cat > .env << EOF
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-change-in-production-use-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="$CLIENT_ID"
GOOGLE_CLIENT_SECRET="$CLIENT_SECRET"
EOF

echo ""
echo "✅ .env updated successfully!"
echo ""
echo "Now run: npm run dev"
echo "Then open: http://localhost:3000"
