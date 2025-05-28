import React from 'react';
import { BarChart3, TrendingUp, Brain, Target, BookOpen, Zap } from 'lucide-react';

const Analytics: React.FC = () => {
  // Add debug logging
  console.log('📊 Analytics component rendered - FIXED VERSION');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Reading Analytics</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Track your reading patterns and discover insights
          </p>
        </div>
      </div>

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Average Speed</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                250 <span className="text-sm font-normal">WPM</span>
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Words</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                15,420
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
              <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Comprehension</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                87%
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full">
              <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Consistency</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                92%
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
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Reading Speed Trend</h3>
          </div>
          <div className="h-48 flex items-center justify-center text-neutral-500 dark:text-neutral-400 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg">
            Chart will be rendered here (No SVG errors!)
          </div>
        </div>

        {/* Words Read */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Daily Words Read</h3>
          </div>
          <div className="h-48 flex items-center justify-center text-neutral-500 dark:text-neutral-400 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg">
            Chart will be rendered here (No SVG errors!)
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center mb-4">
          <Brain className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Insights & Recommendations</h3>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-neutral-900 dark:text-white">Reading Speed Improvement</h4>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                ↗️ up
              </span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Your reading speed has improved by 15% this week!
            </p>
            <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
              💡 Keep practicing daily to maintain this momentum
            </p>
          </div>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-neutral-900 dark:text-white">Comprehension Steady</h4>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                → stable
              </span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Your comprehension remains consistently high
            </p>
            <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
              💡 Great work maintaining understanding while increasing speed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;