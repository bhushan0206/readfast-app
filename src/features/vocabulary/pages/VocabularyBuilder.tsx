import React, { useState, useMemo } from 'react';
import { Plus, BookOpen, Brain, Search, Filter, Star, Clock, TrendingUp, Target, X, Save, Shuffle, RotateCcw, CheckCircle } from 'lucide-react';

interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  partOfSpeech: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'new' | 'learning' | 'mastered';
  category: string;
  dateAdded: string;
  lastReviewed?: string;
  reviewCount: number;
  starred: boolean;
}

const VocabularyBuilder: React.FC = () => {
  const [words, setWords] = useState<VocabularyWord[]>([
    {
      id: '1',
      word: 'Serendipity',
      definition: 'The occurrence and development of events by chance in a happy or beneficial way',
      partOfSpeech: 'noun',
      difficulty: 'intermediate',
      status: 'learning',
      category: 'Literature',
      dateAdded: '2 days ago',
      lastReviewed: '1 day ago',
      reviewCount: 3,
      starred: true
    },
    {
      id: '2',
      word: 'Ubiquitous',
      definition: 'Present, appearing, or found everywhere',
      partOfSpeech: 'adjective',
      difficulty: 'advanced',
      status: 'mastered',
      category: 'Academic',
      dateAdded: '1 week ago',
      lastReviewed: '3 days ago',
      reviewCount: 8,
      starred: false
    },
    {
      id: '3',
      word: 'Paradigm',
      definition: 'A typical example or pattern of something; a model',
      partOfSpeech: 'noun',
      difficulty: 'advanced',
      status: 'new',
      category: 'Academic',
      dateAdded: '1 day ago',
      reviewCount: 0,
      starred: false
    },
    {
      id: '4',
      word: 'Ephemeral',
      definition: 'Lasting for a very short time',
      partOfSpeech: 'adjective',
      difficulty: 'intermediate',
      status: 'learning',
      category: 'Literature',
      dateAdded: '3 days ago',
      lastReviewed: '2 days ago',
      reviewCount: 2,
      starred: true
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [currentPracticeWord, setCurrentPracticeWord] = useState<VocabularyWord | null>(null);
  const [practiceMode, setPracticeMode] = useState<'definition' | 'word'>('definition');
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [practiceWords, setPracticeWords] = useState<VocabularyWord[]>([]);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);

  const [newWord, setNewWord] = useState({
    word: '',
    definition: '',
    partOfSpeech: 'noun',
    difficulty: 'intermediate' as const,
    category: 'Academic'
  });

  // Calculate stats
  const stats = useMemo(() => {
    const total = words.length;
    const mastered = words.filter(w => w.status === 'mastered').length;
    const learning = words.filter(w => w.status === 'learning').length;
    const newWords = words.filter(w => w.status === 'new').length;
    const thisWeek = words.filter(w => w.dateAdded.includes('day') || w.dateAdded.includes('hour')).length;
    
    return {
      total,
      mastered,
      learning,
      newWords,
      thisWeek,
      masteryRate: total > 0 ? Math.round((mastered / total) * 100) : 0,
      streak: 12 // This would come from actual usage data
    };
  }, [words]);

  // Filter words based on search and category
  const filteredWords = useMemo(() => {
    return words.filter(word => {
      const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           word.definition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All Categories' || word.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [words, searchTerm, selectedCategory]);

  // Get words due for review
  const wordsForReview = useMemo(() => {
    return words.filter(w => w.status === 'learning' || w.status === 'new');
  }, [words]);

  const handleAddWord = () => {
    if (!newWord.word.trim() || !newWord.definition.trim()) return;

    const word: VocabularyWord = {
      id: Date.now().toString(),
      word: newWord.word,
      definition: newWord.definition,
      partOfSpeech: newWord.partOfSpeech,
      difficulty: newWord.difficulty,
      status: 'new',
      category: newWord.category,
      dateAdded: 'Just now',
      reviewCount: 0,
      starred: false
    };

    setWords(prev => [word, ...prev]);
    setNewWord({
      word: '',
      definition: '',
      partOfSpeech: 'noun',
      difficulty: 'intermediate',
      category: 'Academic'
    });
    setShowAddModal(false);
  };

  const toggleStar = (id: string) => {
    setWords(prev => prev.map(word => 
      word.id === id ? { ...word, starred: !word.starred } : word
    ));
  };

  const updateWordStatus = (id: string, status: VocabularyWord['status']) => {
    setWords(prev => prev.map(word => 
      word.id === id ? { 
        ...word, 
        status, 
        reviewCount: word.reviewCount + 1,
        lastReviewed: 'Just now'
      } : word
    ));
  };

  const startPractice = () => {
    const wordsToReview = [...wordsForReview].sort(() => Math.random() - 0.5);
    setPracticeWords(wordsToReview);
    setCurrentPracticeIndex(0);
    if (wordsToReview.length > 0) {
      setCurrentPracticeWord(wordsToReview[0]);
      setPracticeMode(Math.random() > 0.5 ? 'definition' : 'word');
      setShowPracticeModal(true);
      setUserAnswer('');
      setShowAnswer(false);
    }
  };

  const nextPracticeWord = () => {
    if (currentPracticeIndex < practiceWords.length - 1) {
      const nextIndex = currentPracticeIndex + 1;
      setCurrentPracticeIndex(nextIndex);
      setCurrentPracticeWord(practiceWords[nextIndex]);
      setPracticeMode(Math.random() > 0.5 ? 'definition' : 'word');
      setUserAnswer('');
      setShowAnswer(false);
    } else {
      setShowPracticeModal(false);
      setCurrentPracticeWord(null);
    }
  };

  const markAsKnown = () => {
    if (currentPracticeWord) {
      updateWordStatus(currentPracticeWord.id, 'mastered');
      nextPracticeWord();
    }
  };

  const markAsLearning = () => {
    if (currentPracticeWord) {
      updateWordStatus(currentPracticeWord.id, 'learning');
      nextPracticeWord();
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Vocabulary Builder</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Expand your vocabulary with smart learning techniques
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Word</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Words</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">+{stats.thisWeek} this week</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Mastered</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.mastered}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">{stats.masteryRate}% mastery rate</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Learning</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.learning}</p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">In progress</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full">
              <Brain className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Streak</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.streak}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Days active</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search vocabulary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              title="Filter by category"
              className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
            >
              <option>All Categories</option>
              <option>Academic</option>
              <option>Business</option>
              <option>Literature</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <Brain className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Practice Session</h3>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Review your vocabulary with spaced repetition ({wordsForReview.length} words ready)
          </p>
          <button 
            onClick={startPractice}
            disabled={wordsForReview.length === 0}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Practice
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-lg border border-green-200 dark:border-green-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-500 text-white rounded-lg">
              <Plus className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Add from Text</h3>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Import vocabulary from your reading sessions
          </p>
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Import Words
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-500 text-white rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Review Due</h3>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            {wordsForReview.length} words are ready for review
          </p>
          <button 
            onClick={startPractice}
            disabled={wordsForReview.length === 0}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Review Now
          </button>
        </div>
      </div>

      {/* Vocabulary List */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Your Vocabulary ({filteredWords.length} words)
          </h3>
        </div>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {filteredWords.map((word) => (
            <div key={word.id} className="p-6 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">{word.word}</h4>
                    <span className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded">
                      {word.partOfSpeech}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      word.status === 'mastered' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                      word.status === 'learning' ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300' :
                      'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    }`}>
                      {word.status}
                    </span>
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 mb-2">{word.definition}</p>
                  <div className="flex items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
                    <span>Difficulty: {word.difficulty}</span>
                    <span>Category: {word.category}</span>
                    <span>Added {word.dateAdded}</span>
                    <span>Reviews: {word.reviewCount}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button 
                    onClick={() => toggleStar(word.id)}
                    title={word.starred ? 'Remove from favorites' : 'Add to favorites'}
                    className={`p-2 transition-colors ${
                      word.starred ? 'text-yellow-500 hover:text-yellow-600' : 'text-neutral-400 hover:text-yellow-500'
                    }`}
                  >
                    <Star className="h-4 w-4" fill={word.starred ? 'currentColor' : 'none'} />
                  </button>
                  <select 
                    value={word.status}
                    onChange={(e) => updateWordStatus(word.id, e.target.value as VocabularyWord['status'])}
                    title={`Change status for ${word.word}`}
                    className="px-3 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  >
                    <option value="new">New</option>
                    <option value="learning">Learning</option>
                    <option value="mastered">Mastered</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          {filteredWords.length === 0 && (
            <div className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No words found</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {searchTerm ? 'Try adjusting your search terms.' : 'Start building your vocabulary by adding new words.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Add New Word</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                title="Close modal"
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Word
                </label>
                <input
                  type="text"
                  value={newWord.word}
                  onChange={(e) => setNewWord(prev => ({ ...prev, word: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter the word"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Definition
                </label>
                <textarea
                  value={newWord.definition}
                  onChange={(e) => setNewWord(prev => ({ ...prev, definition: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter the definition"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Part of Speech
                  </label>
                  <select
                    value={newWord.partOfSpeech}
                    onChange={(e) => setNewWord(prev => ({ ...prev, partOfSpeech: e.target.value }))}
                    title="Select part of speech"
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  >
                    <option value="noun">Noun</option>
                    <option value="verb">Verb</option>
                    <option value="adjective">Adjective</option>
                    <option value="adverb">Adverb</option>
                    <option value="preposition">Preposition</option>
                    <option value="conjunction">Conjunction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={newWord.difficulty}
                    onChange={(e) => setNewWord(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    title="Select difficulty level"
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Category
                </label>
                <select
                  value={newWord.category}
                  onChange={(e) => setNewWord(prev => ({ ...prev, category: e.target.value }))}
                  title="Select word category"
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                >
                  <option value="Academic">Academic</option>
                  <option value="Business">Business</option>
                  <option value="Literature">Literature</option>
                  <option value="Science">Science</option>
                  <option value="Technology">Technology</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddWord}
                disabled={!newWord.word.trim() || !newWord.definition.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Add Word</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Practice Modal */}
      {showPracticeModal && currentPracticeWord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Practice Session ({currentPracticeIndex + 1}/{practiceWords.length})
              </h3>
              <button 
                onClick={() => setShowPracticeModal(false)}
                title="Close practice session"
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="text-center">
                {practiceMode === 'definition' ? (
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">What word has this definition?</p>
                    <p className="text-lg text-neutral-900 dark:text-white mb-4">"{currentPracticeWord.definition}"</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">What is the definition of:</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">{currentPracticeWord.word}</p>
                  </div>
                )}
                
                {!showAnswer && (
                  <div className="space-y-4">
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your answer..."
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                      rows={3}
                    />
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Show Answer
                    </button>
                  </div>
                )}
                
                {showAnswer && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Correct answer:</p>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {practiceMode === 'definition' ? currentPracticeWord.word : currentPracticeWord.definition}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={markAsKnown}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>I knew it</span>
                      </button>
                      <button
                        onClick={markAsLearning}
                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center space-x-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Review again</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VocabularyBuilder;