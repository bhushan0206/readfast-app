import React from 'react';
import { Brain, Plus, Search, BookOpen, Target } from 'lucide-react';

const VocabularyBuilder: React.FC = () => {
  // Add debug logging
  console.log('📚 VocabularyBuilder component rendered - FIXED VERSION');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Vocabulary Builder</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Expand your vocabulary and improve reading comprehension
          </p>
        </div>
        
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Word</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Words Learned</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">127</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Review Today</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">15</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
              <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Mastery Rate</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">84%</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full">
              <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Search vocabulary..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>
          <select 
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            aria-label="Filter vocabulary by status"
          >
            <option value="all">All Words</option>
            <option value="learning">Learning</option>
            <option value="review">Review</option>
            <option value="mastered">Mastered</option>
          </select>
        </div>
      </div>

      {/* Word List */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Your Vocabulary</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {/* Sample vocabulary items */}
            {[
              { word: "Ubiquitous", definition: "Present, appearing, or found everywhere", level: "Advanced", status: "Learning" },
              { word: "Serendipity", definition: "The occurrence of events by chance in a happy way", level: "Intermediate", status: "Review" },
              { word: "Ephemeral", definition: "Lasting for a very short time", level: "Advanced", status: "Mastered" },
              { word: "Pragmatic", definition: "Dealing with things sensibly and realistically", level: "Intermediate", status: "Learning" }
            ].map((item, index) => (
              <div key={index} className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-semibold text-neutral-900 dark:text-white">{item.word}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.level === 'Advanced' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                      item.level === 'Intermediate' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                    }`}>
                      {item.level}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'Mastered' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                    item.status === 'Review' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{item.definition}</p>
                <div className="flex items-center space-x-2 mt-3">
                  <button className="px-3 py-1 text-sm bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 rounded">
                    Practice
                  </button>
                  <button className="px-3 py-1 text-sm bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 rounded">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyBuilder;