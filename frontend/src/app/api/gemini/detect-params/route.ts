import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey, getGeminiModel } from '@/lib/gemini';
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

    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Code is required' },
        { status: 400 }
      );
    }

    const apiKey = await getGeminiApiKey();
    const model = await getGeminiModel();
    
    console.log('[Detect Params] API key retrieved, length:', apiKey?.length || 0);
    console.log('[Detect Params] API key exists:', !!apiKey);
    
    if (!apiKey) {
      console.error('[Detect Params] No API key found!');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Gemini API key not configured. Please set it in Settings.' 
        },
        { status: 500 }
      );
    }

    console.log('[Detect Params] Using model:', model);
    console.log('[Detect Params] Code length:', code.length);

    // Validate code length
    if (code.length > 50000) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Code is too long. Please limit to 50,000 characters.' 
        },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenAI({ apiKey });

    const prompt = `Analyze this code and extract all parameters that are used or expected.
Return a JSON array of parameters with this exact structure:
[
  {
    "name": "parameter_name",
    "type": "string|number|boolean|array|object",
    "required": true|false,
    "description": "brief description of what this parameter does"
  }
]

Code to analyze:
\`\`\`
${code}
\`\`\`

Rules:
1. Look for parameters in function arguments, destructuring, or variable usage
2. Detect the type based on how it's used (string operations, math operations, etc.)
3. Mark as required if the code will fail without it
4. Provide clear, concise descriptions
5. Return ONLY the JSON array, no markdown, no explanation
6. If no parameters found, return empty array []`;

    console.log('[Detect Params] Sending request to Gemini...');
    console.log('[Detect Params] Prompt length:', prompt.length);
    
    const result = await genAI.models.generateContent({
      model,
      contents: prompt,
    });
    
    console.log('[Detect Params] Received response from Gemini');
    const responseText = result.text;
    
    if (!responseText) {
      return NextResponse.json(
        { success: false, error: 'No response from Gemini' },
        { status: 500 }
      );
    }
    
    // Clean response
    let cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    // Parse the response
    let parameters;
    try {
      parameters = JSON.parse(cleanedResponse);
      
      // Validate structure
      if (!Array.isArray(parameters)) {
        throw new Error('Response is not an array');
      }
      
      // Ensure all parameters have required fields
      parameters = parameters.map(param => ({
        name: param.name || '',
        type: param.type || 'string',
        required: param.required !== undefined ? param.required : false,
        description: param.description || '',
        default: '' // Add empty default value
      }));
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to parse parameter detection results',
          rawResponse: responseText
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      parameters,
      message: `Detected ${parameters.length} parameter(s)`
    });

  } catch (error: any) {
    console.error('Detect parameters error:', error);
    
    // Extract detailed error information
    let errorMessage = error.message || 'Failed to detect parameters';
    let errorDetails = null;
    
    // Check if it's an API error with response data
    if (error.response?.data) {
      errorDetails = error.response.data;
      if (errorDetails.error?.message) {
        errorMessage = errorDetails.error.message;
      }
    } else if (error.error) {
      errorDetails = error.error;
      if (error.error.message) {
        errorMessage = error.error.message;
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: errorDetails,
        fullError: {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 3).join('\n')
        }
      },
      { status: error.status || 500 }
    );
  }
}
