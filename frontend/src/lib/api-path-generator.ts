// API Path Generator Utility

export interface PathConfig {
  version: string;
  category: string;
  name: string;
}

export const API_VERSIONS = ['v1', 'v2', 'v3'] as const;

export const API_CATEGORIES = [
  { value: 'tool', label: 'Tool', description: 'Utility tools & helpers' },
  { value: 'ai', label: 'AI', description: 'AI-powered services' },
  { value: 'data', label: 'Data', description: 'Data processing & retrieval' },
  { value: 'media', label: 'Media', description: 'Image, video, audio processing' },
  { value: 'social', label: 'Social', description: 'Social media integrations' },
  { value: 'payment', label: 'Payment', description: 'Payment & transactions' },
  { value: 'notification', label: 'Notification', description: 'Notifications & alerts' },
  { value: 'auth', label: 'Auth', description: 'Authentication & authorization' },
  { value: 'custom', label: 'Custom', description: 'Custom endpoints' },
] as const;

/**
 * Generate API path from config
 * @param config - Path configuration
 * @returns Formatted API path
 */
export function generateApiPath(config: PathConfig): string {
  const { version, category, name } = config;
  
  // Convert name to kebab-case
  const kebabName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return `/api/${version}/${category}/${kebabName}`;
}

/**
 * Parse API path into components
 * @param path - API path string
 * @returns Parsed path config or null
 */
export function parseApiPath(path: string): PathConfig | null {
  const match = path.match(/^\/api\/(v\d+)\/([^\/]+)\/([^\/]+)$/);
  
  if (!match) return null;
  
  return {
    version: match[1],
    category: match[2],
    name: match[3],
  };
}

/**
 * Validate API path format
 * @param path - API path to validate
 * @returns Validation result
 */
export function validateApiPath(path: string): { valid: boolean; error?: string } {
  if (!path.startsWith('/api/')) {
    return { valid: false, error: 'Path must start with /api/' };
  }
  
  const parsed = parseApiPath(path);
  if (!parsed) {
    return { valid: false, error: 'Invalid path format. Use: /api/v{version}/{category}/{name}' };
  }
  
  if (!API_VERSIONS.includes(parsed.version as any)) {
    return { valid: false, error: `Invalid version. Use: ${API_VERSIONS.join(', ')}` };
  }
  
  const validCategories = API_CATEGORIES.map(c => c.value);
  if (!validCategories.includes(parsed.category as any)) {
    return { valid: false, error: `Invalid category. Use: ${validCategories.join(', ')}` };
  }
  
  if (!/^[a-z0-9-]+$/.test(parsed.name)) {
    return { valid: false, error: 'Name must contain only lowercase letters, numbers, and hyphens' };
  }
  
  return { valid: true };
}

/**
 * Get example path for category
 * @param category - API category
 * @returns Example path
 */
export function getExamplePath(category: string): string {
  const examples: Record<string, string> = {
    tool: '/api/v1/tool/phone-checker',
    ai: '/api/v1/ai/text-generator',
    data: '/api/v1/data/user-info',
    media: '/api/v1/media/image-resize',
    social: '/api/v1/social/twitter-post',
    payment: '/api/v1/payment/stripe-checkout',
    notification: '/api/v1/notification/send-email',
    auth: '/api/v1/auth/verify-token',
    custom: '/api/v1/custom/my-endpoint',
  };
  
  return examples[category] || '/api/v1/custom/my-endpoint';
}
