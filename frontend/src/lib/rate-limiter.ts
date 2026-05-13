/**
 * In-memory rate limiter implementation
 * For production, consider using Redis for distributed rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Check if request is allowed based on rate limit
   * @param key - Unique identifier (e.g., "apikey:endpoint" or "ip:endpoint")
   * @param limit - Maximum requests allowed in the window
   * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
   * @returns Object with allowed status and remaining requests
   */
  check(key: string, limit: number, windowMs: number = 60000): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const entry = this.store.get(key);

    // No entry or expired entry
    if (!entry || now > entry.resetTime) {
      const resetTime = now + windowMs;
      this.store.set(key, {
        count: 1,
        resetTime,
      });
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime,
      };
    }

    // Entry exists and not expired
    if (entry.count < limit) {
      entry.count++;
      this.store.set(key, entry);
      return {
        allowed: true,
        remaining: limit - entry.count,
        resetTime: entry.resetTime,
      };
    }

    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get current stats for a key
   */
  getStats(key: string): {
    count: number;
    resetTime: number;
  } | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now > entry.resetTime) {
      this.store.delete(key);
      return null;
    }
    
    return {
      count: entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Generate rate limit key
 */
export function generateRateLimitKey(
  identifier: string,
  endpoint: string
): string {
  return `${identifier}:${endpoint}`;
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
  limit: number,
  remaining: number,
  resetTime: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
  };
}
