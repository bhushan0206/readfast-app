import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Filter } from 'lucide-react';
import { useVocabularyStore } from '../../../store/vocabularyStore';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';

const VocabularyBuilder: React.FC = () => {
  const {
    words,
    stats,
    loading,
    searchWords,
    getWordsByTag,
    getWordsForReview,
    updateStats
  } = useVocabularyStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filteredWords, setFilteredWords] = useState(words);

  useEffect(() => {
    updateStats();
  }, [updateStats]);

  useEffect(() => {
    let filtered = words;
    
    if (searchTerm) {
      filtered = searchWords(searchTerm);
    }
    
    if (filterTag !== 'all') {
      if (filterTag === 'needs-review') {
        filtered = getWordsForReview();
      } else if (filterTag === 'mastered') {
        filtered = words.filter(w => w.masteryLevel === 5);
      } else if (filterTag === 'learning') {
        filtered = words.filter(w => w.masteryLevel > 0 && w.masteryLevel < 5);
      } else {
        filtered = getWordsByTag(filterTag);
      }
    }
    
    setFilteredWords(filtered);
  }, [words, searchTerm, filterTag, searchWords, getWordsByTag, getWordsForReview]);

  // Get unique tags for filter options
  const allTags = Array.from(new Set(words.flatMap(w => w.tags))).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Vocabulary Builder
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Expand your vocabulary with smart learning and spaced repetition
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button
            leftIcon={<Plus size={18} />}
            onClick={() => setShowAddModal(true)}
          >
            Add Word
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Words</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.totalWords}</p>
        </div>
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Learning</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.wordsReviewing}</p>
        </div>
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Mastered</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.wordsMastered}</p>
        </div>
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Streak</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.streakDays} days</p>
        </div>
      </div>

      {/* Quick Review Section */}
      {getWordsForReview().length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            Words Ready for Review
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            You have {getWordsForReview().length} words ready for review
          </p>
          <Button>Start Review Session</Button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <Input
            placeholder="Search words, definitions, or tags..."
            leftIcon={<Search size={18} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter size={18} className="text-neutral-500 dark:text-neutral-400" />
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            title="Filter words by category or status"
          >
            <option value="all">All Words</option>
            <option value="needs-review">Needs Review</option>
            <option value="learning">Learning</option>
            <option value="mastered">Mastered</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>
                {tag.replace('root:', '').replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Word Cards Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredWords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWords.map((word) => (
            <div key={word.id} className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {word.word}
                </h3>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                  {word.partOfSpeech}
                </span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-3">
                {word.definition}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  Mastery: {word.masteryLevel}/5
                </span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div
                      key={star}
                      className={`w-3 h-3 rounded-full ${
                        star <= word.masteryLevel
                          ? 'bg-yellow-400'
                          : 'bg-neutral-300 dark:bg-neutral-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          {words.length === 0 ? (
            <>
              <BookOpen size={48} className="mx-auto text-neutral-400 dark:text-neutral-600 mb-4" />
              <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200">
                Start Building Your Vocabulary
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2 mb-6">
                Add your first word to begin learning with spaced repetition
              </p>
              <Button 
                leftIcon={<Plus size={18} />}
                onClick={() => setShowAddModal(true)}
              >
                Add Your First Word
              </Button>
            </>
          ) : (
            <>
              <Search size={48} className="mx-auto text-neutral-400 dark:text-neutral-600 mb-4" />
              <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200">
                No matching words found
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                Try adjusting your search or filters
              </p>
            </>
          )}
        </div>
      )}

      {/* Add Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Add New Word
            </h3>
            <div className="space-y-4">
              <Input placeholder="Enter word" />
              <Input placeholder="Context sentence (optional)" />
              <div className="flex space-x-2">
                <Button onClick={() => setShowAddModal(false)} variant="outline">
                  Cancel
                </Button>
                <Button onClick={() => setShowAddModal(false)}>
                  Add Word
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VocabularyBuilder;