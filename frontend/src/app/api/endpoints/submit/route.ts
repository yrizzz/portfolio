import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { ApiEndpoint } from '@/models';
import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey, getGeminiModel } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { rawScript, language = 'nodejs' } = body;

    if (!rawScript) {
      return NextResponse.json(
        { error: 'Script is required' },
        { status: 400 }
      );
    }

    // Get Gemini API key and model
    const apiKey = await getGeminiApiKey();
    const modelName = await getGeminiModel();
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please set it in Settings.' },
        { status: 500 }
      );
    }

    // Initialize Gemini AI with the new SDK (correct way)
    const genAI = new GoogleGenAI({ apiKey });
    
    const prompt = `
Analyze this API script and extract the following information in JSON format:

1. name: API endpoint name
2. description: What this API does
3. method: HTTP method (GET, POST, etc)
4. path: API path (e.g., /v1/tool/phoneChecker)
5. category: API category (tool, ai, data, etc)
6. params: Array of parameters with their details
7. requiresAuth: Does it need authentication?
8. rateLimit: Suggested rate limit per minute
9. security_concerns: Any security issues found
10. suggestions: Improvements or fixes needed
11. adapted_code: The script adapted to work with our system (should be executable Node.js code that exports a handler function)

Original Script:
\`\`\`javascript
${rawScript}
\`\`\`

Return ONLY valid JSON without any markdown formatting or code blocks.
`;

    const result = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    
    const aiResponseText = result.text;
    
    // Parse AI response
    let aiAnalysis;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = (aiResponseText || '')
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      aiAnalysis = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponseText);
      return NextResponse.json(
        { 
          error: 'Failed to analyze script',
          details: 'AI response was not valid JSON',
          rawResponse: aiResponseText
        },
        { status: 500 }
      );
    }

    // Create pending endpoint submission
    const endpoint = await ApiEndpoint.create({
      name: aiAnalysis.name || 'Unnamed API',
      description: aiAnalysis.description || '',
      method: aiAnalysis.method || 'GET',
      path: aiAnalysis.path || '/api/custom',
      category: aiAnalysis.category || 'tool',
      language: language,
      rawScript: rawScript,
      code: aiAnalysis.adapted_code || rawScript,
      aiAnalysis: JSON.stringify(aiAnalysis),
      enabled: false,
      status: 'pending',
      requiresAuth: aiAnalysis.requiresAuth || false,
      rateLimit: aiAnalysis.rateLimit || 100,
      params: JSON.stringify(aiAnalysis.params || []),
      exampleCode: aiAnalysis.example_code || null,
    });

    return NextResponse.json({
      success: true,
      message: 'Script submitted successfully and is pending review',
      endpoint: {
        id: endpoint.id,
        name: endpoint.name,
        status: endpoint.status,
        aiAnalysis: aiAnalysis,
      },
    });

  } catch (error: any) {
    console.error('Error submitting script:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit script',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
