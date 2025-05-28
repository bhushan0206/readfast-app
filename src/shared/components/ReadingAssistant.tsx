import React, { useState } from 'react';
import { Brain, Lightbulb, BookOpen, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateText, generatePersonalizedRecommendations } from '../../services/groq';
import Button from './Button';

interface ReadingAssistantProps {
  onRecommendation?: (topic: string) => void;
}

const ReadingAssistant: React.FC<ReadingAssistantProps> = ({ onRecommendation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tips' | 'recommendations' | 'goals'>('tips');
  const [tips, setTips] = useState<string>('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [userQuestion, setUserQuestion] = useState('');

  const handleGetTips = async () => {
    if (!userQuestion.trim()) return;
    
    setLoading(true);
    try {
      const prompt = `As a reading improvement expert, provide specific, actionable advice for this question: "${userQuestion}". 
      Give 3-4 practical tips that can be implemented immediately.`;
      
      const response = await generateText(prompt);
      setTips(response);
    } catch (error) {
      setTips('Try reading in short bursts, eliminate distractions, and practice daily to improve your reading skills.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    setLoading(true);
    try {
      const userLevel = 'intermediate'; // This could come from user profile
      const interests = ['technology', 'science', 'history']; // This could come from user profile
      const recentTopics = ['artificial intelligence', 'space exploration']; // This could come from reading history
      
      const recs = await generatePersonalizedRecommendations(userLevel, interests, recentTopics);
      setRecommendations(recs);
    } catch (error) {
      setRecommendations([
        'Future of Artificial Intelligence',
        'Ancient Civilizations and Their Impact',
        'Climate Change Solutions',
        'Modern Space Exploration',
        'Quantum Physics Basics',
        'Digital Privacy and Security'
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickTips = [
    'Read in word groups, not individual words',
    'Minimize subvocalization (inner voice)',
    'Use your finger or a pointer to guide your eyes',
    'Take breaks every 25-30 minutes',
    'Practice with progressively harder texts'
  ];

  const readingGoals = [
    { goal: 'Read 15 minutes daily', icon: <Target size={16} /> },
    { goal: 'Increase speed by 50 WPM', icon: <Zap size={16} /> },
    { goal: 'Complete 3 articles weekly', icon: <BookOpen size={16} /> },
    { goal: 'Improve comprehension score', icon: <Brain size={16} /> }
  ];

  if (!isOpen) {
    return (
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-full shadow-lg z-50 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Brain size={24} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 w-80 sm:w-96 max-h-[80vh] overflow-hidden z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">AI Reading Assistant</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-3 overflow-x-auto">
          {[
            { id: 'tips', label: 'Tips', icon: <Lightbulb size={16} /> },
            { id: 'recommendations', label: 'Topics', icon: <BookOpen size={16} /> },
            { id: 'goals', label: 'Goals', icon: <Target size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'tips' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Ask me anything about reading improvement:
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="How can I read faster?"
                  className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleGetTips()}
                />
                <Button
                  onClick={handleGetTips}
                  isLoading={loading}
                  size="sm"
                  disabled={!userQuestion.trim()}
                >
                  Ask
                </Button>
              </div>
            </div>

            {tips && (
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
                <h4 className="font-medium text-primary-800 dark:text-primary-300 mb-2">AI Advice:</h4>
                <p className="text-sm text-primary-700 dark:text-primary-200 whitespace-pre-wrap">{tips}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-neutral-800 dark:text-neutral-200 mb-2">Quick Tips:</h4>
              <ul className="space-y-2">
                {quickTips.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-neutral-800 dark:text-neutral-200">Personalized Topics</h4>
              <Button
                onClick={handleGetRecommendations}
                isLoading={loading}
                size="sm"
                variant="outline"
              >
                Refresh
              </Button>
            </div>

            <div className="space-y-2">
              {recommendations.length > 0 ? (
                recommendations.map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => onRecommendation?.(topic)}
                    className="w-full text-left p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{topic}</span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">
                  Click refresh to get personalized recommendations
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-4">
            <h4 className="font-medium text-neutral-800 dark:text-neutral-200">Reading Goals</h4>
            <div className="space-y-3">
              {readingGoals.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <div className="text-primary-500">{item.icon}</div>
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{item.goal}</span>
                  <div className="ml-auto">
                    <input 
                      type="checkbox" 
                      className="rounded border-neutral-300 dark:border-neutral-600"
                      aria-label={`Mark ${item.goal} as complete`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button variant="primary" size="sm" className="w-full">
              Set Custom Goal
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ReadingAssistant;