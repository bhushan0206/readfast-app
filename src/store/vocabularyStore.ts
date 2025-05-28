import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VocabularyWord, VocabularySession, VocabularyStats } from '../types/vocabulary';
import { 
  generateWordDefinition, 
  calculateSpacedRepetition, 
  getWordsForReview,
  generateVocabularyQuiz
} from '../utils/vocabularyAnalysis';

interface VocabularyState {
  // State
  words: VocabularyWord[];
  sessions: VocabularySession[];
  currentSession: VocabularySession | null;
  stats: VocabularyStats;
  loading: boolean;
  selectedWord: VocabularyWord | null;
  
  // Settings
  dailyGoal: number;
  userLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  notifications: boolean;
  
  // Actions
  addWord: (word: string, context: string, sourceText?: string) => Promise<void>;
  removeWord: (wordId: string) => void;
  updateWordMastery: (wordId: string, correct: boolean) => void;
  getWordsForReview: () => VocabularyWord[];
  startReviewSession: () => void;
  completeSession: (results: { wordId: string; correct: boolean }[]) => void;
  generateQuiz: (count?: number) => any[];
  searchWords: (query: string) => VocabularyWord[];
  getWordsByTag: (tag: string) => VocabularyWord[];
  updateStats: () => void;
  setSelectedWord: (word: VocabularyWord | null) => void;
  exportVocabulary: () => string;
  importVocabulary: (data: string) => void;
}

export const useVocabularyStore = create<VocabularyState>()(
  persist(
    (set, get) => ({
      // Initial state
      words: [],
      sessions: [],
      currentSession: null,
      stats: {
        totalWords: 0,
        wordsLearned: 0,
        wordsReviewing: 0,
        wordsMastered: 0,
        averageMastery: 0,
        streakDays: 0,
        weeklyGoal: 10,
        weeklyProgress: 0
      },
      loading: false,
      selectedWord: null,
      dailyGoal: 5,
      userLevel: 'intermediate',
      notifications: true,

      // Actions
      addWord: async (word: string, context: string, sourceText?: string) => {
        set({ loading: true });
        
        try {
          // Check if word already exists
          const existingWord = get().words.find(w => 
            w.word.toLowerCase() === word.toLowerCase()
          );
          
          if (existingWord) {
            set({ loading: false });
            return;
          }

          const vocabularyWord = await generateWordDefinition(word, context);
          if (sourceText) {
            vocabularyWord.sourceText = sourceText;
          }

          set(state => ({
            words: [...state.words, vocabularyWord],
            loading: false
          }));
          
          get().updateStats();
        } catch (error) {
          console.error('Error adding word:', error);
          set({ loading: false });
        }
      },

      removeWord: (wordId: string) => {
        set(state => ({
          words: state.words.filter(w => w.id !== wordId)
        }));
        get().updateStats();
      },

      updateWordMastery: (wordId: string, correct: boolean) => {
        set(state => ({
          words: state.words.map(word => {
            if (word.id === wordId) {
              const newMasteryLevel = correct 
                ? Math.min(word.masteryLevel + 1, 5)
                : Math.max(word.masteryLevel - 1, 0);
              
              return {
                ...word,
                masteryLevel: newMasteryLevel,
                reviewCount: word.reviewCount + 1,
                lastReviewed: new Date().toISOString(),
                nextReview: calculateSpacedRepetition(newMasteryLevel, new Date().toISOString())
              };
            }
            return word;
          })
        }));
        get().updateStats();
      },

      getWordsForReview: () => {
        const { words } = get();
        return getWordsForReview(words);
      },

      startReviewSession: () => {
        const wordsToReview = get().getWordsForReview();
        const sessionId = Date.now().toString();
        
        const session: VocabularySession = {
          id: sessionId,
          userId: 'current-user', // In real app, get from auth
          words: wordsToReview.slice(0, 10), // Limit to 10 words per session
          sessionType: 'review',
          correctAnswers: 0,
          totalQuestions: Math.min(wordsToReview.length, 10),
          duration: 0,
          createdAt: new Date().toISOString()
        };

        set({ currentSession: session });
      },

      completeSession: (results: { wordId: string; correct: boolean }[]) => {
        const { currentSession } = get();
        if (!currentSession) return;

        // Update word mastery based on results
        results.forEach(result => {
          get().updateWordMastery(result.wordId, result.correct);
        });

        // Update session stats
        const correctAnswers = results.filter(r => r.correct).length;
        const completedSession = {
          ...currentSession,
          correctAnswers,
          duration: Date.now() - new Date(currentSession.createdAt).getTime()
        };

        set(state => ({
          sessions: [...state.sessions, completedSession],
          currentSession: null
        }));

        get().updateStats();
      },

      generateQuiz: (count = 5) => {
        const { words } = get();
        const availableWords = words.filter(w => w.masteryLevel < 5);
        return generateVocabularyQuiz(availableWords, count);
      },

      searchWords: (query: string) => {
        const { words } = get();
        const lowercaseQuery = query.toLowerCase();
        
        return words.filter(word =>
          word.word.toLowerCase().includes(lowercaseQuery) ||
          word.definition.toLowerCase().includes(lowercaseQuery) ||
          word.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        );
      },

      getWordsByTag: (tag: string) => {
        const { words } = get();
        return words.filter(word => word.tags.includes(tag));
      },

      updateStats: () => {
        const { words, sessions } = get();
        
        const totalWords = words.length;
        const wordsLearned = words.filter(w => w.reviewCount > 0).length;
        const wordsReviewing = words.filter(w => w.masteryLevel > 0 && w.masteryLevel < 5).length;
        const wordsMastered = words.filter(w => w.masteryLevel === 5).length;
        const averageMastery = words.length > 0 
          ? words.reduce((sum, w) => sum + w.masteryLevel, 0) / words.length 
          : 0;

        // Calculate streak days
        const today = new Date();
        let streakDays = 0;
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          const dateStr = checkDate.toISOString().split('T')[0];
          
          const hasActivity = sessions.some(session => 
            session.createdAt.startsWith(dateStr)
          );
          
          if (hasActivity) {
            streakDays++;
          } else if (i > 0) {
            break; // Break streak if no activity (but don't count today if no activity yet)
          }
        }

        // Calculate weekly progress
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyProgress = words.filter(w => 
          new Date(w.dateAdded) >= weekAgo
        ).length;

        set({
          stats: {
            totalWords,
            wordsLearned,
            wordsReviewing,
            wordsMastered,
            averageMastery: Math.round(averageMastery * 10) / 10,
            streakDays,
            weeklyGoal: get().dailyGoal * 7,
            weeklyProgress
          }
        });
      },

      setSelectedWord: (word: VocabularyWord | null) => {
        set({ selectedWord: word });
      },

      exportVocabulary: () => {
        const { words, stats } = get();
        return JSON.stringify({ words, stats, exportDate: new Date().toISOString() });
      },

      importVocabulary: (data: string) => {
        try {
          const imported = JSON.parse(data);
          if (imported.words && Array.isArray(imported.words)) {
            set(state => ({
              words: [...state.words, ...imported.words]
            }));
            get().updateStats();
          }
        } catch (error) {
          console.error('Error importing vocabulary:', error);
        }
      }
    }),
    {
      name: 'vocabulary-storage',
      version: 1
    }
  )
);