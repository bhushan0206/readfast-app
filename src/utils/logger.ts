// Production-grade logging system
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export enum LogCategory {
  AUTH = 'AUTH',
  READING = 'READING',
  API = 'API',
  SECURITY = 'SECURITY',
  PERFORMANCE = 'PERFORMANCE',
  USER_ACTION = 'USER_ACTION',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
  stack?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private sessionId: string;
  private isProduction = process.env.NODE_ENV === 'production';

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupErrorHandlers();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    const minLevel = this.isProduction ? LogLevel.WARN : LogLevel.DEBUG;
    return level <= minLevel;
  }

  private formatMessage(level: LogLevel, category: LogCategory, message: string): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    return `[${timestamp}] [${levelName}] [${category}] ${message}`;
  }

  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      metadata,
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      ip: 'client-side', // Will be filled by server if needed
      stack: error?.stack,
    };
  }

  private getCurrentUserId(): string | undefined {
    try {
      // Try to get user ID from auth store or localStorage
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.user?.id;
      }
    } catch {
      // Ignore errors when getting user ID
    }
    return undefined;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Store in localStorage for persistence (only in development)
    if (!this.isProduction) {
      try {
        const recentLogs = this.logs.slice(-100); // Keep last 100 logs
        localStorage.setItem('app-logs', JSON.stringify(recentLogs));
      } catch {
        // Ignore storage errors
      }
    }
  }

  private setupErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.error(LogCategory.ERROR, `Global error: ${event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.error(LogCategory.ERROR, `Unhandled promise rejection: ${event.reason}`, {
        reason: event.reason,
        stack: event.reason?.stack,
      });
    });
  }

  // Public logging methods
  error(category: LogCategory, message: string, metadata?: Record<string, any>, error?: Error): void {
    const entry = this.createLogEntry(LogLevel.ERROR, category, message, metadata, error);
    this.addLog(entry);
    
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, category, message), metadata, error);
    }

    // Send critical errors to monitoring service in production
    if (this.isProduction && (category === LogCategory.SECURITY || category === LogCategory.ERROR)) {
      this.sendToMonitoring(entry);
    }
  }

  warn(category: LogCategory, message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.WARN, category, message, metadata);
    this.addLog(entry);
    
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, category, message), metadata);
    }
  }

  info(category: LogCategory, message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.INFO, category, message, metadata);
    this.addLog(entry);
    
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, category, message), metadata);
    }
  }

  debug(category: LogCategory, message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, category, message, metadata);
    this.addLog(entry);
    
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, category, message), metadata);
    }
  }

  // Performance monitoring
  measurePerformance<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      
      if (duration > 100) { // Log slow operations
        this.warn(LogCategory.PERFORMANCE, `Slow operation: ${name}`, { duration });
      } else {
        this.debug(LogCategory.PERFORMANCE, `Performance: ${name}`, { duration });
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(LogCategory.PERFORMANCE, `Performance error in ${name}`, { duration }, error as Error);
      throw error;
    }
  }

  async measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      if (duration > 1000) { // Log slow async operations
        this.warn(LogCategory.PERFORMANCE, `Slow async operation: ${name}`, { duration });
      } else {
        this.debug(LogCategory.PERFORMANCE, `Async performance: ${name}`, { duration });
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(LogCategory.PERFORMANCE, `Async performance error in ${name}`, { duration }, error as Error);
      throw error;
    }
  }

  // User action tracking
  trackUserAction(action: string, metadata?: Record<string, any>): void {
    this.info(LogCategory.USER_ACTION, `User action: ${action}`, metadata);
  }

  // API request logging
  logApiRequest(method: string, url: string, status: number, duration: number, metadata?: Record<string, any>): void {
    const level = status >= 400 ? LogLevel.ERROR : status >= 300 ? LogLevel.WARN : LogLevel.INFO;
    const message = `API ${method} ${url} - ${status} (${duration}ms)`;
    
    const entry = this.createLogEntry(level, LogCategory.API, message, {
      method,
      url,
      status,
      duration,
      ...metadata,
    });
    
    this.addLog(entry);
    
    if (this.shouldLog(level)) {
      console.log(this.formatMessage(level, LogCategory.API, message), metadata);
    }
  }

  // Security event logging
  logSecurityEvent(event: string, metadata?: Record<string, any>): void {
    this.warn(LogCategory.SECURITY, `Security event: ${event}`, metadata);
  }

  // Get logs for debugging
  getLogs(category?: LogCategory, level?: LogLevel): LogEntry[] {
    return this.logs.filter(log => {
      if (category && log.category !== category) return false;
      if (level !== undefined && log.level > level) return false;
      return true;
    });
  }

  // Export logs for analysis
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Send to external monitoring service
  private async sendToMonitoring(entry: LogEntry): Promise<void> {
    try {
      // In a real application, you would send this to a service like Sentry, LogRocket, etc.
      // For now, we'll just log it
      console.error('CRITICAL ERROR:', entry);
      
      // Example: Send to Sentry
      // if (window.Sentry) {
      //   window.Sentry.captureException(new Error(entry.message), {
      //     tags: { category: entry.category },
      //     extra: entry.metadata,
      //     user: { id: entry.userId },
      //   });
      // }
    } catch (error) {
      console.error('Failed to send log to monitoring service:', error);
    }
  }
}

// Create singleton logger instance
export const logger = new Logger();

// Export convenience methods
export const logError = (category: LogCategory, message: string, metadata?: Record<string, any>, error?: Error) => 
  logger.error(category, message, metadata, error);

export const logWarn = (category: LogCategory, message: string, metadata?: Record<string, any>) => 
  logger.warn(category, message, metadata);

export const logInfo = (category: LogCategory, message: string, metadata?: Record<string, any>) => 
  logger.info(category, message, metadata);

export const logDebug = (category: LogCategory, message: string, metadata?: Record<string, any>) => 
  logger.debug(category, message, metadata);

export const trackAction = (action: string, metadata?: Record<string, any>) => 
  logger.trackUserAction(action, metadata);

export const measurePerf = <T>(name: string, fn: () => T): T => 
  logger.measurePerformance(name, fn);

export const measureAsyncPerf = <T>(name: string, fn: () => Promise<T>): Promise<T> => 
  logger.measureAsyncPerformance(name, fn);