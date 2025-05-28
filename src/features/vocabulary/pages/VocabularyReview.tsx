import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';
import { useVocabularyStore } from '../../../store/vocabularyStore';
import { VocabularyWord } from '../../../types/vocabulary';
import Button from '../../../shared/components/Button';

const VocabularyReview: React.FC = () => {
  const { 
    getWordsForReview, 
    updateWordMastery, 
    startReviewSession, 
    completeSession
  } = useVocabularyStore();

  const [reviewWords, setReviewWords] = useState<VocabularyWord[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ wordId: string; correct: boolean }[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    const words = getWordsForReview();
    setReviewWords(words.slice(0, 10)); // Limit to 10 words per session
    if (words.length > 0) {
      startReviewSession();
    }
  }, [getWordsForReview, startReviewSession]);

  const currentWord = reviewWords[currentWordIndex];

  const handleAnswer = (correct: boolean) => {
    if (!currentWord) return;

    updateWordMastery(currentWord.id, correct);
    
    const newResult = { wordId: currentWord.id, correct };
    const updatedResults = [...sessionResults, newResult];
    setSessionResults(updatedResults);

    if (currentWordIndex < reviewWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowDefinition(false);
    } else {
      // Session complete
      setSessionComplete(true);
      completeSession(updatedResults);
    }
  };

  const restartSession = () => {
    setCurrentWordIndex(0);
    setShowDefinition(false);
    setSessionResults([]);
    setSessionComplete(false);
    const words = getWordsForReview();
    setReviewWords(words.slice(0, 10));
  };

  if (reviewWords.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <Trophy size={48} className="mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-2">
          All Caught Up!
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          No words need review right now. Add more words or come back later.
        </p>
      </div>
    );
  }

  if (sessionComplete) {
    const correctAnswers = sessionResults.filter(r => r.correct).length;
    const accuracy = (correctAnswers / sessionResults.length) * 100;

    return (
      <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <Trophy size={48} className={`mx-auto mb-4 ${accuracy >= 80 ? 'text-green-500' : accuracy >= 60 ? 'text-yellow-500' : 'text-orange-500'}`} />
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          Session Complete!
        </h3>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
          You got {correctAnswers} out of {sessionResults.length} words correct ({Math.round(accuracy)}%)
        </p>
        
        <div className="flex justify-center space-x-4">
          <Button onClick={restartSession} leftIcon={<RotateCcw size={18} />}>
            Review Again
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Back to Vocabulary
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Word {currentWordIndex + 1} of {reviewWords.length}
          </span>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {Math.round(((currentWordIndex + 1) / reviewWords.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
          <div 
            className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ${
              currentWordIndex === 0 ? 'w-1/10' :
              currentWordIndex === 1 ? 'w-1/5' :
              currentWordIndex === 2 ? 'w-3/10' :
              currentWordIndex === 3 ? 'w-2/5' :
              currentWordIndex === 4 ? 'w-1/2' :
              currentWordIndex === 5 ? 'w-3/5' :
              currentWordIndex === 6 ? 'w-7/10' :
              currentWordIndex === 7 ? 'w-4/5' :
              currentWordIndex === 8 ? 'w-9/10' :
              'w-full'
            }`}
          />
        </div>
      </div>

      {/* Word Card */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
        <div className="mb-6">
          <Brain className="h-12 w-12 mx-auto text-blue-600 dark:text-blue-400 mb-4" />
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            {currentWord.word}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            {currentWord.pronunciation}
          </p>
        </div>

        {currentWord.contextSentence && (
          <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Context:</p>
            <p className="text-neutral-800 dark:text-neutral-200 italic">
              "{currentWord.contextSentence}"
            </p>
          </div>
        )}

        {!showDefinition ? (
          <div className="space-y-4">
            <p className="text-lg text-neutral-700 dark:text-neutral-300">
              Do you know what this word means?
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => setShowDefinition(true)}
                variant="outline"
              >
                Show Definition
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-lg text-neutral-800 dark:text-neutral-200 mb-2">
                {currentWord.definition}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {currentWord.partOfSpeech}
              </p>
            </div>

            {currentWord.examples.length > 0 && (
              <div className="text-left">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                  Examples:
                </p>
                <ul className="text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
                  {currentWord.examples.slice(0, 2).map((example, index) => (
                    <li key={index} className="italic">• {example}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-lg text-neutral-700 dark:text-neutral-300">
                Did you know this word?
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={() => handleAnswer(false)}
                  variant="outline"
                  leftIcon={<XCircle size={18} />}
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  No, I didn't know it
                </Button>
                <Button 
                  onClick={() => handleAnswer(true)}
                  leftIcon={<CheckCircle size={18} />}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Yes, I knew it
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VocabularyReview;