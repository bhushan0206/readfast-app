import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Eye, Clock, Users, Lock } from 'lucide-react';
import { logger, LogCategory, LogLevel } from '../../utils/logger';
import { securityConfig } from '../../config/security';
import Button from '../../shared/components/Button';

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'login_attempt' | 'failed_login' | 'suspicious_activity' | 'rate_limit' | 'security_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

const SecurityDashboard: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    // Load security events from logger
    const logs = logger.getLogs(LogCategory.SECURITY);
    const securityEvents: SecurityEvent[] = logs.map((log, index) => ({
      id: `sec-${index}`,
      timestamp: log.timestamp,
      type: determineEventType(log.message),
      severity: determineSeverity(log.level, log.message),
      message: log.message,
      userId: log.userId,
      ip: log.ip,
      userAgent: log.userAgent,
    }));

    setEvents(securityEvents.slice(-50)); // Show last 50 events
  }, []);

  const determineEventType = (message: string): SecurityEvent['type'] => {
    if (message.includes('login attempt')) return 'login_attempt';
    if (message.includes('failed') || message.includes('invalid')) return 'failed_login';
    if (message.includes('rate limit')) return 'rate_limit';
    if (message.includes('violation') || message.includes('unauthorized')) return 'security_violation';
    return 'suspicious_activity';
  };

  const determineSeverity = (level: LogLevel, message: string): SecurityEvent['severity'] => {
    if (level === LogLevel.ERROR) return 'critical';
    if (message.includes('rate limit') || message.includes('failed')) return 'high';
    if (message.includes('suspicious')) return 'medium';
    return 'low';
  };

  const filteredEvents = events.filter(event => 
    activeFilter === 'all' || event.severity === activeFilter
  );

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login_attempt': return <Users size={16} className="text-blue-500" />;
      case 'failed_login': return <AlertTriangle size={16} className="text-red-500" />;
      case 'rate_limit': return <Clock size={16} className="text-yellow-500" />;
      case 'security_violation': return <Shield size={16} className="text-red-600" />;
      default: return <Eye size={16} className="text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const exportLogs = () => {
    const logsData = logger.exportLogs();
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    if (confirm('Are you sure you want to clear all security logs?')) {
      localStorage.removeItem('app-logs');
      setEvents([]);
      logger.info(LogCategory.SECURITY, 'Security logs cleared by admin');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Monitor security events and system health</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={exportLogs}>
              Export Logs
            </Button>
            <Button variant="danger" onClick={clearLogs}>
              Clear Logs
            </Button>
          </div>
        </div>

        {/* Security Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Security Level</p>
                <p className="text-2xl font-bold text-green-600">Secure</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Failed Logins (24h)</p>
                <p className="text-2xl font-bold text-red-600">
                  {events.filter(e => e.type === 'failed_login' && 
                    Date.now() - new Date(e.timestamp).getTime() < 24 * 60 * 60 * 1000).length}
                </p>
              </div>
              <Lock className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Environment</p>
                <p className="text-2xl font-bold text-blue-600">
                  {securityConfig.IS_PRODUCTION ? 'Production' : 'Development'}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{events.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-4 overflow-x-auto">
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              <span className="ml-1 text-xs">
                ({filter === 'all' ? events.length : events.filter(e => e.severity === filter).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security Events</h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No security events found for the selected filter.
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getEventIcon(event.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(event.severity)}`}>
                          {event.severity.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{event.message}</p>
                      {event.userId && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          User ID: {event.userId.substring(0, 8)}***
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowDetails(showDetails === event.id ? null : event.id)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
                  >
                    {showDetails === event.id ? 'Hide' : 'Details'}
                  </button>
                </div>
                
                {showDetails === event.id && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div><strong>Event ID:</strong> {event.id}</div>
                      <div><strong>Type:</strong> {event.type}</div>
                      <div><strong>IP Address:</strong> {event.ip || 'N/A'}</div>
                      <div><strong>User Agent:</strong> {event.userAgent ? event.userAgent.substring(0, 50) + '...' : 'N/A'}</div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;