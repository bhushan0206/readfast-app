import React, { useEffect, useState } from 'react';
import { BookOpen, Search, Plus, Wand2 } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
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
  const { user } = useAuthStore();
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
    <div>
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/30 to-secondary-100/30 dark:from-primary-900/30 dark:to-secondary-900/30 animate-gradient" />
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/5834/nature-grass-leaf-green.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center opacity-5 dark:opacity-10" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Reading Library</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Choose a text to practice with</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button 
            leftIcon={<Wand2 size={18} />}
            onClick={() => setShowGenerateModal(true)}
            variant="secondary"
          >
            AI Generate
          </Button>
          <Button 
            leftIcon={<Plus size={18} />}
            onClick={() => setShowAddModal(true)}
          >
            Add Custom Text
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-error-50 dark:bg-error-900/50 border border-error-200 dark:border-error-800 text-error-800 dark:text-error-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-grow">
          <Input
            placeholder="Search texts..."
            leftIcon={<Search size={18} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? "primary" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className={selectedCategory === null ? "text-white dark:text-white" : "text-neutral-700 dark:text-neutral-200"}
          >
            All
          </Button>
          {getCategories().map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "primary" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "text-white dark:text-white" : "text-neutral-700 dark:text-neutral-200"}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Text Cards */}
      {filteredTexts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTexts.map((text) => (
            <TextCard key={text.id} text={text} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          {texts.length === 0 ? (
            <>
              <BookOpen size={48} className="mx-auto text-neutral-400 dark:text-neutral-600 mb-4" />
              <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200">No texts available</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2 mb-6">Add your first text to get started</p>
              <Button 
                leftIcon={<Plus size={18} />}
                onClick={() => setShowAddModal(true)}
              >
                Add Custom Text
              </Button>
            </>
          ) : (
            <>
              <Search size={48} className="mx-auto text-neutral-400 dark:text-neutral-600 mb-4" />
              <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200">No matching texts found</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">Try adjusting your search or filters</p>
            </>
          )}
        </div>
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
      <ReadingAssistant 
        onRecommendation={() => {
          setShowGenerateModal(true);
        }}
      />
    </div>
  );
};

export default Library;