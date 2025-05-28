import React, { useState, useEffect } from 'react';
import { Brain, Plus, Info } from 'lucide-react';
import { useVocabularyStore } from '../../../store/vocabularyStore';
import { analyzeVocabularyDifficulty } from '../../../utils/vocabularyAnalysis';
import Button from '../../../shared/components/Button';

interface VocabularyDetectorProps {
  text: string;
  textId: string;
  onWordAdded?: (word: string) => void;
}

const VocabularyDetector: React.FC<VocabularyDetectorProps> = ({ 
  text, 
  textId, 
  onWordAdded 
}) => {
  const { userLevel, addWord, words } = useVocabularyStore();
  const [detectedWords, setDetectedWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (text) {
      const unknownWords = analyzeVocabularyDifficulty(text, userLevel);
      // Filter out words already in vocabulary
      const newWords = unknownWords.filter(word => 
        !words.some(w => w.word.toLowerCase() === word.toLowerCase())
      );
      setDetectedWords(newWords);
    }
  }, [text, userLevel, words]);

  const toggleWordSelection = (word: string) => {
    const newSelection = new Set(selectedWords);
    if (newSelection.has(word)) {
      newSelection.delete(word);
    } else {
      newSelection.add(word);
    }
    setSelectedWords(newSelection);
  };

  const addSelectedWords = async () => {
    if (selectedWords.size === 0) return;
    
    setLoading(true);
    
    try {
      for (const word of Array.from(selectedWords)) {
        // Find the sentence containing the word for context
        const sentences = text.split(/[.!?]+/);
        const contextSentence = sentences.find(sentence => 
          sentence.toLowerCase().includes(word.toLowerCase())
        ) || text.substring(0, 200);
        
        await addWord(word, contextSentence.trim(), textId);
        onWordAdded?.(word);
      }
      
      setSelectedWords(new Set());
    } catch (error) {
      console.error('Error adding words:', error);
    } finally {
      setLoading(false);
    }
  };

  if (detectedWords.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-700 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Vocabulary Opportunities
          </h3>
          <Info className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        </div>
        
        {selectedWords.size > 0 && (
          <Button
            onClick={addSelectedWords}
            isLoading={loading}
            leftIcon={<Plus size={16} />}
            size="sm"
          >
            Add {selectedWords.size} Words
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {detectedWords.slice(0, 15).map((word) => (
          <button
            key={word}
            onClick={() => toggleWordSelection(word)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedWords.has(word)
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 hover:bg-purple-100 dark:hover:bg-purple-900/50'
            }`}
          >
            {word}
          </button>
        ))}
      </div>

      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Found {detectedWords.length} potentially new words. Click to select words you'd like to learn.
      </p>
    </div>
  );
};

export default VocabularyDetector;