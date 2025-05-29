// Security Configuration
export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT: {
    MAX_REQUESTS_PER_MINUTE: 60,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  },
  
  // Session management
  SESSION: {
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
    REFRESH_THRESHOLD: 2 * 60 * 60 * 1000, // 2 hours
    SECURE_COOKIES: process.env.NODE_ENV === 'production',
  },
  
  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
  },
  
  // Content Security Policy
  CSP: {
    SCRIPT_SRC: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
    STYLE_SRC: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    IMG_SRC: ["'self'", "data:", "https:"],
    FONT_SRC: ["'self'", "https://fonts.gstatic.com"],
    CONNECT_SRC: ["'self'", process.env.VITE_SUPABASE_URL],
  },
  
  // CORS settings
  CORS: {
    ALLOWED_ORIGINS: [
      // Only include localhost in development
      ...(process.env.NODE_ENV === 'development' ? [
        'http://localhost:3000',
        'http://localhost:5173',
      ] : []),
      // Production URL
      process.env.VITE_APP_URL,
    ].filter(Boolean),
  },
};

// Security utilities
export const SecurityUtils = {
  // Sanitize user input
  sanitizeInput: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .trim()
      .substring(0, 1000); // Limit length
  },
  
  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },
  
  // Check password strength
  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < SECURITY_CONFIG.PASSWORD.MIN_LENGTH) {
      errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD.MIN_LENGTH} characters long`);
    }
    
    if (SECURITY_CONFIG.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (SECURITY_CONFIG.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (SECURITY_CONFIG.PASSWORD.REQUIRE_NUMBERS && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (SECURITY_CONFIG.PASSWORD.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return { isValid: errors.length === 0, errors };
  },
  
  // Generate secure random tokens
  generateSecureToken: (): string => {
    return crypto.getRandomValues(new Uint8Array(32))
      .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
  },
  
  // Rate limiting check
  checkRateLimit: (key: string, limit: number = SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS_PER_MINUTE): boolean => {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    const requests = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]')
      .filter((timestamp: number) => timestamp > windowStart);
    
    if (requests.length >= limit) {
      return false;
    }
    
    requests.push(now);
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(requests));
    return true;
  },
};