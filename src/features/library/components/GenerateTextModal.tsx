import React, { useState } from 'react';
import { X, Wand2 } from 'lucide-react';
import { generateText } from '../../../services/openai';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';

interface GenerateTextModalProps {
  onClose: () => void;
  onGenerate: (title: string, content: string) => void;
}

const GenerateTextModal: React.FC<GenerateTextModalProps> = ({ onClose, onGenerate }) => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const prompt = `Generate an educational article about "${topic}". The article should be engaging, informative, and suitable for speed reading practice. Include a clear title for the article.`;
      
      const generatedText = await generateText(prompt);
      
      if (!generatedText) {
        throw new Error('Failed to generate text');
      }

      // Extract title and content
      const lines = generatedText.split('\n');
      const title = lines[0].replace(/^#\s*/, '');
      const content = lines.slice(2).join('\n');

      onGenerate(title, content);
    } catch (err) {
      setError('Failed to generate text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-700 p-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Generate Reading Text</h3>
          <button 
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            <Input
              label="Topic"
              placeholder="Enter a topic (e.g., Space Exploration, Climate Change)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              error={error}
            />
            
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Our AI will generate an educational article about your chosen topic, perfect for speed reading practice.
            </p>
          </div>
        </div>
        
        <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerate}
            isLoading={loading}
            leftIcon={<Wand2 size={18} />}
          >
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GenerateTextModal;