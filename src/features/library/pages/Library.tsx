import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Plus, Wand2 } from 'lucide-react';
import { useAuth } from '../../auth/providers/AuthProvider';
import { getTexts, saveCustomText } from '../../../services/supabase';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import TextCard from '../components/TextCard';
import AddCustomTextModal from '../components/AddCustomTextModal';
import GenerateTextModal from '../components/GenerateTextModal';
import ReadingAssistant from '../../../shared/components/ReadingAssistant';

interface Text {
  id: string;
  title: string;
  content: string;
  category: string | null;
  difficulty: number;
  is_custom: boolean;
  created_at: string;
}

const Library: React.FC = () => {
  const { user } = useAuth();
  const [texts, setTexts] = useState<Text[]>([]);
  const [filteredTexts, setFilteredTexts] = useState<Text[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTexts();
  }, []);

  useEffect(() => {
    filterTexts();
  }, [texts, searchTerm, selectedCategory]);

  const fetchTexts = async () => {
    try {
      setLoading(true);
      const textsData = await getTexts();
      setTexts(textsData || []);
    } catch (err) {
      console.error('Error fetching texts:', err);
      setError('Failed to load texts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterTexts = () => {
    let filtered = [...texts];
    
    if (searchTerm) {
      filtered = filtered.filter(text => 
        text.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(text => text.category === selectedCategory);
    }
    
    setFilteredTexts(filtered);
  };

  const handleAddCustomText = async (title: string, content: string) => {
    if (!user?.id) {
      setError('You must be logged in to add custom texts');
      return;
    }
    
    try {
      await saveCustomText(user.id, title, content);
      setShowAddModal(false);
      fetchTexts();
    } catch (err) {
      console.error('Error saving custom text:', err);
      setError('Failed to save custom text. Please try again.');
    }
  };

  const handleGenerateText = async (title: string, content: string) => {
    if (!user?.id) {
      setError('You must be logged in to generate texts');
      return;
    }
    
    try {
      await saveCustomText(user.id, title, content);
      setShowGenerateModal(false);
      fetchTexts();
    } catch (err) {
      console.error('Error saving generated text:', err);
      setError('Failed to save generated text. Please try again.');
    }
  };

  const getCategories = () => {
    const categories = new Set<string>();
    texts.forEach(text => {
      if (text.category) {
        categories.add(text.category);
      }
    });
    return Array.from(categories);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-neutral-900 dark:via-emerald-900/10 dark:to-purple-900/10 relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-200/30 to-blue-200/30 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-200/30 to-pink-200/30 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full blur-3xl"
        />
        
        {/* Book-themed floating elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.7,
            }}
            className="absolute w-1 h-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"
            style={{
              left: `${15 + (i * 12)}%`,
              top: `${20 + (i * 8)}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Reading Library
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300 mt-2 text-lg">Choose a text to practice your speed reading skills</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                leftIcon={<Wand2 size={18} />}
                onClick={() => setShowGenerateModal(true)}
                variant="secondary"
                className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border-white/20 dark:border-neutral-700/50 hover:bg-white/80 dark:hover:bg-neutral-800/80"
              >
                AI Generate
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                leftIcon={<Plus size={18} />}
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg"
              >
                Add Custom Text
              </Button>
            </motion.div>
          </div>
        </motion.div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm"
          >
            {error}
          </motion.div>
        )}
        
        {/* Search and Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-neutral-700/50 shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <Input
                placeholder="Search texts..."
                leftIcon={<Search size={18} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-white/30 dark:border-neutral-700/30"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "primary" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className={`transition-all duration-200 ${selectedCategory === null 
                  ? "bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-lg" 
                  : "bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border-white/20 dark:border-neutral-700/50 hover:bg-white/80 dark:hover:bg-neutral-800/80"
                }`}
              >
                All
              </Button>
              {getCategories().map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "primary" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={`transition-all duration-200 ${selectedCategory === category 
                    ? "bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-lg" 
                    : "bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border-white/20 dark:border-neutral-700/50 hover:bg-white/80 dark:hover:bg-neutral-800/80"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Text Cards */}
        {filteredTexts.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTexts.map((text, index) => (
              <motion.div
                key={text.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="transform transition-all duration-300"
              >
                <TextCard text={text} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center py-16 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-neutral-700/50 shadow-lg"
          >
            {texts.length === 0 ? (
              <>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <BookOpen size={64} className="mx-auto text-neutral-400 dark:text-neutral-500 mb-6" />
                </motion.div>
                <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 mb-3">No texts available</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8 text-lg">Add your first text to get started with speed reading</p>
                <Button 
                  leftIcon={<Plus size={18} />}
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg"
                >
                  Add Custom Text
                </Button>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Search size={64} className="mx-auto text-neutral-400 dark:text-neutral-500 mb-6" />
                </motion.div>
                <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 mb-3">No matching texts found</h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-lg">Try adjusting your search or filters</p>
              </>
            )}
          </motion.div>
        )}
        
        {/* Modals */}
        {showAddModal && (
          <AddCustomTextModal
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddCustomText}
          />
        )}
        
        {showGenerateModal && (
          <GenerateTextModal
            onClose={() => setShowGenerateModal(false)}
            onGenerate={handleGenerateText}
          />
        )}
        
        {/* Reading Assistant */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-neutral-700/50 shadow-lg overflow-hidden"
        >
          <ReadingAssistant 
            onRecommendation={() => {
              setShowGenerateModal(true);
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Library;