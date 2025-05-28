import React from 'react';
import { Brain, Clock, BarChart3, Target, BookOpen, Lightbulb } from 'lucide-react';
import { TextAnalysis } from '../../../utils/textAnalysis';

interface Props {
  analysis: TextAnalysis;
  isExpanded: boolean;
  onToggle: () => void;
}

const TextAnalysisCard: React.FC<Props> = ({ analysis, isExpanded, onToggle }) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50';
      case 'Intermediate': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50';
      case 'Advanced': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50';
      case 'Expert': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50';
      default: return 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900/50';
    }
  };

  const getReadabilityLabel = (score: number) => {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      {/* Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Text Analysis</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {analysis.difficultyLevel} · {analysis.estimatedTime} min read
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(analysis.difficultyLevel)}`}>
              {analysis.difficultyLevel}
            </span>
            <svg
              className={`w-5 h-5 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg inline-flex">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white mt-1">
                {analysis.estimatedTime} min
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Reading Time</p>
            </div>

            <div className="text-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg inline-flex">
                <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white mt-1">
                {analysis.vocabularyAnalysis.totalWords}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Words</p>
            </div>

            <div className="text-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg inline-flex">
                <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white mt-1">
                {analysis.fleschKincaid}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Readability</p>
            </div>

            <div className="text-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg inline-flex">
                <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white mt-1">
                {analysis.vocabularyAnalysis.vocabularyLevel}%
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Vocab Level</p>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Readability Score
                </span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {getReadabilityLabel(analysis.fleschKincaid)}
                </span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min(100, Math.max(0, analysis.fleschKincaid))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Vocabulary Complexity
                </span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {analysis.vocabularyAnalysis.vocabularyLevel}%
                </span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min(100, Math.max(0, analysis.vocabularyAnalysis.vocabularyLevel))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Key Topics */}
          {analysis.topics.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Key Topics
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.topics.slice(0, 5).map((topic, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full text-xs font-medium"
                  >
                    {topic.word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Recommendations
                </h4>
              </div>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg"
                  >
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vocabulary Insights */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Vocabulary Insights
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">Unique words:</span>
                <span className="ml-1 font-medium text-neutral-900 dark:text-white">
                  {analysis.vocabularyAnalysis.uniqueWords}
                </span>
              </div>
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">SMOG Index:</span>
                <span className="ml-1 font-medium text-neutral-900 dark:text-white">
                  {analysis.smogIndex}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextAnalysisCard;