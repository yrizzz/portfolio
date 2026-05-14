import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, generateRateLimitKey, getRateLimitHeaders, getClientIP, RATE_LIMIT_TIERS } from '@/lib/rate-limiter';
import { auth } from '@/lib/auth';

type RateLimitTier = 'anonymous' | 'authenticated' | 'admin';

interface RateLimitOptions {
  tier?: RateLimitTier;
  customLimit?: number;
  customWindow?: number;
}

/**
 * Apply rate limiting to a request.
 * Returns null if allowed, or a NextResponse if blocked.
 */
export async function applyRateLimit(
  req: NextRequest,
  endpoint: string,
  options: RateLimitOptions = {}
): Promise<NextResponse | null> {
  const ip = getClientIP(req);
  
  // Determine tier
  let tier: RateLimitTier = options.tier || 'anonymous';
  
  if (!options.tier) {
    // Auto-detect tier from session
    try {
      const session = await auth();
      if (session?.user?.role === 'ADMIN') {
        tier = 'admin';
      } else if (session?.user) {
        tier = 'authenticated';
      }
    } catch {
      // No session — anonymous
    }
  }

  const limit = options.customLimit || RATE_LIMIT_TIERS[tier].limit;
  const windowMs = options.customWindow || RATE_LIMIT_TIERS[tier].windowMs;
  
  const key = generateRateLimitKey(ip, endpoint);
  const result = rateLimiter.check(key, limit, windowMs);

  if (!result.allowed) {
    const headers = getRateLimitHeaders(limit, 0, result.resetTime);
    
    if (result.retryAfter) {
      headers['Retry-After'] = result.retryAfter.toString();
    }

    return NextResponse.json(
      {
        error: result.blocked 
          ? 'Too many violations. You have been temporarily blocked.'
          : 'Rate limit exceeded',
        retryAfter: result.retryAfter,
      },
      { status: 429, headers }
    );
  }

  return null; // Allowed
}

/**
 * Require admin authentication.
 * Returns null if authorized, or a NextResponse if not.
 */
export async function requireAdmin(): Promise<{ session: any } | NextResponse> {
  const session = await auth();
  
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return { session };
}

/**
 * Require any authenticated user.
 * Returns null if authorized, or a NextResponse if not.
 */
export async function requireAuth(): Promise<{ session: any } | NextResponse> {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return { session };
}
