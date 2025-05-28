import { logger, LogCategory } from './enhancedLogger-clean';

// Simple DOMPurify alternative for basic sanitization
const simpleSanitize = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/<iframe.*?>/gi, '')
    .replace(/<embed.*?>/gi, '')
    .replace(/<object.*?>/gi, '')
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .trim();
};

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: any;
}

export class InputValidator {
  private static emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static urlRegex = /^https?:\/\/.+/;
  private static fileNameRegex = /^[a-zA-Z0-9._-]+$/;
  private static safeTextRegex = /^[a-zA-Z0-9\s.,!?;:()\-'"]+$/;

  // Validate single field
  static validateField(value: any, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];
    let sanitizedValue = value;

    for (const rule of rules) {
      try {
        switch (rule.type) {
          case 'required':
            if (!value || (typeof value === 'string' && value.trim() === '')) {
              errors.push(rule.message);
            }
            break;

          case 'minLength':
            if (typeof value === 'string' && value.length < (rule.value || 0)) {
              errors.push(rule.message);
            }
            break;

          case 'maxLength':
            if (typeof value === 'string' && value.length > (rule.value || 0)) {
              errors.push(rule.message);
            }
            break;

          case 'pattern':
            if (typeof value === 'string' && rule.value && !rule.value.test(value)) {
              errors.push(rule.message);
            }
            break;

          case 'email':
            if (typeof value === 'string' && !this.emailRegex.test(value)) {
              errors.push(rule.message);
            }
            break;

          case 'url':
            if (typeof value === 'string' && !this.urlRegex.test(value)) {
              errors.push(rule.message);
            }
            break;

          case 'custom':
            if (rule.validator && !rule.validator(value)) {
              errors.push(rule.message);
            }
            break;
        }
      } catch (error) {
        logger.error(LogCategory.SECURITY, 'Validation rule error', {
          rule: rule.type,
          value: typeof value,
          error: error instanceof Error ? error.message : String(error)
        });
        errors.push('Validation error occurred');
      }
    }

    // Sanitize string values
    if (typeof value === 'string' && errors.length === 0) {
      sanitizedValue = this.sanitizeString(value);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? sanitizedValue : undefined
    };
  }

  // Validate form data
  static validateForm(data: Record<string, any>, schema: Record<string, ValidationRule[]>): ValidationResult {
    const allErrors: string[] = [];
    const sanitizedData: Record<string, any> = {};

    for (const [field, rules] of Object.entries(schema)) {
      const fieldResult = this.validateField(data[field], rules);
      
      if (!fieldResult.isValid) {
        allErrors.push(...fieldResult.errors.map(error => `${field}: ${error}`));
      } else {
        sanitizedData[field] = fieldResult.sanitizedValue;
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      sanitizedValue: allErrors.length === 0 ? sanitizedData : undefined
    };
  }

  // Sanitize string input
  static sanitizeString(input: string): string {
    // Remove potentially dangerous content
    let sanitized = simpleSanitize(input);

    // Additional sanitization
    sanitized = sanitized
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .trim();

    return sanitized;
  }

  // Validate and sanitize HTML content
  static sanitizeHTML(html: string): string {
    // Simple HTML sanitization - allows only basic formatting tags
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<(?!\/?(p|br|strong|em|u|h[1-6]|ul|ol|li)\b)[^>]*>/gi, '')
      .trim();
  }

  // Validate file upload
  static validateFile(file: File): ValidationResult {
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
      errors.push('File type not allowed. Please upload TXT, PDF, or DOC files only');
    }

    // Check file name
    if (!this.fileNameRegex.test(file.name)) {
      errors.push('File name contains invalid characters. Use only letters, numbers, dots, hyphens, and underscores');
    }

    // Check for suspicious file extensions
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (suspiciousExtensions.includes(fileExtension)) {
      errors.push('File type not allowed for security reasons');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate text content
  static validateTextContent(content: string): ValidationResult {
    const errors: string[] = [];
    const maxLength = 100000; // 100KB of text
    const minLength = 10;

    // Length checks
    if (content.length < minLength) {
      errors.push(`Text must be at least ${minLength} characters long`);
    }

    if (content.length > maxLength) {
      errors.push(`Text must not exceed ${maxLength} characters`);
    }

    // Content safety checks
    const suspiciousPatterns = [
      /<script/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
      /vbscript:/gi
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        errors.push('Text contains potentially unsafe content');
        logger.logSecurityEvent('Suspicious content detected', { 
          type: 'suspicious_activity',
          severity: 'medium',
          issue: 'unsafe_content_detected',
          pattern: pattern.source,
          contentLength: content.length
        });
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? this.sanitizeString(content) : undefined
    };
  }

  // Validate URL
  static validateURL(url: string): ValidationResult {
    const errors: string[] = [];

    try {
      const urlObj = new URL(url);
      
      // Only allow HTTP and HTTPS
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push('Only HTTP and HTTPS URLs are allowed');
      }

      // Block localhost and private IPs in production
      if (!import.meta.env.DEV) {
        const hostname = urlObj.hostname.toLowerCase();
        if (
          hostname === 'localhost' ||
          hostname.startsWith('127.') ||
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.includes('0.0.0.0')
        ) {
          errors.push('Private IP addresses and localhost are not allowed');
        }
      }

    } catch {
      errors.push('Invalid URL format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? url : undefined
    };
  }

  // Common validation schemas
  static get schemas() {
    return {
      userRegistration: {
        email: [
          { type: 'required' as const, message: 'Email is required' },
          { type: 'email' as const, message: 'Please enter a valid email address' }
        ],
        password: [
          { type: 'required' as const, message: 'Password is required' },
          { type: 'minLength' as const, value: 8, message: 'Password must be at least 8 characters long' },
          { 
            type: 'pattern' as const, 
            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
            message: 'Password must contain uppercase, lowercase, number, and special character' 
          }
        ],
        name: [
          { type: 'required' as const, message: 'Name is required' },
          { type: 'minLength' as const, value: 2, message: 'Name must be at least 2 characters long' },
          { type: 'maxLength' as const, value: 50, message: 'Name must not exceed 50 characters' },
          { type: 'pattern' as const, value: /^[a-zA-Z\s]+$/, message: 'Name can only contain letters and spaces' }
        ]
      },

      textUpload: {
        title: [
          { type: 'required' as const, message: 'Title is required' },
          { type: 'minLength' as const, value: 3, message: 'Title must be at least 3 characters long' },
          { type: 'maxLength' as const, value: 100, message: 'Title must not exceed 100 characters' }
        ],
        content: [
          { type: 'required' as const, message: 'Content is required' },
          { type: 'minLength' as const, value: 50, message: 'Content must be at least 50 characters long' },
          { type: 'maxLength' as const, value: 100000, message: 'Content must not exceed 100,000 characters' }
        ],
        category: [
          { type: 'required' as const, message: 'Category is required' },
          { 
            type: 'custom' as const, 
            validator: (value: string) => ['fiction', 'non-fiction', 'educational', 'news', 'other'].includes(value),
            message: 'Please select a valid category' 
          }
        ]
      },

      readingSettings: {
        speed: [
          { type: 'required' as const, message: 'Reading speed is required' },
          { 
            type: 'custom' as const,
            validator: (value: number) => value >= 100 && value <= 1000,
            message: 'Reading speed must be between 100 and 1000 WPM'
          }
        ],
        fontSize: [
          { type: 'required' as const, message: 'Font size is required' },
          { 
            type: 'custom' as const,
            validator: (value: number) => value >= 12 && value <= 32,
            message: 'Font size must be between 12 and 32 pixels'
          }
        ]
      }
    };
  }
}

// Content Security utility
export class ContentSecurity {
  // Sanitize text input for reading sessions
  static sanitizeTextInput(content: string): string {
    const validation = InputValidator.validateTextContent(content);
    if (!validation.isValid) {
      throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
    }
    return validation.sanitizedValue || content;
  }

  // Check for malicious content patterns
  static scanForThreats(content: string): { safe: boolean; threats: string[] } {
    const threats: string[] = [];
    
    const threatPatterns = [
      { pattern: /<script.*?>.*?<\/script>/gis, threat: 'script_injection' },
      { pattern: /javascript\s*:/gi, threat: 'javascript_protocol' },
      { pattern: /on\w+\s*=\s*['"]/gi, threat: 'event_handler' },
      { pattern: /data\s*:\s*text\/html/gi, threat: 'data_uri_html' },
      { pattern: /vbscript\s*:/gi, threat: 'vbscript_protocol' },
      { pattern: /<iframe.*?>/gi, threat: 'iframe_injection' },
      { pattern: /<embed.*?>/gi, threat: 'embed_injection' },
      { pattern: /<object.*?>/gi, threat: 'object_injection' }
    ];

    for (const { pattern, threat } of threatPatterns) {
      if (pattern.test(content)) {
        threats.push(threat);
      }
    }

    if (threats.length > 0) {
      logger.logSecurityEvent('Content threat scan detected threats', {
        type: 'suspicious_activity',
        severity: 'high',
        threats,
        contentLength: content.length,
        action: 'content_threat_scan'
      });
    }

    return {
      safe: threats.length === 0,
      threats
    };
  }

  // Generate secure CSP nonce
  static generateCSPNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }
}

export default InputValidator;