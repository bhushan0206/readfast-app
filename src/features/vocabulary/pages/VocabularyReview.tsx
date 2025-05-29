import React from 'react';
import { Brain, RotateCcw, CheckCircle } from 'lucide-react';

const VocabularyReview: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Vocabulary Review</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Review and practice your saved vocabulary
          </p>
        </div>
      </div>

      {/* Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Due Today</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">15</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full">
              <RotateCcw className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Mastered</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">84</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Accuracy</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">92%</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Review Session</h3>
        
        <div className="text-center py-12">
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg inline-block">
            <Brain className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">Ready to Review?</h4>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Test your knowledge of vocabulary words using spaced repetition
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Start Review Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyReview;