import React from 'react';
import { Play, BookOpen, Zap, Target } from 'lucide-react';

const VocabularyDemo: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Vocabulary Demo</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Try our vocabulary building exercises
          </p>
        </div>
      </div>

      {/* Demo Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full mr-4">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Word Association</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Learn through context</p>
            </div>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Build vocabulary naturally by learning words in context and creating associations.
          </p>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Try Demo
          </button>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full mr-4">
              <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Speed Recognition</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Quick recall practice</p>
            </div>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Improve recognition speed with rapid-fire vocabulary exercises.
          </p>
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Try Demo
          </button>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full mr-4">
              <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Precision Mode</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Detailed learning</p>
            </div>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Deep dive into word meanings, etymology, and usage patterns.
          </p>
          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Try Demo
          </button>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full mr-4">
              <Play className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Interactive Quiz</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Gamified learning</p>
            </div>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Engaging quiz format with immediate feedback and progress tracking.
          </p>
          <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            Try Demo
          </button>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 p-6 rounded-lg border border-primary-200 dark:border-primary-700">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Ready to Get Started?</h3>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          Join thousands of users improving their vocabulary with our proven system.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Start Building Vocabulary
          </button>
          <button className="px-6 py-3 border border-primary-600 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default VocabularyDemo;