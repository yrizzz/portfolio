import { prisma } from '@/lib/prisma';

// Helper function to get Gemini API key
export async function getGeminiApiKey(): Promise<string> {
  // Try environment variable first
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  
  // Try database
  const config = await prisma.siteConfig.findUnique({
    where: { key: 'GEMINI_API_KEY' },
  });
  
  return config?.value || '';
}

// Helper function to get selected Gemini model
export async function getGeminiModel(): Promise<string> {
  // Try environment variable first
  if (process.env.GEMINI_MODEL) {
    return cleanModelName(process.env.GEMINI_MODEL);
  }
  
  // Try database
  const config = await prisma.siteConfig.findUnique({
    where: { key: 'GEMINI_MODEL' },
  });
  
  // Default to gemini-2.5-flash (latest stable model)
  const modelName = config?.value || 'gemini-2.5-flash';
  return cleanModelName(modelName);
}

// Helper function to clean model name (remove 'models/' prefix if present)
function cleanModelName(modelName: string): string {
  if (modelName.startsWith('models/')) {
    return modelName.replace('models/', '');
  }
  return modelName;
}
