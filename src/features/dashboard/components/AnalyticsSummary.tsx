import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Clock, Target, ArrowRight } from 'lucide-react';
import { useAnalyticsStore } from '../../../store/analyticsStore';

const AnalyticsSummary: React.FC = () => {
  const { 
    insights, 
    loading, 
    initialized, 
    loadAnalytics, 
    getPerformanceMetrics 
  } = useAnalyticsStore();

  useEffect(() => {
    if (!initialized) {
      loadAnalytics();
    }
  }, [initialized, loadAnalytics]);

  const metrics = getPerformanceMetrics();
  const topInsights = insights.slice(0, 2);

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Reading Analytics
          </h3>
        </div>
        <Link
          to="/analytics"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-1"
        >
          <span>View All</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {metrics.avgWPM}
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Avg WPM</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {Math.round(metrics.totalWords / 1000)}K
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Words Read</p>
        </div>
      </div>

      {/* Top Insights */}
      <div className="space-y-3">
        {topInsights.length > 0 ? (
          topInsights.map((insight, index) => (
            <div key={index} className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-neutral-900 dark:text-white">
                  {insight.title}
                </h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  insight.trend === 'up' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                    : insight.trend === 'down' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                }`}>
                  {insight.trend === 'up' ? '↗️' : insight.trend === 'down' ? '↘️' : '→'}
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {insight.description}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <Clock className="h-8 w-8 text-neutral-400 dark:text-neutral-600 mx-auto mb-2" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Start reading to see your analytics
            </p>
          </div>
        )}
      </div>

      {/* Progress Indicators */}
      {metrics.consistencyScore > 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Reading Consistency
            </span>
            <span className="text-sm font-medium text-neutral-900 dark:text-white">
              {metrics.consistencyScore}%
            </span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, metrics.consistencyScore))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsSummary;