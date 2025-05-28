import { useState, useEffect } from 'react';
import { useVocabularyStore } from '../store/vocabularyStore';
import { analyzeVocabularyDifficulty } from '../utils/vocabularyAnalysis';

export const useVocabularyDetection = (text: string, textId?: string) => {
  const { userLevel, words, addWord } = useVocabularyStore();
  const [detectedWords, setDetectedWords] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!text || text.length < 50) {
      setDetectedWords([]);
      return;
    }

    setIsAnalyzing(true);
    
    // Debounce analysis
    const timeoutId = setTimeout(() => {
      try {
        const unknownWords = analyzeVocabularyDifficulty(text, userLevel);
        
        // Filter out words already in vocabulary
        const newWords = unknownWords.filter(word => 
          !words.some(w => w.word.toLowerCase() === word.toLowerCase())
        );
        
        setDetectedWords(newWords.slice(0, 10)); // Limit to 10 words
      } catch (error) {
        console.error('Error analyzing vocabulary:', error);
        setDetectedWords([]);
      } finally {
        setIsAnalyzing(false);
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      setIsAnalyzing(false);
    };
  }, [text, userLevel, words]);

  const addWordToVocabulary = async (word: string) => {
    if (!text) return;

    // Find context sentence containing the word
    const sentences = text.split(/[.!?]+/);
    const contextSentence = sentences.find(sentence => 
      sentence.toLowerCase().includes(word.toLowerCase())
    ) || text.substring(0, 200);

    try {
      await addWord(word, contextSentence.trim(), textId);
      
      // Remove word from detected list
      setDetectedWords(prev => prev.filter(w => w !== word));
      
      return true;
    } catch (error) {
      console.error('Error adding word to vocabulary:', error);
      return false;
    }
  };

  const addMultipleWords = async (selectedWords: string[]) => {
    const results = [];
    
    for (const word of selectedWords) {
      const success = await addWordToVocabulary(word);
      results.push({ word, success });
    }
    
    return results;
  };

  return {
    detectedWords,
    isAnalyzing,
    addWordToVocabulary,
    addMultipleWords,
    hasNewWords: detectedWords.length > 0
  };
};