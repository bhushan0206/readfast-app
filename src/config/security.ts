// Environment configuration for security settings
export const getSecurityConfig = () => {
  const isProduction = import.meta.env.PROD;
  const isDevelopment = import.meta.env.DEV;

  return {
    // Environment
    NODE_ENV: import.meta.env.MODE,
    IS_PRODUCTION: isProduction,
    IS_DEVELOPMENT: isDevelopment,

    // API URLs
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    
    // Security headers for production
    SECURITY_HEADERS: isProduction ? {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    } : {},

    // Content Security Policy
    CSP: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        ...(isDevelopment ? ["'unsafe-eval'", "'unsafe-inline'"] : []),
        'https://cdn.jsdelivr.net',
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for Tailwind CSS
        'https://fonts.googleapis.com',
      ],
      'img-src': [
        "'self'",
        'data:',
        'https:',
        'blob:',
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
      ],
      'connect-src': [
        "'self'",
        import.meta.env.VITE_SUPABASE_URL,
        'https://api.groq.com', // For AI features
        ...(isDevelopment ? ['ws://localhost:*', 'http://localhost:*'] : []),
      ].filter(Boolean),
      'worker-src': ["'self'", 'blob:'],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
    },

    // Rate limiting configuration
    RATE_LIMITS: {
      LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 min
      REGISTER: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
      API: { maxAttempts: 100, windowMs: 60 * 1000 }, // 100 requests per minute
      UPLOAD: { maxAttempts: 10, windowMs: 60 * 1000 }, // 10 uploads per minute
    },

    // Session configuration
    SESSION: {
      MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
      REFRESH_THRESHOLD: 2 * 60 * 60 * 1000, // Refresh if less than 2 hours left
      SECURE_COOKIES: isProduction,
      SAME_SITE: isProduction ? 'strict' : 'lax',
    },

    // File upload security
    UPLOAD: {
      MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
      ALLOWED_TYPES: [
        'text/plain',
        'application/pdf',
        'text/html',
        'application/epub+zip',
      ],
      SCAN_FOR_MALWARE: isProduction,
    },

    // Privacy settings
    PRIVACY: {
      ANONYMIZE_LOGS: isProduction,
      DATA_RETENTION_DAYS: 90,
      GDPR_COMPLIANCE: true,
      COOKIE_CONSENT_REQUIRED: isProduction,
    },

    // Monitoring and alerting
    MONITORING: {
      ERROR_REPORTING: isProduction,
      PERFORMANCE_MONITORING: true,
      SECURITY_ALERTS: isProduction,
      LOG_LEVEL: isDevelopment ? 'debug' : 'warn',
    },

    // Feature flags for security
    FEATURES: {
      TWO_FACTOR_AUTH: false, // TODO: Implement 2FA
      OAUTH_PROVIDERS: ['google', 'github'],
      CAPTCHA: isProduction,
      EMAIL_VERIFICATION: true,
      PASSWORD_RESET: true,
    },
  };
};

// Export singleton config
export const securityConfig = getSecurityConfig();

// Validation helper
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const config = getSecurityConfig();

  // Check required environment variables
  if (!config.SUPABASE_URL) {
    errors.push('VITE_SUPABASE_URL is required');
  }

  if (!config.SUPABASE_ANON_KEY) {
    errors.push('VITE_SUPABASE_ANON_KEY is required');
  }

  // Validate URLs
  if (config.SUPABASE_URL && !config.SUPABASE_URL.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must use HTTPS in production');
  }

  // Production-specific validations
  if (config.IS_PRODUCTION) {
    if (!config.SECURITY_HEADERS['Strict-Transport-Security']) {
      errors.push('HSTS header is required in production');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Runtime security checks
export const performSecurityChecks = (): boolean => {
  const checks = [
    // Check if running over HTTPS in production
    () => {
      if (securityConfig.IS_PRODUCTION && location.protocol !== 'https:') {
        console.error('Security: Application must run over HTTPS in production');
        return false;
      }
      return true;
    },

    // Check Content Security Policy support
    () => {
      if (!(window as any).trustedTypes && securityConfig.IS_PRODUCTION) {
        console.warn('Security: Trusted Types not supported');
      }
      return true;
    },

    // Check local storage availability
    () => {
      try {
        localStorage.setItem('security-test', 'test');
        localStorage.removeItem('security-test');
        return true;
      } catch {
        console.error('Security: Local storage not available');
        return false;
      }
    },

    // Check if running in a secure context
    () => {
      if (!window.isSecureContext && securityConfig.IS_PRODUCTION) {
        console.error('Security: Application must run in secure context');
        return false;
      }
      return true;
    },
  ];

  return checks.every(check => check());
};