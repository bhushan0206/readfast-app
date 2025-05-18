import React, { useEffect, useState } from 'react';
import { BookOpen, Upload, Search, Plus } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { getTexts, saveCustomText } from '../../../services/supabase';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import TextCard from '../components/TextCard';
import AddCustomTextModal from '../components/AddCustomTextModal';

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
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(text => 
        text.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(text => text.category === selectedCategory);
    }
    
    setFilteredTexts(filtered);
  };

  const handleAddCustomText = async (title: string, content: string) => {
    if (!user) {
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Reading Library</h1>
          <p className="text-neutral-600 mt-1">Choose a text to practice with</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            leftIcon={<Plus size={18} />}
            onClick={() => setShowAddModal(true)}
          >
            Add Custom Text
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-error-50 border border-error-200 text-error-800 px-4 py-3 rounded-lg mb-6">
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
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === null ? "primary" : "outline"}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {getCategories().map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "primary" : "outline"}
              onClick={() => setSelectedCategory(category)}
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
        <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
          {texts.length === 0 ? (
            <>
              <BookOpen size={48} className="mx-auto text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-800">No texts available</h3>
              <p className="text-neutral-600 mt-2 mb-6">Add your first text to get started</p>
              <Button 
                leftIcon={<Plus size={18} />}
                onClick={() => setShowAddModal(true)}
              >
                Add Custom Text
              </Button>
            </>
          ) : (
            <>
              <Search size={48} className="mx-auto text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-800">No matching texts found</h3>
              <p className="text-neutral-600 mt-2">Try adjusting your search or filters</p>
            </>
          )}
        </div>
      )}
      
      {/* Custom Text Modal */}
      {showAddModal && (
        <AddCustomTextModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCustomText}
        />
      )}
    </div>
  );
};

export default Library;