import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Activity, Eye, Download } from 'lucide-react';
import Button from '../../../shared/components/Button';
import { securityAuditor, SecurityAuditResult } from '../../../utils/securityAuditor';
import { errorMonitor } from '../../../utils/errorMonitoring';
import { logger } from '../../../utils/enhancedLogger';

const SecurityDashboard: React.FC = () => {
  const [auditResult, setAuditResult] = useState<SecurityAuditResult | null>(null);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [monitoringMetrics, setMonitoringMetrics] = useState(errorMonitor.getMonitoringMetrics());

  useEffect(() => {
    // Update metrics every 30 seconds
    const interval = setInterval(() => {
      setMonitoringMetrics(errorMonitor.getMonitoringMetrics());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const runSecurityAudit = async () => {
    setIsRunningAudit(true);
    try {
      const result = await securityAuditor.runFullAudit();
      setAuditResult(result);
    } catch (error) {
      console.error('Security audit failed:', error);
    } finally {
      setIsRunningAudit(false);
    }
  };

  const exportAuditReport = () => {
    if (!auditResult) return;
    
    const report = securityAuditor.exportReport(auditResult);
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportLogs = () => {
    const logs = logger.exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `application-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'info': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!import.meta.env.DEV) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-yellow-800">Security Dashboard</h3>
        </div>
        <p className="text-yellow-700 mt-2">
          Security dashboard is only available in development mode for security reasons.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <Shield className="w-6 h-6" />
          <span>Security Dashboard</span>
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            leftIcon={<Download size={18} />}
            onClick={exportLogs}
          >
            Export Logs
          </Button>
          <Button
            variant="primary"
            leftIcon={<Activity size={18} />}
            onClick={runSecurityAudit}
            disabled={isRunningAudit}
          >
            {isRunningAudit ? 'Running Audit...' : 'Run Security Audit'}
          </Button>
        </div>
      </div>

      {/* Monitoring Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Error Rate</h3>
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
          <p className={`text-2xl font-bold mt-1 ${monitoringMetrics.errorRate > 0.05 ? 'text-red-600' : 'text-green-600'}`}>
            {(monitoringMetrics.errorRate * 100).toFixed(2)}%
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Security Score</h3>
            <Shield className="w-4 h-4 text-gray-400" />
          </div>
          <p className={`text-2xl font-bold mt-1 ${auditResult ? getScoreColor(auditResult.score) : 'text-gray-400'}`}>
            {auditResult ? `${auditResult.score}/100` : 'N/A'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Performance</h3>
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold mt-1 text-blue-600">
            {(monitoringMetrics.performanceScore * 100).toFixed(1)}%
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Uptime</h3>
            <CheckCircle className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {(monitoringMetrics.uptime * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Security Audit Results */}
      {auditResult && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getLevelIcon(auditResult.level)}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Security Audit Results
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(auditResult.level)}`}>
                  {auditResult.level.toUpperCase()}
                </span>
              </div>
              <Button
                variant="outline"
                leftIcon={<Download size={16} />}
                onClick={exportAuditReport}
                size="sm"
              >
                Export Report
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {auditResult.summary}
            </p>
          </div>

          {/* Findings */}
          {auditResult.findings.length > 0 && (
            <div className="p-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                Security Findings ({auditResult.findings.length})
              </h4>
              <div className="space-y-3">
                {auditResult.findings.slice(0, 5).map((finding, index) => (
                  <div
                    key={finding.id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(finding.severity)}`}>
                            {finding.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">{finding.category}</span>
                        </div>
                        <h5 className="font-medium text-gray-900 dark:text-white mt-1">
                          {finding.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {finding.description}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                          <strong>Remediation:</strong> {finding.remediation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {auditResult.findings.length > 5 && (
                  <div className="text-center py-2">
                    <span className="text-sm text-gray-500">
                      ... and {auditResult.findings.length - 5} more findings
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {auditResult.recommendations.length > 0 && (
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Security Recommendations
              </h4>
              <ul className="space-y-2">
                {auditResult.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Development Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-yellow-600" />
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Development Mode</h4>
        </div>
        <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
          This security dashboard is only available in development mode. In production, 
          security monitoring should be handled by external services like Sentry, DataDog, or similar tools.
        </p>
      </div>
    </div>
  );
};

export default SecurityDashboard;