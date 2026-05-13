import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface ApiAuthResult {
  authenticated: boolean;
  apiKey?: any;
  user?: any;
  error?: string;
}

/**
 * Validate API key from request headers
 * Looks for Authorization header with format: "Bearer pk_..."
 */
export async function validateApiKey(request: NextRequest): Promise<ApiAuthResult> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return {
        authenticated: false,
        error: 'Missing authorization header'
      };
    }

    // Extract token from "Bearer pk_..." format
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!token || !token.startsWith('pk_')) {
      return {
        authenticated: false,
        error: 'Invalid API key format'
      };
    }

    // Find API key in database
    const apiKey = await prisma.apiKey.findUnique({
      where: { key: token },
      include: { user: true }
    });

    if (!apiKey) {
      return {
        authenticated: false,
        error: 'Invalid API key'
      };
    }

    if (!apiKey.isActive) {
      return {
        authenticated: false,
        error: 'API key is inactive'
      };
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() }
    });

    return {
      authenticated: true,
      apiKey,
      user: apiKey.user
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return {
      authenticated: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Middleware to check if endpoint requires authentication
 */
export async function checkEndpointAuth(
  endpoint: any,
  request: NextRequest
): Promise<ApiAuthResult> {
  // If endpoint doesn't require auth, allow access
  if (!endpoint.requiresAuth) {
    return { authenticated: true };
  }

  // Validate API key
  return await validateApiKey(request);
}
