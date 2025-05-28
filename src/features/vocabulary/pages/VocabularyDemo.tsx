import React, { useEffect } from 'react';
import { useVocabularyStore } from '../../../store/vocabularyStore';
import VocabularyDetector from '../../vocabulary/components/VocabularyDetector';
import { useVocabularyDetection } from '../../../hooks/useVocabularyDetection';

// Demo component showing vocabulary integration
const VocabularyDemo: React.FC = () => {
  const { addWord, words, getWordsForReview } = useVocabularyStore();
  
  // Sample text for demonstration
  const sampleText = `
    The magnificent cathedral stood resplendent against the azure sky, its elaborate Gothic architecture 
    manifesting centuries of meticulous craftsmanship. The perspicacious architect had demonstrated 
    remarkable ingenuity in incorporating both traditional and innovative elements. Visitors often found 
    themselves captivated by the intricate stonework and the transcendent beauty of the stained glass windows.
    
    The edifice served as a testament to human creativity and devotion, its spires reaching towards the 
    heavens in an eloquent expression of spiritual aspiration. Even the most recalcitrant critics 
    acknowledged the building's extraordinary significance in architectural history.
  `;

  const { detectedWords } = useVocabularyDetection(
    sampleText, 
    'demo-text'
  );

  const handleWordAdded = (word: string) => {
    console.log(`Added word to vocabulary: ${word}`);
  };

  useEffect(() => {
    // Add some sample words for demonstration
    const addSampleWords = async () => {
      if (words.length === 0) {
        await addWord('magnificent', 'The magnificent cathedral stood against the sky.', 'demo');
        await addWord('elaborate', 'The elaborate Gothic architecture was impressive.', 'demo');
        await addWord('perspicacious', 'The perspicacious architect showed great insight.', 'demo');
      }
    };
    
    addSampleWords();
  }, [addWord, words.length]);

  const reviewWords = getWordsForReview();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
          🧠 Smart Vocabulary Builder Demo
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          This demonstrates how the vocabulary builder integrates with reading sessions to enhance learning.
          Words are automatically detected based on your level and can be added to your personal vocabulary journal.
        </p>
      </div>

      {/* Vocabulary Detection Demo */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
          📖 Sample Reading Text
        </h2>
        <div className="prose dark:prose-invert max-w-none mb-6">
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {sampleText}
          </p>
        </div>
        
        <VocabularyDetector 
          text={sampleText}
          textId="demo-text"
          onWordAdded={handleWordAdded}
        />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Vocabulary Size
          </h3>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
            {words.length}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            Words in your journal
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-lg border border-green-200 dark:border-green-700">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
            Words Detected
          </h3>
          <p className="text-3xl font-bold text-green-700 dark:text-green-300">
            {detectedWords.length}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            New words found
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
            Ready for Review
          </h3>
          <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
            {reviewWords.length}
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
            Using spaced repetition
          </p>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
          ✨ Vocabulary Builder Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-white">Smart Detection</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Automatically identifies words that might be new to you based on your reading level
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-white">Contextual Learning</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Words are saved with the original context to help you remember their usage
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-white">Spaced Repetition</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Review words at optimal intervals to maximize retention and mastery
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-xs font-bold">4</span>
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-white">Rich Definitions</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Complete definitions with examples, etymology, and word relationships
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-xs font-bold">5</span>
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-white">Personal Journal</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Build your personal vocabulary collection with search, tags, and progress tracking
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-xs font-bold">6</span>
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-white">Analytics & Insights</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Track your vocabulary growth and learning patterns over time
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyDemo;