import React, { useEffect, useState } from 'react';
import { useReadingStore } from '../../../store/readingStore';

interface TextDisplayProps {
  text: string[];
  isReading: boolean;
  settings: {
    speed: number;
    fontSize: number;
    mode: 'word' | 'chunk';
    chunkSize: number;
  };
}

const TextDisplay: React.FC<TextDisplayProps> = ({ text, isReading, settings }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState('');
  const { progress } = useReadingStore();

  useEffect(() => {
    if (isReading) {
      const wordsPerSecond = settings.speed / 60;
      const interval = 1000 / wordsPerSecond;

      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex >= text.length - 1) {
            return prevIndex;
          }
          
          // Add natural reading animation
          setAnimationClass('reading-flow');
          setTimeout(() => setAnimationClass(''), 300);
          
          return prevIndex + (settings.mode === 'chunk' ? settings.chunkSize : 1);
        });
      }, interval * (settings.mode === 'chunk' ? settings.chunkSize : 1));

      return () => clearInterval(timer);
    }
  }, [isReading, settings.speed, settings.mode, settings.chunkSize, text.length]);

  // Update current index based on progress
  useEffect(() => {
    const targetIndex = Math.floor((progress / 100) * text.length);
    setCurrentIndex(targetIndex);
  }, [progress, text.length]);

  // Reset animation when progress is reset
  useEffect(() => {
    if (progress === 0) {
      setCurrentIndex(0);
      setAnimationClass('');
    }
  }, [progress]);

  const renderWordMode = () => {
    return (
      <div className="flex flex-wrap gap-1 justify-center items-center min-h-[200px]">
        {text.map((word, index) => (
          <span
            key={index}
            className={`
              transition-all duration-200 px-2 py-1 rounded-md font-medium
              ${index === currentIndex 
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-700 scale-105 shadow-sm' 
                : index < currentIndex 
                  ? 'text-gray-400 dark:text-gray-500 opacity-60' 
                  : 'text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400'
              }
            `}
            style={{ fontSize: `${settings.fontSize}px` }}
          >
            {word}
          </span>
        ))}
      </div>
    );
  };

  const renderChunkMode = () => {
    const currentChunk = text.slice(currentIndex, currentIndex + settings.chunkSize);
    const previousChunk = currentIndex > 0 ? text.slice(Math.max(0, currentIndex - settings.chunkSize), currentIndex) : [];
    const nextChunk = text.slice(currentIndex + settings.chunkSize, currentIndex + (settings.chunkSize * 2));

    return (
      <div className="min-h-[300px] flex flex-col justify-center space-y-6">
        {/* Previous chunk (context) */}
        {previousChunk.length > 0 && (
          <div className="text-center opacity-40 transition-all duration-500 transform translate-x-1">
            <div 
              className="text-gray-500 dark:text-gray-400 leading-relaxed"
              style={{ fontSize: `${settings.fontSize * 0.85}px` }}
            >
              {previousChunk.join(' ')}
            </div>
          </div>
        )}

        {/* Current chunk (main focus with enhanced readability) */}
        <div className={`text-center transition-all duration-300 ${animationClass}`}>
          <div 
            className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-8 font-medium text-gray-900 dark:text-gray-100 leading-relaxed shadow-xl max-w-4xl mx-auto relative overflow-hidden"
            style={{ fontSize: `${settings.fontSize}px` }}
          >
            {/* Subtle background highlight */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-blue-50/50 dark:from-blue-900/20 dark:via-indigo-900/10 dark:to-blue-900/20 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-wrap justify-center gap-x-2 gap-y-1">
              {currentChunk.map((word, index) => (
                <span
                  key={currentIndex + index}
                  className="inline-block transition-all duration-300 px-1 py-0.5 rounded-md text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 animate-fadeIn"
                  style={{ 
                    animationDelay: `${index * 60}ms`,
                    animationDuration: '400ms'
                  }}
                >
                  {word}
                </span>
              ))}
            </div>

            {/* Reading focus indicator */}
            <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 dark:bg-green-500 rounded-full animate-pulse shadow-lg"></div>
          </div>
        </div>

        {/* Next chunk (preview) */}
        {nextChunk.length > 0 && (
          <div className="text-center opacity-40 transition-all duration-500 transform -translate-x-1">
            <div 
              className="text-gray-500 dark:text-gray-400 leading-relaxed"
              style={{ fontSize: `${settings.fontSize * 0.85}px` }}
            >
              {nextChunk.slice(0, Math.min(12, nextChunk.length)).join(' ')}
              {nextChunk.length > 12 && '...'}
            </div>
          </div>
        )}

        {/* Enhanced reading flow indicator */}
        <div className="flex justify-center items-center space-x-4 mt-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="w-8 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse shadow-sm"></div>
            <div className="w-4 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium flex items-center">
            <span className="mr-1">📖</span>
            Reading flow →
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-xl p-8 transition-all duration-300 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg min-h-[400px]">
      <div className="relative z-10">
        {settings.mode === 'word' ? renderWordMode() : renderChunkMode()}
      </div>

      {/* Enhanced reading position indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-1.5">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className={`
                w-2.5 h-2.5 rounded-full transition-all duration-300
                ${i === Math.floor((currentIndex / text.length) * 5)
                  ? 'bg-blue-500 dark:bg-blue-400 scale-125 animate-pulse shadow-md'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }
              `}
            />
          ))}
        </div>
      </div>

      {/* Enhanced progress percentage */}
      <div className="absolute top-4 right-4 px-3 py-1 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {Math.round((currentIndex / text.length) * 100)}%
        </span>
      </div>

      {/* Reading mode indicator */}
      <div className="absolute top-4 left-4 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-700">
        <span className="text-xs font-medium text-blue-700 dark:text-blue-300 capitalize">
          {settings.mode} mode
        </span>
      </div>
    </div>
  );
};

export default TextDisplay;