import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey } from '@/lib/gemini';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const apiKey = await getGeminiApiKey();
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Gemini API key not configured. Please set it in Settings.' 
        },
        { status: 500 }
      );
    }

    // Initialize Gemini AI with the new SDK (correct way)
    const genAI = new GoogleGenAI({ apiKey });
    
    // List available models
    const modelsResponse = await genAI.models.list();
    
    // Convert pager to array
    const modelsList: any[] = [];
    for await (const model of modelsResponse) {
      modelsList.push(model);
    }
    
    // Filter models that support generateContent
    const availableModels = modelsList
      .filter((model: any) => 
        model.supportedActions?.includes('generateContent')
      )
      .map((model: any) => ({
        name: model.name,
        displayName: model.displayName,
        description: model.description,
        version: model.version,
        inputTokenLimit: model.inputTokenLimit,
        outputTokenLimit: model.outputTokenLimit,
        supportedActions: model.supportedActions,
      }));

    return NextResponse.json({
      success: true,
      models: availableModels,
      total: availableModels.length,
    });

  } catch (error: any) {
    console.error('List models error:', error);
    
    // Return detailed error information
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to list models',
        details: error.response?.data || error
      },
      { status: 500 }
    );
  }
}
