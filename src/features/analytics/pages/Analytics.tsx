import React from 'react';
import { BarChart3, TrendingUp, Clock, BookOpen, Target, Eye, Zap, Download } from 'lucide-react';

const Analytics: React.FC = () => {
  const handleExportData = () => {
    // Sample analytics data
    const analyticsData = {
      summary: {
        readingSpeed: '245 WPM',
        comprehension: '89%',
        readingTime: '4.2h',
        booksRead: 12
      },
      recentSessions: [
        { book: 'The Great Gatsby', duration: '45 min', speed: '255 WPM', date: '2 hours ago' },
        { book: 'To Kill a Mockingbird', duration: '32 min', speed: '240 WPM', date: '1 day ago' },
        { book: '1984', duration: '28 min', speed: '265 WPM', date: '2 days ago' },
        { book: 'Pride and Prejudice', duration: '51 min', speed: '235 WPM', date: '3 days ago' }
      ],
      progressData: [
        { period: 'Last 7 days', speed: '245 WPM', change: '+12%' },
        { period: 'Last 30 days', speed: '238 WPM', change: '+18%' },
        { period: 'Last 90 days', speed: '225 WPM', change: '+25%' }
      ]
    };

    // Convert to CSV format
    let csvContent = "Reading Analytics Export\n\n";
    
    // Summary section
    csvContent += "Summary\n";
    csvContent += "Metric,Value\n";
    csvContent += `Reading Speed,${analyticsData.summary.readingSpeed}\n`;
    csvContent += `Comprehension,${analyticsData.summary.comprehension}\n`;
    csvContent += `Reading Time (Today),${analyticsData.summary.readingTime}\n`;
    csvContent += `Books Read (This Month),${analyticsData.summary.booksRead}\n\n`;
    
    // Recent sessions
    csvContent += "Recent Reading Sessions\n";
    csvContent += "Book,Duration,Speed,Date\n";
    analyticsData.recentSessions.forEach(session => {
      csvContent += `"${session.book}",${session.duration},${session.speed},${session.date}\n`;
    });
    
    csvContent += "\nSpeed Improvement\n";
    csvContent += "Period,Speed,Change\n";
    analyticsData.progressData.forEach(item => {
      csvContent += `${item.period},${item.speed},${item.change}\n`;
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `reading-analytics-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Track your reading progress and performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleExportData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Reading Speed</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">245 WPM</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">+12% from last week</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Comprehension</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">89%</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">+5% from last week</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Reading Time</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">4.2h</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Today</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full">
              <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Books Read</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">12</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">This month</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full">
              <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reading Progress Chart */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Reading Progress</h3>
            <BarChart3 className="h-5 w-5 text-neutral-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">This Week</span>
              <span className="text-sm font-medium text-neutral-900 dark:text-white">85%</span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full w-[85%]"></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Monthly Goal</span>
              <span className="text-sm font-medium text-neutral-900 dark:text-white">67%</span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full w-[67%]"></div>
            </div>
          </div>
        </div>

        {/* Speed Improvement */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Speed Improvement</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-3">
            {[
              { period: 'Last 7 days', speed: '245 WPM', change: '+12%', color: 'text-green-600' },
              { period: 'Last 30 days', speed: '238 WPM', change: '+18%', color: 'text-green-600' },
              { period: 'Last 90 days', speed: '225 WPM', change: '+25%', color: 'text-green-600' },
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{item.period}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">{item.speed}</p>
                </div>
                <span className={`text-sm font-medium ${item.color}`}>{item.change}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Recent Reading Sessions</h3>
        <div className="space-y-3">
          {[
            { book: 'The Great Gatsby', duration: '45 min', speed: '255 WPM', date: '2 hours ago' },
            { book: 'To Kill a Mockingbird', duration: '32 min', speed: '240 WPM', date: '1 day ago' },
            { book: '1984', duration: '28 min', speed: '265 WPM', date: '2 days ago' },
            { book: 'Pride and Prejudice', duration: '51 min', speed: '235 WPM', date: '3 days ago' },
          ].map((session, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-full">
                  <Eye className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">{session.book}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">{session.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{session.speed}</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">{session.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;