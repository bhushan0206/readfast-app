import React, { useEffect, useState } from 'react';
import { useAnalyticsStore } from '../../../store/analyticsStore';
import { BarChart3, TrendingUp, Brain, Target, Calendar, BookOpen, Zap, Award } from 'lucide-react';
import { SimpleLineChart, SimpleBarChart, SimplePieChart } from '../components/SimpleCharts';
import AnalyticsDebug from '../components/AnalyticsDebug';

const Analytics: React.FC = () => {
  const {
    patterns,
    insights,
    loading,
    initialized,
    loadAnalytics,
    getPerformanceMetrics,
    getReadingTrends
  } = useAnalyticsStore();

  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '14' | '30'>('7');
  
  useEffect(() => {
    if (!initialized) {
      loadAnalytics();
    }
  }, [initialized, loadAnalytics]);

  const performanceMetrics = getPerformanceMetrics();
  const trendData = getReadingTrends(parseInt(selectedPeriod));

  // Prepare chart data
  const speedChartData = trendData.map(pattern => ({
    date: new Date(pattern.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: pattern.avgWPM
  }));

  const wordsChartData = trendData.map(pattern => ({
    date: new Date(pattern.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: pattern.wordsRead
  }));

  // Reading habits pie chart data
  const difficultyData = trendData.reduce((acc, pattern) => {
    const level = pattern.difficultyLevel;
    acc[level] = (acc[level] || 0) + pattern.sessionsCount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(difficultyData).map(([level, count]) => ({
    name: level,
    value: count,
    color: level === 'Beginner' ? '#10b981' :
           level === 'Intermediate' ? '#3b82f6' : 
           level === 'Advanced' ? '#f59e0b' :
           '#ef4444'
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Panel - Remove in production */}
      <AnalyticsDebug />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Reading Analytics</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Track your reading patterns and discover insights
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <label htmlFor="period-select" className="sr-only">Select time period</label>
          <select
            id="period-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '7' | '14' | '30')}
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Average Speed</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {performanceMetrics.avgWPM} <span className="text-sm font-normal">WPM</span>
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Words</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {performanceMetrics.totalWords.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
              <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Comprehension</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {performanceMetrics.avgComprehension}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full">
              <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="card bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Consistency</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {performanceMetrics.consistencyScore}%
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full">
              <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reading Speed Trend */}
        <div className="card bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Reading Speed Trend</h3>
          </div>
          <SimpleLineChart data={speedChartData} color="#3b82f6" />
        </div>

        {/* Words Read */}
        <div className="card bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Daily Words Read</h3>
          </div>
          <SimpleBarChart data={wordsChartData} color="#10b981" />
        </div>
      </div>

      {/* Reading Habits and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reading Difficulty Distribution */}
        {pieData.length > 0 && (
          <div className="card bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center mb-4">
              <Award className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Difficulty Levels</h3>
            </div>
            <SimplePieChart data={pieData} />
          </div>
        )}

        {/* Insights Section */}
        <div className="lg:col-span-2">
          <div className="card bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center mb-4">
              <Brain className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Insights & Recommendations</h3>
            </div>
            
            <div className="space-y-4">
              {insights.length > 0 ? insights.map((insight, index) => (
                <div key={index} className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-neutral-900 dark:text-white">{insight.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      insight.trend === 'up' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                      insight.trend === 'down' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                    }`}>
                      {insight.trend === 'up' ? '↗️' : insight.trend === 'down' ? '↘️' : '→'} {insight.trend}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{insight.description}</p>
                  {insight.recommendation && (
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                      💡 {insight.recommendation}
                    </p>
                  )}
                </div>
              )) : (
                <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">
                  Start reading to see your insights and recommendations!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;