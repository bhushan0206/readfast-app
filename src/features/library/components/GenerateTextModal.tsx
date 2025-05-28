import React, { useState } from 'react';
import { X, Wand2, Sparkles, Book, Globe, Beaker, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateReadingText } from '../../../services/groq';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';

interface GenerateTextModalProps {
  onClose: () => void;
  onGenerate: (title: string, content: string) => void;
}

const GenerateTextModal: React.FC<GenerateTextModalProps> = ({ onClose, onGenerate }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [wordCount, setWordCount] = useState(300);
  const [isGenerating, setIsGenerating] = useState(false);

  const topicSuggestions = [
    { icon: <Beaker size={16} />, label: 'Science', value: 'science and technology' },
    { icon: <History size={16} />, label: 'History', value: 'historical events' },
    { icon: <Globe size={16} />, label: 'Geography', value: 'world geography' },
    { icon: <Book size={16} />, label: 'Literature', value: 'classic literature' },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const result = await generateReadingText(topic, difficulty, wordCount);
      onGenerate(result.title, result.content);
      onClose();
    } catch (error) {
      console.error('Error generating text:', error);
      // Fallback generation
      const fallbackContent = `This is a ${difficulty} difficulty text about ${topic}. Reading practice helps improve both speed and comprehension. Try to maintain focus while reading and identify key concepts throughout the text. Regular practice with varied content will help you develop better reading skills and increase your overall reading speed while maintaining good comprehension.`;
      onGenerate(`Reading Practice: ${topic}`, fallbackContent);
      onClose();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTopicSuggestion = (suggestedTopic: string) => {
    setTopic(suggestedTopic);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl w-full max-w-md mx-4 border border-neutral-200 dark:border-neutral-700"
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg">
              <Wand2 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">AI Text Generator</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Create custom reading practice</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400">
            <X size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Choose a topic or enter your own
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {topicSuggestions.map((suggestion) => (
                <Button
                  key={suggestion.value}
                  variant="outline"
                  size="sm"
                  leftIcon={suggestion.icon}
                  onClick={() => handleTopicSuggestion(suggestion.value)}
                  className="justify-start text-xs flex-wrap min-h-[2.5rem]"
                >
                  <span className="truncate">{suggestion.label}</span>
                </Button>
              ))}
            </div>
            <Input
              placeholder="Enter your topic (e.g., space exploration, cooking, music)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              leftIcon={<Sparkles size={18} />}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <Button
                  key={level}
                  variant={difficulty === level ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setDifficulty(level)}
                  className="capitalize"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Text Length: {wordCount} words
            </label>
            <input
              type="range"
              min="150"
              max="1000"
              step="50"
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
              aria-label={`Text length: ${wordCount} words`}
            />
            <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              <span>150 words</span>
              <span>~{Math.ceil(wordCount / 250)} min read</span>
              <span>1000 words</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 p-6 bg-neutral-50 dark:bg-neutral-700/50 rounded-b-xl">
          <Button variant="outline" onClick={onClose} className="flex-1 order-2 sm:order-1">
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={!topic.trim() || isGenerating}
            isLoading={isGenerating}
            className="flex-1 order-1 sm:order-2"
            leftIcon={<Wand2 size={18} />}
          >
            {isGenerating ? 'Generating...' : 'Generate Text'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default GenerateTextModal;