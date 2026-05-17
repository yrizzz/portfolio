// Development-only logger
// Only logs in development, silent in production

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args);
  },
  error: (...args: any[]) => {
    // Always log errors (but sanitize sensitive data)
    console.error(...args);
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },
  info: (...args: any[]) => {
    if (isDev) console.info(...args);
  },
  debug: (...args: any[]) => {
    if (isDev) console.debug(...args);
  },
};

// Sanitize sensitive data from logs
export const sanitize = (data: any): any => {
  if (!data) return data;
  
  const sensitive = ['password', 'token', 'secret', 'key', 'apiKey', 'authorization', 'cookie'];
  
  if (typeof data === 'object') {
    const sanitized = { ...data };
    for (const key in sanitized) {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = sanitize(sanitized[key]);
      }
    }
    return sanitized;
  }
  
  return data;
};
