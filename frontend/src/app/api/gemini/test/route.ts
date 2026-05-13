import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const { apiKey, model } = await request.json();
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'API key is required' 
        },
        { status: 400 }
      );
    }

    // Sanitize API key - remove whitespace and non-ASCII characters
    const cleanApiKey = apiKey.trim().replace(/[^\x00-\x7F]/g, '');
    
    console.log('[Test Connection] API key length:', cleanApiKey.length);
    console.log('[Test Connection] API key preview:', cleanApiKey.substring(0, 10) + '...');
    
    if (cleanApiKey.length < 30) {
      return NextResponse.json({
        success: false,
        error: 'API key appears to be invalid (too short)',
      });
    }

    // Initialize Gemini AI with the provided API key (correct way)
    const genAI = new GoogleGenAI({ apiKey: cleanApiKey });
    
    // Test with a simple prompt
    const modelName = model || 'gemini-2.5-flash';
    
    try {
      const result = await genAI.models.generateContent({
        model: modelName,
        contents: 'Say "Hello" if you can read this.',
      });

      const text = result.text;
      
      if (text) {
        return NextResponse.json({
          success: true,
          message: `Connection successful with ${modelName}!`,
          response: text,
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'No response from Gemini API',
        });
      }
    } catch (apiError: any) {
      // Handle specific API errors
      console.error('[Test Connection] API Error:', apiError);
      return NextResponse.json({
        success: false,
        error: apiError.message || 'Failed to connect to Gemini API',
      });
    }

  } catch (error: any) {
    console.error('Test connection error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to test connection' },
      { status: 500 }
    );
  }
}
