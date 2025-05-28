export interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  pronunciation?: string;
  partOfSpeech: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  etymology?: string;
  examples: string[];
  synonyms: string[];
  antonyms: string[];
  contextSentence: string;
  sourceText?: string;
  dateAdded: string;
  lastReviewed?: string;
  reviewCount: number;
  masteryLevel: number; // 0-5 scale
  nextReview: string;
  tags: string[];
}

export interface VocabularySession {
  id: string;
  userId: string;
  words: VocabularyWord[];
  sessionType: 'discovery' | 'review' | 'quiz';
  correctAnswers: number;
  totalQuestions: number;
  duration: number;
  createdAt: string;
}

export interface WordRoot {
  root: string;
  meaning: string;
  origin: string;
  examples: string[];
}

export interface VocabularyStats {
  totalWords: number;
  wordsLearned: number;
  wordsReviewing: number;
  wordsMastered: number;
  averageMastery: number;
  streakDays: number;
  weeklyGoal: number;
  weeklyProgress: number;
}