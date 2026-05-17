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
    console.error('[Gemini Models] Error:', error);
    
    // Extract detailed error information
    let errorMessage = error.message || 'Failed to list models';
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
    
    // Return detailed error information
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: errorDetails,
        fullError: {
          name: error.name,
          message: error.message,
          status: error.status
        }
      },
      { status: error.status || 500 }
    );
  }
}

// POST - Load models with provided API key (without saving)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin only' },
        { status: 403 }
      );
    }

    const { apiKey } = await request.json();
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'API key is required' 
        },
        { status: 400 }
      );
    }

    // Initialize Gemini AI with provided API key
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
    console.error('[Gemini Models] Error:', error);
    
    // Extract detailed error information
    let errorMessage = error.message || 'Failed to list models';
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
    
    // Return detailed error information
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: errorDetails,
        fullError: {
          name: error.name,
          message: error.message,
          status: error.status
        }
      },
      { status: error.status || 500 }
    );
  }
}

