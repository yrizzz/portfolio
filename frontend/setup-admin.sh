#!/bin/bash

echo "=================================="
echo "🔧 Admin Setup - YrizzzDev Portfolio"
echo "=================================="
echo ""
echo "Enter your Gmail address (yang dipakai untuk login):"
read EMAIL

if [ -z "$EMAIL" ]; then
  echo "❌ Email tidak boleh kosong!"
  exit 1
fi

echo ""
echo "Setting up admin for: $EMAIL"
echo ""

cd /media/yrizzz/DATA1/Web/porto/apps/frontend

# Run the make-admin script
npm run make-admin "$EMAIL"

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Refresh your browser (F5)"
echo "2. You should see 'Admin' button in header"
echo "3. Click it to access admin panel"
echo ""
echo "If you don't see the button:"
echo "- Logout and login again"
echo "- Check console for errors"
echo ""
