#!/bin/bash

echo "Testing imported APIs..."
echo ""

# Test 1: Gemini AI
echo "1. Testing Gemini AI endpoint:"
curl -s "http://localhost:3000/api/execute/v1/ai/geminiAi?prompt=Hello" | jq -r '.data' | head -3
echo ""

# Test 2: Domain WHOIS
echo "2. Testing WHOIS endpoint:"
curl -s "http://localhost:3000/api/execute/v1/domain/whois?domain=google.com" | jq '.status, .message'
echo ""

# Test 3: Game Username Check
echo "3. Testing Mobile Legends username check:"
curl -s "http://localhost:3000/api/execute/v1/game/checkUsernameMobileLegends?gameId=123456789&zoneId=1234" | jq '.status, .message'
echo ""

echo "Test completed!"
