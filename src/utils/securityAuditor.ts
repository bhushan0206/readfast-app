import { logger, LogCategory } from './enhancedLogger-clean';
import { errorMonitor } from './errorMonitoring';
import { SecurityUtils, AuthSecurity, SessionManager } from './securityMiddleware-clean';

export interface SecurityAuditResult {
  score: number; // 0-100
  level: 'critical' | 'high' | 'medium' | 'low';
  findings: SecurityFinding[];
  recommendations: string[];
  summary: string;
}

export interface SecurityFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'authentication' | 'authorization' | 'input_validation' | 'session' | 'configuration' | 'monitoring';
  title: string;
  description: string;
  remediation: string;
  evidence?: Record<string, any>;
}

export class SecurityAuditor {
  private findings: SecurityFinding[] = [];
  private startTime: number = 0;

  async runFullAudit(): Promise<SecurityAuditResult> {
    this.startTime = Date.now();
    this.findings = [];

    logger.info(LogCategory.SECURITY, 'Starting comprehensive security audit');

    // Run all audit checks
    await Promise.all([
      this.auditAuthentication(),
      this.auditSessionManagement(),
      this.auditInputValidation(),
      this.auditRateLimiting(),
      this.auditErrorHandling(),
      this.auditLogging(),
      this.auditConfiguration(),
      this.auditDataProtection()
    ]);

    const result = this.generateAuditResult();
    
    logger.info(LogCategory.SECURITY, 'Security audit completed', {
      score: result.score,
      level: result.level,
      findingsCount: result.findings.length,
      duration: Date.now() - this.startTime
    });

    return result;
  }

  private async auditAuthentication(): Promise<void> {
    try {
      // Check authentication implementation
      const testEmail = 'test@example.com';
      const weakPassword = '123';
      const strongPassword = 'StrongP@ssw0rd123!';

      // Test password validation
      const weakResult = SecurityUtils.validatePassword(weakPassword);
      if (weakResult.isValid) {
        this.addFinding({
          id: 'auth_001',
          severity: 'critical',
          category: 'authentication',
          title: 'Weak Password Policy',
          description: 'The system accepts weak passwords that do not meet security requirements',
          remediation: 'Implement stronger password validation requiring uppercase, lowercase, numbers, and special characters with minimum 8 characters'
        });
      }

      // Test email validation
      const invalidEmails = ['invalid', 'test@', '@domain.com', 'test..test@domain.com'];
      for (const email of invalidEmails) {
        if (SecurityUtils.isValidEmail(email)) {
          this.addFinding({
            id: 'auth_002',
            severity: 'medium',
            category: 'authentication',
            title: 'Insufficient Email Validation',
            description: `Email validation accepts invalid format: ${email}`,
            remediation: 'Strengthen email validation regex to reject malformed email addresses'
          });
        }
      }

      // Check rate limiting for authentication
      const rateLimitResult = AuthSecurity.validateLoginAttempt(testEmail, strongPassword);
      if (rateLimitResult.isValid) {
        // Simulate multiple attempts
        for (let i = 0; i < 10; i++) {
          AuthSecurity.validateLoginAttempt(testEmail, 'wrong_password');
        }
        
        const blockedResult = AuthSecurity.validateLoginAttempt(testEmail, strongPassword);
        if (blockedResult.isValid) {
          this.addFinding({
            id: 'auth_003',
            severity: 'high',
            category: 'authentication',
            title: 'Insufficient Rate Limiting',
            description: 'Authentication rate limiting is not properly blocking repeated failed attempts',
            remediation: 'Implement stricter rate limiting for authentication endpoints'
          });
        }
      }

    } catch (error) {
      this.addFinding({
        id: 'auth_999',
        severity: 'medium',
        category: 'authentication',
        title: 'Authentication Audit Error',
        description: 'Unable to complete authentication security audit',
        remediation: 'Review authentication implementation for potential issues',
        evidence: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  private async auditSessionManagement(): Promise<void> {
    try {
      // Check session validation
      const isValid = SessionManager.isSessionValid();
      
      // Check if session data is stored securely
      const sessionData = localStorage.getItem('auth-storage');
      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData);
          
          // Check for sensitive data in localStorage
          if (parsed.password || parsed.token) {
            this.addFinding({
              id: 'session_001',
              severity: 'critical',
              category: 'session',
              title: 'Sensitive Data in Browser Storage',
              description: 'Sensitive authentication data (passwords, tokens) found in browser localStorage',
              remediation: 'Remove sensitive data from browser storage and use secure HTTP-only cookies instead'
            });
          }

          // Check session expiration
          if (!parsed.state?.expiresAt) {
            this.addFinding({
              id: 'session_002',
              severity: 'high',
              category: 'session',
              title: 'Missing Session Expiration',
              description: 'User sessions do not have proper expiration timestamps',
              remediation: 'Implement session expiration with reasonable timeout periods'
            });
          }
        } catch {
          this.addFinding({
            id: 'session_003',
            severity: 'medium',
            category: 'session',
            title: 'Invalid Session Data Format',
            description: 'Session data in localStorage has invalid JSON format',
            remediation: 'Implement proper session data validation and error handling'
          });
        }
      }

    } catch (error) {
      this.addFinding({
        id: 'session_999',
        severity: 'low',
        category: 'session',
        title: 'Session Management Audit Error',
        description: 'Unable to complete session management audit',
        remediation: 'Review session management implementation',
        evidence: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  private async auditInputValidation(): Promise<void> {
    try {
      // Test XSS prevention
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src=x onerror=alert("xss")>',
        'onload=alert("xss")'
      ];

      for (const payload of xssPayloads) {
        const sanitized = SecurityUtils.sanitizeInput(payload);
        if (sanitized.includes('<script') || sanitized.includes('javascript:') || sanitized.includes('onerror=')) {
          this.addFinding({
            id: 'input_001',
            severity: 'critical',
            category: 'input_validation',
            title: 'XSS Vulnerability in Input Sanitization',
            description: `Input sanitization does not properly handle XSS payload: ${payload}`,
            remediation: 'Strengthen input sanitization to remove all potentially dangerous HTML and JavaScript',
            evidence: { payload, sanitized }
          });
        }
      }

      // Test SQL injection patterns (though we use Supabase)
      const sqlPayloads = [
        "'; DROP TABLE users; --",
        "' OR 1=1 --",
        "UNION SELECT * FROM users"
      ];

      // Since we're using Supabase, these should be handled, but check sanitization
      for (const payload of sqlPayloads) {
        const sanitized = SecurityUtils.sanitizeInput(payload);
        // This is more of an info check since Supabase handles SQL injection
        if (sanitized === payload) {
          this.addFinding({
            id: 'input_002',
            severity: 'info',
            category: 'input_validation',
            title: 'SQL Injection Pattern Not Sanitized',
            description: `Input contains SQL injection patterns that are not sanitized: ${payload}`,
            remediation: 'While Supabase handles SQL injection, consider sanitizing input for defense in depth',
            evidence: { payload, sanitized }
          });
        }
      }

    } catch (error) {
      this.addFinding({
        id: 'input_999',
        severity: 'medium',
        category: 'input_validation',
        title: 'Input Validation Audit Error',
        description: 'Unable to complete input validation audit',
        remediation: 'Review input validation implementation',
        evidence: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  private async auditRateLimiting(): Promise<void> {
    try {
      // Note: Rate limiting audit would require actual RateLimiter implementation
      // For now, we'll check if rate limiting is mentioned in recent logs
      const recentLogs = logger.getRecentLogs(100);
      const rateLimitLogs = recentLogs.filter(log => 
        log.message.toLowerCase().includes('rate limit') ||
        (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes('rate limit'))
      );

      if (rateLimitLogs.length === 0) {
        this.addFinding({
          id: 'rate_001',
          severity: 'medium',
          category: 'configuration',
          title: 'No Rate Limiting Activity Detected',
          description: 'No rate limiting events found in recent logs',
          remediation: 'Implement and verify rate limiting is working correctly'
        });
      }

    } catch (error) {
      this.addFinding({
        id: 'rate_999',
        severity: 'low',
        category: 'configuration',
        title: 'Rate Limiting Audit Error',
        description: 'Unable to complete rate limiting audit',
        remediation: 'Review rate limiting implementation',
        evidence: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  private async auditErrorHandling(): Promise<void> {
    try {
      // Check if error monitoring is properly configured
      const metrics = errorMonitor.getMonitoringMetrics();
      
      if (metrics.errorRate > 0.1) {
        this.addFinding({
          id: 'error_001',
          severity: 'high',
          category: 'monitoring',
          title: 'High Error Rate Detected',
          description: `Application error rate is ${(metrics.errorRate * 100).toFixed(2)}% which exceeds recommended threshold`,
          remediation: 'Investigate and fix the root causes of errors to reduce error rate below 5%',
          evidence: { errorRate: metrics.errorRate, metrics }
        });
      }

      // Test error boundary functionality
      try {
        throw new Error('Test error for audit');
      } catch (testError) {
        errorMonitor.recordError(testError as Error, {
          component: 'SecurityAuditor',
          action: 'error_handling_test'
        });
      }

    } catch (error) {
      this.addFinding({
        id: 'error_999',
        severity: 'low',
        category: 'monitoring',
        title: 'Error Handling Audit Error',
        description: 'Unable to complete error handling audit',
        remediation: 'Review error handling and monitoring implementation',
        evidence: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  private async auditLogging(): Promise<void> {
    try {
      // Check logging configuration
      const recentLogs = logger.getRecentLogs(50);

      if (recentLogs.length === 0) {
        this.addFinding({
          id: 'log_001',
          severity: 'medium',
          category: 'monitoring',
          title: 'No Recent Log Activity',
          description: 'No log entries found in recent logs, logging may not be working properly',
          remediation: 'Verify logging configuration and ensure all important events are being logged'
        });
      }

      // Check for sensitive data in logs
      const sensitivePatterns = [/password/i, /token/i, /secret/i, /key/i];
      const problematicLogs = recentLogs.filter(log => 
        sensitivePatterns.some(pattern => 
          pattern.test(JSON.stringify(log.metadata || {}))
        )
      );

      if (problematicLogs.length > 0) {
        this.addFinding({
          id: 'log_002',
          severity: 'high',
          category: 'monitoring',
          title: 'Sensitive Data in Logs',
          description: 'Log entries contain potentially sensitive information',
          remediation: 'Implement log sanitization to remove sensitive data before logging',
          evidence: { count: problematicLogs.length }
        });
      }

    } catch (error) {
      this.addFinding({
        id: 'log_999',
        severity: 'low',
        category: 'monitoring',
        title: 'Logging Audit Error',
        description: 'Unable to complete logging audit',
        remediation: 'Review logging implementation',
        evidence: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  private async auditConfiguration(): Promise<void> {
    try {
      // Check environment configuration
      const isDev = import.meta.env.DEV;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        this.addFinding({
          id: 'config_001',
          severity: 'critical',
          category: 'configuration',
          title: 'Missing Environment Configuration',
          description: 'Required Supabase configuration variables are missing',
          remediation: 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables'
        });
      }

      if (isDev && typeof window !== 'undefined' && window.location.protocol !== 'https:') {
        this.addFinding({
          id: 'config_002',
          severity: 'info',
          category: 'configuration',
          title: 'Development Environment Detected',
          description: 'Application is running in development mode without HTTPS',
          remediation: 'Ensure HTTPS is enforced in production deployment'
        });
      }

      // Check for debug mode in production
      if (!isDev && console.log !== undefined) {
        this.addFinding({
          id: 'config_003',
          severity: 'medium',
          category: 'configuration',
          title: 'Console Logging in Production',
          description: 'Console logging is enabled in production build',
          remediation: 'Remove console logging in production builds to prevent information disclosure'
        });
      }

    } catch (error) {
      this.addFinding({
        id: 'config_999',
        severity: 'low',
        category: 'configuration',
        title: 'Configuration Audit Error',
        description: 'Unable to complete configuration audit',
        remediation: 'Review application configuration',
        evidence: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  private async auditDataProtection(): Promise<void> {
    try {
      // Check for data exposure in browser storage
      const localStorageKeys = Object.keys(localStorage);
      const sensitiveKeys = localStorageKeys.filter(key => 
        key.includes('password') || 
        key.includes('token') || 
        key.includes('secret') ||
        key.includes('key')
      );

      if (sensitiveKeys.length > 0) {
        this.addFinding({
          id: 'data_001',
          severity: 'high',
          category: 'authorization',
          title: 'Sensitive Data in Browser Storage',
          description: 'Potentially sensitive data keys found in localStorage',
          remediation: 'Move sensitive data to secure HTTP-only cookies or remove from client storage',
          evidence: { sensitiveKeys }
        });
      }

      // Check for data in sessionStorage
      const sessionStorageKeys = Object.keys(sessionStorage);
      if (sessionStorageKeys.length > 0) {
        this.addFinding({
          id: 'data_002',
          severity: 'info',
          category: 'authorization',
          title: 'Data in Session Storage',
          description: 'Data found in sessionStorage',
          remediation: 'Review data stored in sessionStorage for sensitivity',
          evidence: { sessionStorageKeys }
        });
      }

    } catch (error) {
      this.addFinding({
        id: 'data_999',
        severity: 'low',
        category: 'authorization',
        title: 'Data Protection Audit Error',
        description: 'Unable to complete data protection audit',
        remediation: 'Review data protection implementation',
        evidence: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  private addFinding(finding: Omit<SecurityFinding, 'id'> & { id: string }): void {
    this.findings.push(finding);
  }

  private generateAuditResult(): SecurityAuditResult {
    const severityWeights = {
      critical: 25,
      high: 10,
      medium: 5,
      low: 2,
      info: 0
    };

    const totalPenalty = this.findings.reduce(
      (sum, finding) => sum + severityWeights[finding.severity],
      0
    );

    const score = Math.max(0, 100 - totalPenalty);
    
    const level: SecurityAuditResult['level'] = 
      score >= 90 ? 'low' :
      score >= 70 ? 'medium' :
      score >= 50 ? 'high' : 'critical';

    const recommendations = this.generateRecommendations();
    const summary = this.generateSummary(score, level);

    return {
      score,
      level,
      findings: this.findings,
      recommendations,
      summary
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const criticalFindings = this.findings.filter(f => f.severity === 'critical');
    const highFindings = this.findings.filter(f => f.severity === 'high');

    if (criticalFindings.length > 0) {
      recommendations.push('🚨 IMMEDIATE ACTION REQUIRED: Address all critical security findings before deployment');
      recommendations.push('🔒 Implement strong input validation and output encoding');
      recommendations.push('🛡️ Review and strengthen authentication mechanisms');
    }

    if (highFindings.length > 0) {
      recommendations.push('⚠️ HIGH PRIORITY: Address high-severity findings within 24 hours');
      recommendations.push('📊 Implement comprehensive security monitoring');
      recommendations.push('🔐 Review session management and access controls');
    }

    // General recommendations
    recommendations.push('✅ Conduct regular security audits');
    recommendations.push('📝 Implement security logging and monitoring');
    recommendations.push('🔄 Keep dependencies up to date');
    recommendations.push('🧪 Implement automated security testing');

    return recommendations;
  }

  private generateSummary(score: number, level: SecurityAuditResult['level']): string {
    const criticalCount = this.findings.filter(f => f.severity === 'critical').length;
    const highCount = this.findings.filter(f => f.severity === 'high').length;
    const totalFindings = this.findings.length;

    if (level === 'critical') {
      return `🚨 CRITICAL: Security score ${score}/100. Found ${criticalCount} critical and ${highCount} high severity issues. Immediate action required before production deployment.`;
    } else if (level === 'high') {
      return `⚠️ HIGH RISK: Security score ${score}/100. Found ${totalFindings} security findings including ${criticalCount} critical issues. Address before deployment.`;
    } else if (level === 'medium') {
      return `🔶 MEDIUM RISK: Security score ${score}/100. Found ${totalFindings} security findings. Review and address high-priority items.`;
    } else {
      return `✅ LOW RISK: Security score ${score}/100. Found ${totalFindings} minor security findings. Good security posture with room for improvement.`;
    }
  }

  // Export audit report
  exportReport(result: SecurityAuditResult): string {
    const report = {
      timestamp: new Date().toISOString(),
      score: result.score,
      level: result.level,
      summary: result.summary,
      findings: result.findings,
      recommendations: result.recommendations,
      metadata: {
        auditDuration: Date.now() - this.startTime,
        auditorVersion: '1.0.0',
        environment: import.meta.env.DEV ? 'development' : 'production'
      }
    };

    return JSON.stringify(report, null, 2);
  }
}

// Singleton instance
export const securityAuditor = new SecurityAuditor();

export default securityAuditor;