// Test script untuk cek Gemini API key
import { GoogleGenAI } from '@google/genai';

// Test dengan API key langsung
const testApiKey = process.argv[2];

if (!testApiKey) {
  console.error('Usage: node test-gemini.mjs YOUR_API_KEY');
  process.exit(1);
}

console.log('Testing Gemini API with key:', testApiKey.substring(0, 10) + '...');

async function testConnection() {
  try {
    // Initialize dengan cara yang benar: { apiKey: ... }
    const genAI = new GoogleGenAI({ apiKey: testApiKey });
    
    console.log('✓ GoogleGenAI instance created');
    
    // Test dengan model default (gemini-2.5-flash)
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say "Hello" if you can read this.',
    });
    
    console.log('✓ API call successful!');
    console.log('Response:', result.text);
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    if (error.message.includes('API key not valid')) {
      console.error('\nAPI key format mungkin salah. Pastikan:');
      console.error('1. API key dimulai dengan "AIza..."');
      console.error('2. Tidak ada spasi atau karakter tambahan');
      console.error('3. API key aktif di Google AI Studio');
    }
  }
}

testConnection();
