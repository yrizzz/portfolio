import { connectDB } from '@/lib/mongodb';
import { SiteConfig } from '@/models';

/**
 * Get Gemini API key from environment or database
 */
export async function getGeminiApiKey(): Promise<string> {
  try {
    // Try environment variable first
    if (process.env.GEMINI_API_KEY) {
      return process.env.GEMINI_API_KEY;
    }
    
    // Fallback to database
    const config = await SiteConfig.findOne({
      { key: 'GEMINI_API_KEY' },
    });
    
    return config?.value || '';
  } catch (error: any) {
    console.error('[Gemini] Error fetching API key:', error.message);
    return '';
  }
}

/**
 * Get selected Gemini model from environment or database
 */
export async function getGeminiModel(): Promise<string> {
  if (process.env.GEMINI_MODEL) {
    return cleanModelName(process.env.GEMINI_MODEL);
  }
  
  const config = await SiteConfig.findOne({
    { key: 'GEMINI_MODEL' },
  });
  
  const modelName = config?.value || 'gemini-2.5-flash';
  return cleanModelName(modelName);
}

/**
 * Clean model name - remove 'models/' prefix if present
 */
function cleanModelName(modelName: string): string {
  return modelName.startsWith('models/') ? modelName.slice(7) : modelName;
}
