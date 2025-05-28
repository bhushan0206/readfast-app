// Enhanced Security Middleware for Production-Grade Security

import { logger, LogCategory } from './enhancedLogger-clean';

// Security headers configuration for production deployment
export const securityHeaders = {
  // Content Security Policy - Prevents XSS attacks
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co wss://*.supabase.in",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),

  // Prevents clickjacking attacks
  'X-Frame-Options': 'DENY',

  // Prevents MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Enables XSS protection
  'X-XSS-Protection': '1; mode=block',

  // Enforces HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Controls referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ].join(', ')
};

// Rate limiting store
class RateLimitStore {
  private attempts: Map<string, number[]> = new Map();
  private blockedUntil: Map<string, number> = new Map();

  checkAttempt(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    
    // Check if currently blocked
    const blockedUntil = this.blockedUntil.get(identifier);
    if (blockedUntil && now < blockedUntil) {
      logger.warn(LogCategory.SECURITY, 'Rate limit blocked attempt', { identifier, blockedUntil });
      return false;
    }

    // Clean old attempts
    const attempts = this.attempts.get(identifier) || [];
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      // Block for the window duration
      this.blockedUntil.set(identifier, now + windowMs);
      logger.warn(LogCategory.SECURITY, 'Rate limit exceeded', { identifier, attempts: recentAttempts.length });
      return false;
    }

    // Record this attempt
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);
    
    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
    this.blockedUntil.delete(identifier);
  }
}

const rateLimitStore = new RateLimitStore();

// Security utilities
export const SecurityUtils = {
  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength
  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return { isValid: errors.length === 0, errors };
  },

  // Sanitize input to prevent XSS
  sanitizeInput: (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/[<>]/g, '')
      .trim();
  }
};

// Enhanced authentication security
export const AuthSecurity = {
  // Validate login attempt
  validateLoginAttempt: (email: string, password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Rate limiting check
    if (!rateLimitStore.checkAttempt(`login_${email}`)) {
      errors.push('Too many login attempts. Please try again later.');
      return { isValid: false, errors };
    }

    // Input validation
    if (!SecurityUtils.isValidEmail(email)) {
      errors.push('Invalid email format');
    }

    if (!password || password.length < 1) {
      errors.push('Password is required');
    }

    // Log login attempt
    logger.logSecurityEvent('Login attempt', { email: SecurityUtils.sanitizeInput(email) });

    return { isValid: errors.length === 0, errors };
  },

  // Validate registration
  validateRegistration: (email: string, password: string, confirmPassword: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Rate limiting
    if (!rateLimitStore.checkAttempt(`register_${email}`)) {
      errors.push('Too many registration attempts. Please try again later.');
      return { isValid: false, errors };
    }

    // Email validation
    if (!SecurityUtils.isValidEmail(email)) {
      errors.push('Invalid email format');
    }

    // Password validation
    const passwordValidation = SecurityUtils.validatePassword(password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }

    // Password confirmation
    if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }

    logger.logSecurityEvent('Registration attempt', { email: SecurityUtils.sanitizeInput(email) });

    return { isValid: errors.length === 0, errors };
  },

  // Reset rate limit after successful login
  resetLoginAttempts: (email: string): void => {
    rateLimitStore.reset(`login_${email}`);
    logger.info(LogCategory.AUTH, 'Login attempts reset', { email: SecurityUtils.sanitizeInput(email) });
  },

  // Log security events
  logSecurityEvent: (event: string, metadata?: Record<string, any>): void => {
    logger.logSecurityEvent(event, metadata);
  },
};

// Session management
export const SessionManager = {
  // Check if session is valid
  isSessionValid: (): boolean => {
    try {
      const sessionData = localStorage.getItem('auth-storage');
      if (!sessionData) return false;

      const parsed = JSON.parse(sessionData);
      const expiresAt = parsed.state?.expiresAt;
      
      if (!expiresAt) return false;
      
      const now = Date.now();
      const isValid = now < expiresAt;
      
      if (!isValid) {
        logger.warn(LogCategory.AUTH, 'Session expired', { expiresAt, now });
        SessionManager.clearSession();
      }
      
      return isValid;
    } catch (error) {
      logger.error(LogCategory.AUTH, 'Session validation error', {}, error as Error);
      return false;
    }
  },

  // Extend session
  extendSession: (hours: number = 24): void => {
    try {
      const sessionData = localStorage.getItem('auth-storage');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        parsed.state.expiresAt = Date.now() + (hours * 60 * 60 * 1000);
        localStorage.setItem('auth-storage', JSON.stringify(parsed));
        logger.info(LogCategory.AUTH, 'Session extended', { hours });
      }
    } catch (error) {
      logger.error(LogCategory.AUTH, 'Session extension error', {}, error as Error);
    }
  },

  // Clear session
  clearSession: (): void => {
    try {
      localStorage.removeItem('auth-storage');
      logger.info(LogCategory.AUTH, 'Session cleared');
    } catch (error) {
      logger.error(LogCategory.AUTH, 'Session clearing error', {}, error as Error);
    }
  },
};

// Content Security
export const ContentSecurity = {
  // Sanitize text input
  sanitizeTextInput: (input: string): string => {
    return SecurityUtils.sanitizeInput(input);
  },

  // Validate file upload
  validateFileUpload: (file: File): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['text/plain', 'application/pdf', 'text/html'];

    if (file.size > maxSize) {
      errors.push('File size must be less than 5MB');
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not allowed. Please upload a text, PDF, or HTML file.');
    }

    // Log file upload attempt
    logger.info(LogCategory.SECURITY, 'File upload validation', {
      fileName: SecurityUtils.sanitizeInput(file.name),
      fileType: file.type,
      fileSize: file.size,
      isValid: errors.length === 0,
    });

    return { isValid: errors.length === 0, errors };
  },
};

// Privacy protection
export const PrivacyManager = {
  // Anonymize user data for logging
  anonymizeUserData: (data: Record<string, any>): Record<string, any> => {
    const anonymized = { ...data };
    
    // Remove or hash sensitive fields
    if (anonymized.email) {
      anonymized.email = anonymized.email.replace(/(.{2}).*@/, '$1***@');
    }
    
    if (anonymized.userId) {
      anonymized.userId = anonymized.userId.substring(0, 8) + '***';
    }
    
    delete anonymized.password;
    delete anonymized.token;
    delete anonymized.sessionId;
    
    return anonymized;
  },

  // GDPR compliance helpers
  exportUserData: async (userId: string): Promise<any> => {
    // This would export all user data for GDPR compliance
    logger.info(LogCategory.AUTH, 'User data export requested', { userId });
    throw new Error('User data export not implemented yet');
  },

  deleteUserData: async (userId: string): Promise<void> => {
    // This would delete all user data for GDPR compliance
    logger.info(LogCategory.AUTH, 'User data deletion requested', { userId });
    throw new Error('User data deletion not implemented yet');
  },
};

// Security middleware for API calls
export class SecurityMiddleware {
  private static instance: SecurityMiddleware;

  static getInstance(): SecurityMiddleware {
    if (!SecurityMiddleware.instance) {
      SecurityMiddleware.instance = new SecurityMiddleware();
    }
    return SecurityMiddleware.instance;
  }

  // Validate API requests
  validateRequest(request: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for required headers
    if (!request.headers?.['content-type']) {
      errors.push('Missing Content-Type header');
    }

    // Validate content type for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers?.['content-type'];
      if (!contentType?.includes('application/json') && !contentType?.includes('multipart/form-data')) {
        errors.push('Invalid Content-Type for request method');
      }
    }

    // Check for oversized requests
    const contentLength = parseInt(request.headers?.['content-length'] || '0');
    if (contentLength > 10 * 1024 * 1024) { // 10MB limit
      errors.push('Request payload too large');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Sanitize user input
  sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: URLs
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[this.sanitizeInput(key)] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return input;
  }

  // Validate file uploads
  validateFileUpload(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    // Check file size
    if (file.size > maxSize) {
      errors.push('File size exceeds 5MB limit');
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not allowed');
    }

    // Check file name
    if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
      errors.push('Invalid file name characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate secure random tokens
  generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Validate session tokens
  validateSessionToken(token: string): boolean {
    // Basic token format validation
    return /^[a-f0-9]{64}$/.test(token);
  }
}

export default SecurityMiddleware;