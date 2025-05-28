import { VocabularyWord, WordRoot } from '../types/vocabulary';

// Common word roots and their meanings
const WORD_ROOTS: WordRoot[] = [
  { root: 'bio', meaning: 'life', origin: 'Greek', examples: ['biology', 'biography', 'antibiotic'] },
  { root: 'geo', meaning: 'earth', origin: 'Greek', examples: ['geography', 'geology', 'geometry'] },
  { root: 'tele', meaning: 'far, distant', origin: 'Greek', examples: ['telephone', 'television', 'telescope'] },
  { root: 'auto', meaning: 'self', origin: 'Greek', examples: ['automobile', 'automatic', 'autobiography'] },
  { root: 'micro', meaning: 'small', origin: 'Greek', examples: ['microscope', 'microphone', 'microwave'] },
  { root: 'photo', meaning: 'light', origin: 'Greek', examples: ['photograph', 'photosynthesis', 'photogenic'] },
  { root: 'phono', meaning: 'sound', origin: 'Greek', examples: ['phonograph', 'telephone', 'symphony'] },
  { root: 'graph', meaning: 'writing', origin: 'Greek', examples: ['paragraph', 'autograph', 'telegraph'] },
  { root: 'scope', meaning: 'to see', origin: 'Greek', examples: ['telescope', 'microscope', 'stethoscope'] },
  { root: 'meter', meaning: 'measure', origin: 'Greek', examples: ['thermometer', 'speedometer', 'diameter'] }
];

// Difficulty level word lists (simplified for demo)
const DIFFICULTY_WORDS = {
  beginner: ['cat', 'dog', 'house', 'car', 'book', 'water', 'food', 'happy', 'big', 'small'],
  intermediate: ['magnificent', 'elaborate', 'substantial', 'consequently', 'furthermore', 'establish', 'demonstrate', 'significant'],
  advanced: ['ubiquitous', 'perfunctory', 'surreptitious', 'perspicacious', 'recalcitrant', 'obstreperous', 'truculent'],
  expert: ['sesquipedalian', 'grandiloquent', 'perspicacious', 'magnanimous', 'pusillanimous', 'obsequious']
};

export const analyzeVocabularyDifficulty = (text: string, userLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'intermediate'): string[] => {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const unknownWords: string[] = [];
  
  const knownWords = new Set([
    ...DIFFICULTY_WORDS.beginner,
    ...(userLevel !== 'beginner' ? DIFFICULTY_WORDS.intermediate : []),
    ...(userLevel === 'advanced' || userLevel === 'expert' ? DIFFICULTY_WORDS.advanced : []),
    ...(userLevel === 'expert' ? DIFFICULTY_WORDS.expert : [])
  ]);

  words.forEach(word => {
    if (word.length > 3 && !knownWords.has(word)) {
      if (!unknownWords.includes(word)) {
        unknownWords.push(word);
      }
    }
  });

  return unknownWords.slice(0, 10); // Limit to 10 words
};

export const generateWordDefinition = async (word: string, context: string): Promise<VocabularyWord> => {
  // Simulate API call to dictionary service
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock data generation (in real app, would call dictionary API)
  const mockDefinitions = {
    magnificent: {
      definition: 'Extremely beautiful, elaborate, or impressive',
      partOfSpeech: 'adjective',
      pronunciation: '/mæɡˈnɪfɪsənt/',
      etymology: 'From Latin magnificus, from magnus (great) + facere (to make)',
      examples: [
        'The cathedral has a magnificent Gothic architecture.',
        'She gave a magnificent performance at the concert.',
        'The view from the mountain top was absolutely magnificent.'
      ],
      synonyms: ['splendid', 'superb', 'glorious', 'spectacular'],
      antonyms: ['ordinary', 'modest', 'plain', 'simple']
    },
    elaborate: {
      definition: 'Involving many carefully arranged parts or details; detailed and complicated in design',
      partOfSpeech: 'adjective',
      pronunciation: '/ɪˈlæbərət/',
      etymology: 'From Latin elaboratus, past participle of elaborare (to work out)',
      examples: [
        'The wedding had an elaborate ceremony.',
        'She created an elaborate plan for the project.',
        'The cake had elaborate decorations.'
      ],
      synonyms: ['complex', 'intricate', 'detailed', 'ornate'],
      antonyms: ['simple', 'plain', 'basic', 'minimal']
    }
  };

  const wordData = mockDefinitions[word as keyof typeof mockDefinitions] || {
    definition: `A ${Math.random() > 0.5 ? 'noun' : 'adjective'} with specific meaning in context`,
    partOfSpeech: Math.random() > 0.5 ? 'noun' : 'adjective',
    pronunciation: `/${word}/`,
    etymology: `From ${Math.random() > 0.5 ? 'Latin' : 'Greek'} origin`,
    examples: [
      `The ${word} was notable in the sentence.`,
      `Understanding ${word} helps with comprehension.`,
      `${word.charAt(0).toUpperCase() + word.slice(1)} appears in academic texts.`
    ],
    synonyms: ['related', 'similar', 'comparable'],
    antonyms: ['different', 'opposite', 'contrasting']
  };

  const difficulty = getDifficultyLevel(word);
  
  return {
    id: generateId(),
    word,
    contextSentence: context,
    dateAdded: new Date().toISOString(),
    reviewCount: 0,
    masteryLevel: 0,
    nextReview: getNextReviewDate(0),
    tags: extractTags(word, wordData.definition),
    difficulty,
    ...wordData
  };
};

export const findWordRoots = (word: string): WordRoot[] => {
  return WORD_ROOTS.filter(root => 
    word.toLowerCase().includes(root.root) ||
    root.examples.some(example => example.includes(word.toLowerCase()))
  );
};

export const calculateSpacedRepetition = (masteryLevel: number, lastReviewed: string): string => {
  const intervals = [1, 3, 7, 14, 30, 90]; // days
  const intervalDays = intervals[Math.min(masteryLevel, intervals.length - 1)];
  
  const nextReview = new Date(lastReviewed);
  nextReview.setDate(nextReview.getDate() + intervalDays);
  
  return nextReview.toISOString();
};

export const getWordsForReview = (words: VocabularyWord[]): VocabularyWord[] => {
  const today = new Date().toISOString().split('T')[0];
  
  return words.filter(word => 
    word.nextReview.split('T')[0] <= today && 
    word.masteryLevel < 5
  ).sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());
};

export const generateVocabularyQuiz = (words: VocabularyWord[], count: number = 5) => {
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  const quizWords = shuffled.slice(0, count);
  
  return quizWords.map(word => ({
    word: word.word,
    question: `What does "${word.word}" mean?`,
    correctAnswer: word.definition,
    options: [
      word.definition,
      ...getRandomDefinitions(words.filter(w => w.id !== word.id), 3)
    ].sort(() => Math.random() - 0.5),
    context: word.contextSentence
  }));
};

// Helper functions
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const getDifficultyLevel = (word: string): 'beginner' | 'intermediate' | 'advanced' | 'expert' => {
  if (DIFFICULTY_WORDS.expert.includes(word)) return 'expert';
  if (DIFFICULTY_WORDS.advanced.includes(word)) return 'advanced';
  if (DIFFICULTY_WORDS.intermediate.includes(word)) return 'intermediate';
  return 'beginner';
};

const getNextReviewDate = (masteryLevel: number): string => {
  const intervals = [1, 3, 7, 14, 30, 90];
  const days = intervals[Math.min(masteryLevel, intervals.length - 1)];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString();
};

const extractTags = (word: string, definition: string): string[] => {
  const tags: string[] = [];
  
  // Add difficulty-based tags
  if (word.length > 10) tags.push('long-word');
  if (definition.includes('technical')) tags.push('technical');
  if (definition.includes('academic')) tags.push('academic');
  
  // Add root-based tags
  const roots = findWordRoots(word);
  roots.forEach(root => tags.push(`root:${root.root}`));
  
  return tags;
};

const getRandomDefinitions = (words: VocabularyWord[], count: number): string[] => {
  const shuffled = words.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(w => w.definition);
};