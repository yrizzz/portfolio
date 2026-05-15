import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ApiKey, User } from '@/models';

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
    await connectDB();
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
    const apiKey = await ApiKey.findOne({ key: token }).lean();

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

    // Get user
    const user = await User.findById(apiKey.userId).lean();

    // Update last used timestamp
    await ApiKey.findByIdAndUpdate(apiKey._id, { lastUsedAt: new Date() });

    return {
      authenticated: true,
      apiKey: { ...apiKey, id: apiKey._id.toString() },
      user: user ? { ...user, id: user._id.toString() } : null
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
