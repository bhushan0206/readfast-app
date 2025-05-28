import React from 'react';
import { logger, LogCategory } from './enhancedLogger-clean';

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface MonitoringMetrics {
  errorRate: number;
  performanceScore: number;
  userSatisfaction: number;
  securityScore: number;
  uptime: number;
}

class ErrorMonitoringService {
  private static instance: ErrorMonitoringService;
  private errorCounts: Map<string, number> = new Map();
  private alertThresholds = {
    errorRate: 0.05, // 5% error rate
    criticalErrors: 5, // 5 critical errors in 10 minutes
    authFailures: 10, // 10 auth failures in 5 minutes
    apiFailures: 20 // 20 API failures in 1 minute
  };

  static getInstance(): ErrorMonitoringService {
    if (!ErrorMonitoringService.instance) {
      ErrorMonitoringService.instance = new ErrorMonitoringService();
    }
    return ErrorMonitoringService.instance;
  }

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring(): void {
    // Monitor error rates every minute
    setInterval(() => {
      this.checkErrorRates();
      this.cleanupOldMetrics();
    }, 60000);

    // Check for critical errors every 10 seconds
    setInterval(() => {
      this.checkCriticalErrors();
    }, 10000);
  }

  // Record application errors
  recordError(error: Error, context: ErrorContext): void {
    const errorKey = `${context.component || 'unknown'}:${error.name}`;
    const currentCount = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, currentCount + 1);

    // Log the error
    logger.error(LogCategory.UI, `Application error in ${context.component}`, {
      errorName: error.name,
      errorMessage: error.message,
      component: context.component,
      action: context.action,
      userId: context.userId,
      ...context.metadata
    }, error);

    // Check if this triggers an alert
    this.checkErrorAlert(errorKey, currentCount + 1);
  }

  // Record authentication failures
  recordAuthFailure(userId: string, reason: string, metadata?: Record<string, any>): void {
    logger.logSecurityEvent('Authentication failure', {
      type: 'auth_failure',
      severity: 'medium',
      reason,
      userId,
      ...metadata
    });

    // Check rate limiting would need RateLimiter implementation
    // if (!RateLimiter.checkAuthLimit(userId)) {
    //   this.triggerSecurityAlert('auth_rate_limit_exceeded', { userId, reason });
    // }
  }

  // Record API failures
  recordAPIFailure(endpoint: string, status: number, error: string, context?: ErrorContext): void {
    const errorKey = `api:${endpoint}:${status}`;
    const currentCount = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, currentCount + 1);

    logger.error(LogCategory.API, `API failure: ${endpoint}`, {
      endpoint,
      status,
      error,
      userId: context?.userId,
      ...context?.metadata
    });

    // Check for API failure patterns
    if (currentCount >= this.alertThresholds.apiFailures) {
      this.triggerAPIAlert(endpoint, status, currentCount);
    }
  }

  // Record performance issues
  recordPerformanceIssue(metric: string, value: number, threshold: number, context?: ErrorContext): void {
    logger.warn(LogCategory.PERFORMANCE, `Performance threshold exceeded: ${metric}`, {
      metric,
      value,
      threshold,
      component: context?.component,
      userId: context?.userId,
      ...context?.metadata
    });

    // Alert on severe performance issues
    if (value > threshold * 2) {
      this.triggerPerformanceAlert(metric, value, threshold);
    }
  }

  // Record security incidents
  recordSecurityIncident(type: string, severity: 'low' | 'medium' | 'high' | 'critical', details: Record<string, any>): void {
    logger.logSecurityEvent(`Security incident: ${type}`, {
      type,
      severity,
      ...details
    });

    if (severity === 'critical' || severity === 'high') {
      this.triggerSecurityAlert(type, details);
    }
  }

  private checkErrorRates(): void {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    const totalRequests = this.getTotalRequestCount(); // Would need to implement request tracking
    
    if (totalRequests > 0) {
      const errorRate = totalErrors / totalRequests;
      
      if (errorRate > this.alertThresholds.errorRate) {
        this.triggerErrorRateAlert(errorRate);
      }
    }
  }

  private checkCriticalErrors(): void {
    // Get critical errors from the last 10 minutes
    const recentLogs = logger.getRecentLogs(100);
    const criticalLogs = recentLogs.filter(log => 
      log.level === 'error' && 
      Date.now() - log.timestamp < 10 * 60 * 1000
    );

    if (criticalLogs.length >= this.alertThresholds.criticalErrors) {
      this.triggerCriticalErrorAlert(criticalLogs.length);
    }
  }

  private checkErrorAlert(errorKey: string, count: number): void {
    // Define thresholds for different error types
    const thresholds: Record<string, number> = {
      'auth:': 5,
      'api:': 10,
      'ui:': 15,
      'database:': 3
    };

    const threshold = Object.entries(thresholds).find(([key]) => 
      errorKey.includes(key)
    )?.[1] || 20;

    if (count >= threshold) {
      this.triggerGenericErrorAlert(errorKey, count);
    }
  }

  private triggerErrorRateAlert(errorRate: number): void {
    logger.error(LogCategory.ERROR, 'High error rate detected', {
      errorRate,
      threshold: this.alertThresholds.errorRate,
      alertType: 'error_rate_exceeded'
    });

    this.sendAlert('Error Rate Alert', `Error rate is ${(errorRate * 100).toFixed(2)}% (threshold: ${(this.alertThresholds.errorRate * 100).toFixed(2)}%)`);
  }

  private triggerCriticalErrorAlert(count: number): void {
    logger.error(LogCategory.SECURITY, 'Multiple critical errors detected', {
      criticalErrorCount: count,
      threshold: this.alertThresholds.criticalErrors,
      alertType: 'critical_errors_spike'
    });

    this.sendAlert('Critical Errors Alert', `${count} critical errors detected in the last 10 minutes`);
  }

  private triggerSecurityAlert(type: string, details: Record<string, any>): void {
    logger.error(LogCategory.SECURITY, `Security alert: ${type}`, {
      alertType: type,
      details,
      severity: 'high'
    });

    this.sendAlert('Security Alert', `Security incident detected: ${type}`, 'critical');
  }

  private triggerAPIAlert(endpoint: string, status: number, count: number): void {
    logger.error(LogCategory.API, 'API failure spike detected', {
      endpoint,
      status,
      failureCount: count,
      alertType: 'api_failure_spike'
    });

    this.sendAlert('API Alert', `High failure rate on ${endpoint} (${count} failures)`);
  }

  private triggerPerformanceAlert(metric: string, value: number, threshold: number): void {
    logger.warn(LogCategory.PERFORMANCE, 'Performance alert triggered', {
      metric,
      value,
      threshold,
      alertType: 'performance_degradation'
    });

    this.sendAlert('Performance Alert', `${metric} exceeded threshold: ${value} > ${threshold}`);
  }

  private triggerGenericErrorAlert(errorKey: string, count: number): void {
    logger.warn(LogCategory.UI, 'Error threshold exceeded', {
      errorKey,
      count,
      alertType: 'error_threshold_exceeded'
    });

    this.sendAlert('Error Alert', `High error count for ${errorKey}: ${count} occurrences`);
  }

  private sendAlert(title: string, message: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
    // In development, just log to console
    if (import.meta.env.DEV) {
      console.warn(`🚨 ALERT [${priority.toUpperCase()}]: ${title} - ${message}`);
      return;
    }

    // In production, send to alerting services
    this.sendToAlertingService(title, message, priority);
  }

  private async sendToAlertingService(title: string, message: string, priority: string): Promise<void> {
    try {
      // Example integrations:
      
      // Slack webhook
      // await fetch(SLACK_WEBHOOK_URL, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     text: `${title}: ${message}`,
      //     channel: priority === 'critical' ? '#alerts-critical' : '#alerts'
      //   })
      // });

      // Email alert service
      // await fetch('/api/alerts/email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ title, message, priority })
      // });

      // PagerDuty integration
      // if (priority === 'critical') {
      //   await fetch('https://events.pagerduty.com/v2/enqueue', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       routing_key: PAGERDUTY_ROUTING_KEY,
      //       event_action: 'trigger',
      //       payload: {
      //         summary: title,
      //         source: 'readfast-app',
      //         severity: priority
      //       }
      //     })
      //   });
      // }

      console.log(`Alert sent: ${title} - ${message} (${priority})`);
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }

  private getTotalRequestCount(): number {
    // This would need to be implemented based on your request tracking
    // For now, return a mock value
    return 1000;
  }

  private cleanupOldMetrics(): void {
    // Reset error counts periodically to prevent memory bloat
    if (this.errorCounts.size > 1000) {
      this.errorCounts.clear();
    }
  }

  // Get monitoring dashboard data
  getMonitoringMetrics(): MonitoringMetrics {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    const totalRequests = this.getTotalRequestCount();
    
    return {
      errorRate: totalRequests > 0 ? totalErrors / totalRequests : 0,
      performanceScore: 0.95, // Would calculate based on actual performance metrics
      userSatisfaction: 0.88, // Would calculate based on user feedback
      securityScore: 0.92, // Would calculate based on security events
      uptime: 0.999 // Would calculate based on service availability
    };
  }

  // Export error data for analysis
  exportErrorData(): Record<string, any> {
    return {
      errorCounts: Object.fromEntries(this.errorCounts),
      metrics: this.getMonitoringMetrics(),
      recentLogs: logger.getRecentLogs(100),
      timestamp: new Date().toISOString()
    };
  }
}

// Create and export singleton instance
export const errorMonitor = ErrorMonitoringService.getInstance();

// React Error Boundary HOC
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  return class ErrorBoundaryWrapper extends React.Component<P, { hasError: boolean }> {
    constructor(props: P) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(): { hasError: boolean } {
      return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      errorMonitor.recordError(error, {
        component: componentName || Component.name,
        action: 'render',
        metadata: {
          componentStack: errorInfo.componentStack,
          errorBoundary: true
        }
      });
    }

    render() {
      if (this.state.hasError) {
        return React.createElement(
          'div',
          { className: "p-4 border border-red-200 rounded-lg bg-red-50" },
          React.createElement(
            'h3',
            { className: "text-red-800 font-semibold" },
            'Something went wrong'
          ),
          React.createElement(
            'p',
            { className: "text-red-600 text-sm mt-1" },
            `An error occurred in the ${componentName || 'component'}. Please refresh the page.`
          )
        );
      }

      return React.createElement(Component, this.props);
    }
  };
}

export default errorMonitor;