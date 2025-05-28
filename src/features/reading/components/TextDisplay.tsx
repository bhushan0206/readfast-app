import React, { useEffect, useState, useRef } from 'react';
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
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayWords, setDisplayWords] = useState<string[]>([]);
  const intervalRef = useRef<number | null>(null);
  const { updateProgress } = useReadingStore();
  
  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Handle reading state changes
  useEffect(() => {
    if (isReading) {
      startReading();
    } else {
      stopReading();
    }
  }, [isReading, settings.speed]); // Restart when speed changes
  
  // Set initial display words
  useEffect(() => {
    updateDisplayWords(currentWordIndex);
  }, [currentWordIndex, settings.mode, settings.chunkSize]);
  
  const startReading = () => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Calculate interval based on WPM
    const msPerWord = 60000 / settings.speed;
    
    // Set new interval
    intervalRef.current = window.setInterval(() => {
      setCurrentWordIndex(prevIndex => {
        const newIndex = prevIndex + 1;
        
        // Stop at the end of text
        if (newIndex >= text.length) {
          stopReading();
          return prevIndex;
        }
        
        updateProgress(newIndex, text.length);
        return newIndex;
      });
    }, msPerWord);
  };
  
  const stopReading = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  
  const updateDisplayWords = (index: number) => {
    if (settings.mode === 'word') {
      setDisplayWords([text[index]]);
    } else {
      // Chunk mode - show multiple words
      const chunkSize = settings.chunkSize;
      const chunk = text.slice(index, index + chunkSize);
      setDisplayWords(chunk);
    }
  };

  return (
    <div 
      className={`text-center p-8 select-none text-neutral-900 dark:text-neutral-100`}
      style={{ fontSize: `${settings.fontSize}px` }}
    >
      {isReading ? (
        <div className="text-reveal">
          {displayWords.map((word, idx) => (
            <span key={idx} className={idx === 0 ? 'word-focus' : ''}>
              {word}{' '}
            </span>
          ))}
        </div>
      ) : (
        <div className="text-left">
          {text.slice(0, 100).map((word, idx) => (
            <span key={idx}>
              {word}{' '}
            </span>
          ))}
          {text.length > 100 && <span>...</span>}
        </div>
      )}
    </div>
  );
};

export default TextDisplay;