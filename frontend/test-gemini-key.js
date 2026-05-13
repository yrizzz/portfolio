// Test script to verify Gemini API key
const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCd-gn3vu8UTk_7AMLd1Zlkn5HZhSpDNM8';

async function testGeminiKey() {
  try {
    console.log('Testing API Key:', apiKey.substring(0, 20) + '...');
    
    const genAI = new GoogleGenAI({ apiKey });
    
    // Try to list models
    console.log('\n1. Testing model listing...');
    const modelsResponse = await genAI.models.list();
    
    const modelsList = [];
    for await (const model of modelsResponse) {
      modelsList.push(model.name);
    }
    
    console.log('✅ Success! Found', modelsList.length, 'models');
    console.log('Available models:', modelsList.slice(0, 5).join(', '));
    
    // Try to generate content
    console.log('\n2. Testing content generation...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Say hello');
    const text = result.text;
    
    console.log('✅ Success! Response:', text.substring(0, 50) + '...');
    
    console.log('\n✅ API Key is VALID and working!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    console.error('\nFull error:', error);
  }
}

testGeminiKey();
