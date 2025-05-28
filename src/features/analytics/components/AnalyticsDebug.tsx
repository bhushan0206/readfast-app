import React, { useEffect } from 'react';
import { useAnalyticsStore } from '../../../store/analyticsStore';
import Button from '../../../shared/components/Button';

const AnalyticsDebug: React.FC = () => {
  const { 
    patterns, 
    insights, 
    loading, 
    initialized,
    resetAnalytics,
    getPerformanceMetrics 
  } = useAnalyticsStore();

  const generateSampleData = () => {
    // Reset first
    resetAnalytics();
    
    // Force sample data generation
    const samplePatterns = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip some days to make it realistic
      if (Math.random() < 0.3) continue;
      
      const wpm = Math.round(200 + Math.random() * 100);
      const wordsRead = Math.round(300 + Math.random() * 700);
      
      samplePatterns.push({
        date: date.toISOString().split('T')[0],
        avgWPM: wpm,
        wordsRead,
        sessionsCount: Math.round(1 + Math.random() * 2),
        comprehensionScore: Math.round(75 + Math.random() * 20),
        difficultyLevel: ['Beginner', 'Intermediate', 'Advanced', 'Expert'][Math.floor(Math.random() * 4)]
      });
    }
    
    // Manually set the patterns
    useAnalyticsStore.setState({ 
      patterns: samplePatterns, 
      initialized: true,
      loading: false 
    });
    
    // Generate insights
    useAnalyticsStore.getState().generateInsights();
  };

  const metrics = getPerformanceMetrics();

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
        Analytics Debug Panel
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Patterns</p>
          <p className="text-xl font-bold text-neutral-900 dark:text-white">{patterns.length}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Insights</p>
          <p className="text-xl font-bold text-neutral-900 dark:text-white">{insights.length}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Avg WPM</p>
          <p className="text-xl font-bold text-neutral-900 dark:text-white">{metrics.avgWPM}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Status</p>
          <p className={`text-sm font-medium ${
            initialized ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
          }`}>
            {loading ? 'Loading...' : initialized ? 'Ready' : 'Not loaded'}
          </p>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button onClick={generateSampleData} variant="secondary">
          Generate Sample Data
        </Button>
        <Button onClick={resetAnalytics} variant="outline">
          Reset Analytics
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsDebug;