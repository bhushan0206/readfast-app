import React from 'react';
import { Clock, BarChart3, Brain } from 'lucide-react';
import { useTextAnalysis } from '../../../hooks/useTextAnalysis';

interface Props {
  textId: string;
  content: string;
  className?: string;
}

const TextAnalysisPreview: React.FC<Props> = ({ textId, content, className = '' }) => {
  const { analysis, isAnalyzing } = useTextAnalysis(textId, content);

  if (isAnalyzing) {
    return (
      <div className={`flex items-center space-x-2 text-neutral-500 dark:text-neutral-400 ${className}`}>
        <div className="animate-spin h-3 w-3 border border-neutral-400 border-t-transparent rounded-full" />
        <span className="text-xs">Analyzing...</span>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'text-green-600 dark:text-green-400';
      case 'Intermediate': return 'text-blue-600 dark:text-blue-400';
      case 'Advanced': return 'text-orange-600 dark:text-orange-400';
      case 'Expert': return 'text-red-600 dark:text-red-400';
      default: return 'text-neutral-600 dark:text-neutral-400';
    }
  };

  return (
    <div className={`flex items-center space-x-4 text-xs ${className}`}>
      <div className="flex items-center space-x-1 text-neutral-600 dark:text-neutral-400">
        <Clock className="h-3 w-3" />
        <span>{analysis.estimatedTime}m</span>
      </div>
      
      <div className="flex items-center space-x-1 text-neutral-600 dark:text-neutral-400">
        <BarChart3 className="h-3 w-3" />
        <span>{analysis.fleschKincaid}</span>
      </div>
      
      <div className={`flex items-center space-x-1 ${getDifficultyColor(analysis.difficultyLevel)}`}>
        <Brain className="h-3 w-3" />
        <span>{analysis.difficultyLevel}</span>
      </div>
    </div>
  );
};

export default TextAnalysisPreview;