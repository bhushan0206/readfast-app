import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, Clock } from 'lucide-react';

interface TextCardProps {
  text: {
    id: string;
    title: string;
    content: string;
    category: string | null;
    difficulty: number;
    is_custom: boolean;
    created_at: string;
  };
}

const TextCard: React.FC<TextCardProps> = ({ text }) => {
  // Calculate estimated reading time based on 200 words per minute
  const wordCount = text.content.split(/\s+/).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  
  // Truncate content for preview
  const contentPreview = text.content.substring(0, 120) + (text.content.length > 120 ? '...' : '');
  
  return (
    <Link to={`/read/${text.id}`} className="card hover:shadow-md transition-shadow h-full flex flex-col bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{text.title}</h3>
          {text.is_custom && (
            <span className="badge badge-primary bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full text-xs">Custom</span>
          )}
        </div>
        
        <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-4">{contentPreview}</p>
        
        <div className="flex items-center space-x-4 mb-2">
          <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
            <BookOpen size={16} className="mr-1" />
            <span>{wordCount} words</span>
          </div>
          <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
            <Clock size={16} className="mr-1" />
            <span>{readingTimeMinutes} min</span>
          </div>
        </div>
      </div>
      
      <div className="pt-4 mt-2 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
        <div className="flex items-center">
          {text.category && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-full">
              {text.category}
            </span>
          )}
        </div>
        
        <div className="flex items-center">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={14}
                className={index < text.difficulty ? 'fill-warning-400 text-warning-400 dark:fill-warning-500 dark:text-warning-500' : 'text-neutral-300 dark:text-neutral-600'}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TextCard;