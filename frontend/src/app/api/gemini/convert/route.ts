import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey, getGeminiModel } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { code, fromLanguage, toLanguage } = await request.json();

    if (!code || !fromLanguage || !toLanguage) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const apiKey = await getGeminiApiKey();
    const modelName = await getGeminiModel();
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Gemini API key not configured. Please set it in Settings.' 
        },
        { status: 500 }
      );
    }

    // Prompt untuk convert code
    const prompt = `You are an expert code converter. Convert the following ${fromLanguage} code to ${toLanguage}.

IMPORTANT RULES:
1. Return ONLY the converted code, no explanations or markdown
2. Maintain the same logic and functionality
3. Follow ${toLanguage} best practices and conventions
4. Keep the same async/await pattern if applicable
5. Ensure the return format matches: { code: number, status: boolean, message: string, data: any }

Original ${fromLanguage} code:
\`\`\`
${code}
\`\`\`

Convert to ${toLanguage}:`;

    // Initialize Gemini AI with the new SDK (correct way)
    const genAI = new GoogleGenAI({ apiKey });

    // Generate content
    const result = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const convertedCode = result.text;
    
    if (!convertedCode) {
      return NextResponse.json(
        { success: false, error: 'No response from Gemini' },
        { status: 500 }
      );
    }
    
    // Clean up the response (remove markdown if present)
    let cleanedCode = convertedCode.trim();
    
    // Remove markdown code blocks if present
    if (cleanedCode.startsWith('```')) {
      cleanedCode = cleanedCode.replace(/^```[\w]*\n/, '').replace(/\n```$/, '');
    }

    return NextResponse.json({
      success: true,
      convertedCode: cleanedCode,
      fromLanguage,
      toLanguage,
    });

  } catch (error: any) {
    console.error('Convert error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to convert code' },
      { status: 500 }
    );
  }
}
