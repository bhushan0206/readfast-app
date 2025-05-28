// Text Analysis Utilities for Reading Analytics

// Reading difficulty scoring using Flesch-Kincaid formula
export const calculateFleschKincaid = (text: string): number => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((total, word) => total + countSyllables(word), 0);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  return Math.max(0, Math.min(100, Math.round(score)));
};

// SMOG readability index
export const calculateSMOG = (text: string): number => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  if (sentences.length < 30) return calculateFleschKincaid(text) / 10; // Fallback for short texts
  
  const polysyllables = words.filter(word => countSyllables(word) >= 3).length;
  const smog = 1.0430 * Math.sqrt(polysyllables * (30 / sentences.length)) + 3.1291;
  
  return Math.round(smog);
};

// Count syllables in a word
const countSyllables = (word: string): number => {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
};

// Vocabulary level detection
export const analyzeVocabulary = (text: string) => {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const wordFreq = new Map<string, number>();
  
  // Count word frequency
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (cleanWord.length > 0) {
      wordFreq.set(cleanWord, (wordFreq.get(cleanWord) || 0) + 1);
    }
  });
  
  // Common words (top 1000 English words)
  const commonWords = new Set([
    'the', 'of', 'and', 'a', 'to', 'in', 'is', 'you', 'that', 'it', 'he', 'was', 'for', 'on', 'are', 'as', 'with',
    'his', 'they', 'i', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what',
    'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there', 'each', 'which', 'she', 'do', 'how', 'their', 'if'
    // ... truncated for brevity
  ]);
  
  const uniqueWords = Array.from(wordFreq.keys());
  const commonWordCount = uniqueWords.filter(word => commonWords.has(word)).length;
  const vocabularyLevel = Math.round((1 - commonWordCount / uniqueWords.length) * 100);
  
  return {
    totalWords: words.length,
    uniqueWords: uniqueWords.length,
    vocabularyLevel: Math.min(100, Math.max(0, vocabularyLevel)),
    mostFrequentWords: Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  };
};

// Topic extraction using TF-IDF
export const extractTopics = (text: string) => {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3);
  
  // Remove common stop words
  const stopWords = new Set([
    'this', 'that', 'with', 'have', 'will', 'you', 'they', 'are', 'for', 'any', 'can', 'had', 'her', 'was', 'one',
    'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who',
    'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'
  ]);
  
  const filteredWords = words.filter(word => !stopWords.has(word));
  const wordFreq = new Map<string, number>();
  
  filteredWords.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });
  
  // Calculate TF-IDF scores (simplified version)
  const totalWords = filteredWords.length;
  const topics = Array.from(wordFreq.entries())
    .map(([word, freq]) => ({
      word,
      score: (freq / totalWords) * Math.log(totalWords / freq),
      frequency: freq
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  
  return topics;
};

// Estimate reading time based on user's speed
export const estimateReadingTime = (wordCount: number, userWPM: number = 250): number => {
  return Math.ceil(wordCount / userWPM);
};

// Comprehensive text analysis
export interface TextAnalysis {
  fleschKincaid: number;
  smogIndex: number;
  vocabularyAnalysis: ReturnType<typeof analyzeVocabulary>;
  topics: ReturnType<typeof extractTopics>;
  estimatedTime: number;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  recommendations: string[];
}

export const analyzeText = (text: string, userWPM: number = 250): TextAnalysis => {
  const fleschKincaid = calculateFleschKincaid(text);
  const smogIndex = calculateSMOG(text);
  const vocabularyAnalysis = analyzeVocabulary(text);
  const topics = extractTopics(text);
  const estimatedTime = estimateReadingTime(vocabularyAnalysis.totalWords, userWPM);
  
  // Determine difficulty level
  let difficultyLevel: TextAnalysis['difficultyLevel'];
  const avgScore = (fleschKincaid + (smogIndex * 10)) / 2;
  
  if (avgScore >= 80) difficultyLevel = 'Beginner';
  else if (avgScore >= 60) difficultyLevel = 'Intermediate';
  else if (avgScore >= 40) difficultyLevel = 'Advanced';
  else difficultyLevel = 'Expert';
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (fleschKincaid < 30) {
    recommendations.push('This text is quite complex. Consider using speed reading techniques.');
  }
  if (vocabularyAnalysis.vocabularyLevel > 70) {
    recommendations.push('Rich vocabulary content - great for expanding your word knowledge.');
  }
  if (estimatedTime > 15) {
    recommendations.push('Long read - consider breaking into multiple sessions.');
  }
  if (topics.length > 0) {
    recommendations.push(`Key topics: ${topics.slice(0, 3).map(t => t.word).join(', ')}`);
  }
  
  return {
    fleschKincaid,
    smogIndex,
    vocabularyAnalysis,
    topics,
    estimatedTime,
    difficultyLevel,
    recommendations
  };
};