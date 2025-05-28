// Enhanced Logging System with Categorization and Performance Tracking

export enum LogCategory {
  AUTH = 'AUTH',
  SECURITY = 'SECURITY', 
  PERFORMANCE = 'PERFORMANCE',
  USER_ACTION = 'USER_ACTION',
  ERROR = 'ERROR',
  API = 'API',
  READING = 'READING',
  UI = 'UI'
}

interface LogEntry {
  id: string;
  timestamp: number;
  category: LogCategory;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, any>;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

class EnhancedLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private createLogEntry(
    category: LogCategory,
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      id: Math.random().toString(36).substring(2, 15),
      timestamp: Date.now(),
      category,
      level,
      message,
      metadata,
      error,
      sessionId: this.sessionId
    };
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    if (import.meta.env.DEV) {
      const logMethod = entry.level === 'error' ? console.error : 
                      entry.level === 'warn' ? console.warn : 
                      entry.level === 'debug' ? console.debug : console.log;
      
      logMethod(`[${entry.category}] ${entry.message}`, entry.metadata || '', entry.error || '');
    }
  }

  // Main logging methods
  info(category: LogCategory, message: string, metadata?: Record<string, any>): void {
    this.addLog(this.createLogEntry(category, 'info', message, metadata));
  }

  warn(category: LogCategory, message: string, metadata?: Record<string, any>): void {
    this.addLog(this.createLogEntry(category, 'warn', message, metadata));
  }

  error(category: LogCategory, message: string, metadata?: Record<string, any>, error?: Error): void {
    this.addLog(this.createLogEntry(category, 'error', message, metadata, error));
  }

  debug(category: LogCategory, message: string, metadata?: Record<string, any>): void {
    this.addLog(this.createLogEntry(category, 'debug', message, metadata));
  }

  // Security-specific logging
  logSecurityEvent(event: string, metadata?: Record<string, any>): void {
    this.info(LogCategory.SECURITY, `Security Event: ${event}`, metadata);
  }

  // Performance tracking
  logPerformance(operation: string, duration: number, metadata?: Record<string, any>): void {
    this.info(LogCategory.PERFORMANCE, `Performance: ${operation}`, {
      duration: `${duration}ms`,
      ...(metadata || {})
    });
  }

  // User action tracking
  logUserAction(action: string, userId?: string, metadata?: Record<string, any>): void {
    this.info(LogCategory.USER_ACTION, `User Action: ${action}`, {
      userId,
      ...(metadata || {})
    });
  }

  // Get logs by category
  getLogsByCategory(category: LogCategory): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  // Get recent logs
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Export logs
  exportLogs(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      exportedAt: new Date().toISOString(),
      totalLogs: this.logs.length,
      logs: this.logs
    }, null, 2);
  }

  // Get log statistics
  getLogStats(): Record<string, any> {
    const stats = {
      total: this.logs.length,
      byCategory: {} as Record<string, number>,
      byLevel: {} as Record<string, number>,
      errors: this.logs.filter(log => log.level === 'error').length,
      warnings: this.logs.filter(log => log.level === 'warn').length
    };

    this.logs.forEach(log => {
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
    });

    return stats;
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    this.info(LogCategory.AUTH, 'Logs cleared');
  }

  // Search logs
  searchLogs(query: string): LogEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.logs.filter(log => 
      log.message.toLowerCase().includes(lowerQuery) ||
      JSON.stringify(log.metadata || {}).toLowerCase().includes(lowerQuery)
    );
  }
}

// Create singleton logger instance
export const logger = new EnhancedLogger();