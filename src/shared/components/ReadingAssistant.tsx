import React, { useState, useEffect } from 'react';
import { Brain, Lightbulb, BookOpen, Target, Zap, Plus, Check, X, Calendar, TrendingUp, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateText, generatePersonalizedRecommendations } from '../../services/groq';
import { useAuthStore } from '../../stores/authStore';
import Button from './Button';

interface ReadingGoal {
  id: string;
  title: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  deadline?: string;
  completed: boolean;
  createdAt: string;
  userId: string;
}

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
  const [goals, setGoals] = useState<ReadingGoal[]>([]);
  const [newGoal, setNewGoal] = useState<Partial<ReadingGoal>>({});
  const [editingGoal, setEditingGoal] = useState<ReadingGoal | null>(null);

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

  const { user, isAuthenticated } = useAuthStore();

  // Enhanced user detection - check multiple sources
  const getEffectiveUser = () => {
    console.log('🔍 Getting effective user...');
    
    // 1. Try from auth store
    if (user?.id) {
      console.log('✅ User found in auth store:', user);
      return user;
    }
    
    // 2. Try from localStorage session
    try {
      const storedSession = localStorage.getItem('sb-session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        if (session?.user?.id) {
          console.log('✅ User found in localStorage session:', session.user);
          return session.user;
        }
      }
    } catch (error) {
      console.log('❌ Error parsing localStorage session:', error);
    }
    
    // 3. Try from Supabase directly
    try {
      const { supabase } = require('../../services/auth');
      supabase.auth.getUser().then(({ data: { user: directUser } }) => {
        if (directUser?.id) {
          console.log('✅ User found via direct Supabase call:', directUser);
          return directUser;
        }
      });
    } catch (error) {
      console.log('❌ Error getting user from Supabase:', error);
    }
    
    console.log('❌ No user found, using anonymous fallback');
    return null;
  };

  // Debug the auth store state
  useEffect(() => {
    console.log('🔍 Auth Debug Info:');
    console.log('User from store:', user);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('Full auth store state:', useAuthStore.getState());
    
    const effectiveUser = getEffectiveUser();
    console.log('Effective user:', effectiveUser);
    
    // Try to get user from localStorage as fallback
    const storedSession = localStorage.getItem('sb-session');
    console.log('Stored session:', storedSession);
  }, [user, isAuthenticated]);

  useEffect(() => {
    const fetchGoals = async () => {
      // Use both user ID and fallback ID for goals storage
      const userId = user?.id || 'anonymous_user';
      console.log('📁 Fetching goals for user:', userId);
      
      try {
        const storedGoals = localStorage.getItem(`readingGoals_${userId}`);
        if (storedGoals) {
          const parsedGoals = JSON.parse(storedGoals);
          console.log('📊 Loaded goals:', parsedGoals);
          setGoals(parsedGoals);
        } else {
          console.log('📂 No stored goals found');
        }
      } catch (error) {
        console.error('Error fetching goals:', error);
      }
    };

    if (isOpen) {
      fetchGoals();
    }
  }, [isOpen, user]);

  const saveGoalsToStorage = (updatedGoals: ReadingGoal[]) => {
    // Use fallback for anonymous users or when user is not available
    const userId = user?.id || 'anonymous_user';
    console.log('💾 Saving goals for user:', userId);
    localStorage.setItem(`readingGoals_${userId}`, JSON.stringify(updatedGoals));
  };

  const handleAddGoal = async () => {
    console.log('🎯 handleAddGoal called');
    console.log('Current newGoal:', newGoal);
    console.log('User from store:', user);
    
    if (!newGoal.title?.trim()) {
      console.log('❌ No title provided');
      alert('❌ Please enter a goal title first');
      return;
    }
    
    // Get effective user ID (try multiple sources)
    let effectiveUserId = user?.id;
    
    if (!effectiveUserId) {
      console.log('🔄 User not found in store, trying alternative methods...');
      
      // Try localStorage session
      try {
        const storedSession = localStorage.getItem('sb-session');
        if (storedSession) {
          const session = JSON.parse(storedSession);
          effectiveUserId = session?.user?.id;
          console.log('📱 Found user in localStorage:', effectiveUserId);
        }
      } catch (error) {
        console.log('❌ Error reading localStorage session:', error);
      }
      
      // Try direct Supabase call
      if (!effectiveUserId) {
        try {
          const { supabase } = await import('../../services/auth');
          const { data: { user: directUser } } = await supabase.auth.getUser();
          effectiveUserId = directUser?.id;
          console.log('🔗 Found user via direct Supabase call:', effectiveUserId);
        } catch (error) {
          console.log('❌ Error getting user from Supabase directly:', error);
        }
      }
      
      // Use anonymous fallback as last resort
      if (!effectiveUserId) {
        effectiveUserId = 'anonymous_user';
        console.log('🔄 Using anonymous fallback user ID');
      }
    }
    
    console.log('Using effective user ID:', effectiveUserId);

    setLoading(true);
    try {
      const goalData: ReadingGoal = {
        id: crypto.randomUUID(),
        title: newGoal.title.trim(),
        description: newGoal.description?.trim() || '',
        targetValue: newGoal.targetValue || 0,
        currentValue: 0,
        unit: newGoal.unit || '',
        deadline: newGoal.deadline || '',
        completed: false,
        createdAt: new Date().toISOString(),
        userId: effectiveUserId,
      };

      console.log('📝 Creating goal:', goalData);

      const updatedGoals = [...goals, goalData];
      setGoals(updatedGoals);
      saveGoalsToStorage(updatedGoals);
      setNewGoal({});
      
      console.log('✅ Goal added successfully:', goalData);
      console.log('📊 Updated goals list:', updatedGoals);
      
      // Show success feedback
      alert('✅ Goal added successfully!');
    } catch (error) {
      console.error('❌ Error adding goal:', error);
      alert('❌ Error adding goal: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGoal = (goal: ReadingGoal) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      description: goal.description,
      targetValue: goal.targetValue,
      unit: goal.unit,
      deadline: goal.deadline,
    });
  };

  const handleSaveGoal = async () => {
    if (!editingGoal || !newGoal.title?.trim()) return;

    setLoading(true);
    try {
      const updatedGoal: ReadingGoal = {
        ...editingGoal,
        title: newGoal.title.trim(),
        description: newGoal.description?.trim() || '',
        targetValue: newGoal.targetValue || 0,
        unit: newGoal.unit || '',
        deadline: newGoal.deadline || '',
      };

      const updatedGoals = goals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g));
      setGoals(updatedGoals);
      saveGoalsToStorage(updatedGoals);
      setEditingGoal(null);
      setNewGoal({});
      
      console.log('✅ Goal updated successfully:', updatedGoal);
    } catch (error) {
      console.error('❌ Error updating goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    setLoading(true);
    try {
      const updatedGoals = goals.filter((goal) => goal.id !== goalId);
      setGoals(updatedGoals);
      saveGoalsToStorage(updatedGoals);
      
      console.log('✅ Goal deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGoalCompletion = async (goalId: string) => {
    setLoading(true);
    try {
      const updatedGoals = goals.map((goal) =>
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
      );
      setGoals(updatedGoals);
      saveGoalsToStorage(updatedGoals);
      
      console.log('✅ Goal completion toggled');
    } catch (error) {
      console.error('❌ Error toggling goal completion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGoalProgress = async (goalId: string, progress: number) => {
    try {
      const updatedGoals = goals.map((goal) =>
        goal.id === goalId 
          ? { 
              ...goal, 
              currentValue: progress,
              completed: goal.targetValue ? progress >= goal.targetValue : goal.completed
            } 
          : goal
      );
      setGoals(updatedGoals);
      saveGoalsToStorage(updatedGoals);
      
      console.log('✅ Goal progress updated');
    } catch (error) {
      console.error('❌ Error updating goal progress:', error);
    }
  };

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
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-neutral-800 dark:text-neutral-200">Reading Goals</h4>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {goals.filter(g => g.completed).length}/{goals.length} completed
              </div>
            </div>

            {/* Active Goals */}
            <div className="space-y-3">
              {goals.length === 0 ? (
                <div className="text-center py-6">
                  <Target className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    No goals set yet. Create your first reading goal!
                  </p>
                </div>
              ) : (
                goals.map((goal) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border transition-all ${
                      goal.completed 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-neutral-50 dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleGoalCompletion(goal.id)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              goal.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-neutral-300 dark:border-neutral-600 hover:border-green-500'
                            }`}
                          >
                            {goal.completed && <Check size={12} />}
                          </button>
                          <span className={`text-sm font-medium ${
                            goal.completed 
                              ? 'text-green-800 dark:text-green-300 line-through' 
                              : 'text-neutral-800 dark:text-neutral-200'
                          }`}>
                            {goal.title}
                          </span>
                        </div>
                        
                        {goal.description && (
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 ml-7">
                            {goal.description}
                          </p>
                        )}

                        {/* Progress Bar */}
                        {goal.targetValue && goal.targetValue > 0 && (
                          <div className="ml-7 mt-2">
                            <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                              <span>Progress: {goal.currentValue || 0}/{goal.targetValue} {goal.unit}</span>
                              <span>{Math.round(((goal.currentValue || 0) / goal.targetValue) * 100)}%</span>
                            </div>
                            <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-2">
                              <div
                                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(((goal.currentValue || 0) / goal.targetValue) * 100, 100)}%`
                                }}
                              />
                            </div>
                            
                            {/* Progress Update Input */}
                            <div className="flex items-center space-x-2 mt-2">
                              <input
                                type="number"
                                placeholder="Update progress"
                                aria-label={`Update progress for ${goal.title}`}
                                className="flex-1 px-2 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    const value = parseInt((e.target as HTMLInputElement).value);
                                    if (!isNaN(value)) {
                                      handleUpdateGoalProgress(goal.id, value);
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }
                                }}
                              />
                              <span className="text-xs text-neutral-500">{goal.unit}</span>
                            </div>
                          </div>
                        )}

                        {goal.deadline && (
                          <div className="flex items-center space-x-1 mt-2 ml-7">
                            <Calendar size={12} className="text-neutral-400" />
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                              Due: {new Date(goal.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={() => handleUpdateGoal(goal)}
                          className="p-1 text-neutral-400 hover:text-primary-600 transition-colors"
                          title="Edit goal"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                          title="Delete goal"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Add/Edit Goal Form */}
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {editingGoal ? 'Edit Goal' : 'Set Custom Goal'}
                </h5>
                {editingGoal && (
                  <button
                    onClick={() => {
                      setEditingGoal(null);
                      setNewGoal({});
                    }}
                    className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={newGoal.title || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Goal title (e.g., Read 20 pages daily)"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />

                <textarea
                  value={newGoal.description || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Description (optional)"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={2}
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={newGoal.targetValue || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: Number(e.target.value) })}
                    placeholder="Target"
                    className="px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <select
                    value={newGoal.unit || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    className="px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Unit</option>
                    <option value="pages">Pages</option>
                    <option value="minutes">Minutes</option>
                    <option value="articles">Articles</option>
                    <option value="books">Books</option>
                    <option value="chapters">Chapters</option>
                    <option value="wpm">Words/Min</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={newGoal.deadline ? newGoal.deadline.split('T')[0] : ''}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button
                    onClick={() => {
                      console.log('🎯 Button clicked!', { editingGoal, newGoal });
                      if (editingGoal) {
                        handleSaveGoal();
                      } else {
                        handleAddGoal();
                      }
                    }}
                    isLoading={loading}
                    size="sm"
                    className="flex items-center justify-center space-x-1"
                    disabled={!newGoal.title?.trim() || loading}
                  >
                    <Plus size={14} />
                    <span>{editingGoal ? 'Save' : 'Add Goal'}</span>
                  </Button>
                </div>
              </div>

              {/* Quick Goal Templates */}
              {!editingGoal && (
                <div className="mt-4">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Quick templates:</p>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { title: 'Read 30 min daily', target: 30, unit: 'minutes' },
                      { title: 'Read 1 book per month', target: 1, unit: 'books' },
                      { title: 'Read 10 pages daily', target: 10, unit: 'pages' },
                      { title: 'Improve to 300 WPM', target: 300, unit: 'wpm' },
                    ].map((template, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          console.log('Template clicked:', template);
                          setNewGoal({
                            title: template.title,
                            targetValue: template.target,
                            unit: template.unit,
                          });
                        }}
                        className="p-2 text-xs text-left rounded border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                      >
                        {template.title}
                      </button>
                    ))}
                  </div>
                  
                  {/* Debug Test Button */}
                  <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border">
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">Debug Info:</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      User ID: {user?.id || 'Not logged in'}<br/>
                      Authenticated: {isAuthenticated ? 'Yes' : 'No'}<br/>
                      Title: {newGoal.title || 'Empty'}<br/>
                      Button disabled: {(!newGoal.title?.trim() || loading).toString()}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      <button
                        onClick={async () => {
                          console.log('🔄 Refreshing auth state...');
                          try {
                            // Force refresh auth state
                            const { supabase } = await import('../../services/auth');
                            const { data: { user: currentUser } } = await supabase.auth.getUser();
                            console.log('Current user from Supabase:', currentUser);
                            
                            // Force update auth store
                            const authStore = useAuthStore.getState();
                            console.log('Current auth store state:', authStore);
                            
                            if (currentUser && !user) {
                              alert('🔄 User found in Supabase but not in store. Try refreshing the page.');
                            } else if (currentUser) {
                              alert('✅ User is authenticated: ' + currentUser.email);
                            } else {
                              alert('❌ No authenticated user found');
                            }
                          } catch (error) {
                            console.error('Error refreshing auth:', error);
                            alert('❌ Error: ' + error);
                          }
                        }}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        🔄 Check Auth
                      </button>
                      
                      <button
                        onClick={() => {
                          console.log('🧪 DEBUG: Testing direct goal creation');
                          console.log('Current state:', { newGoal, user, loading });
                          
                          if (!newGoal.title?.trim()) {
                            alert('❌ Please enter a goal title first');
                            return;
                          }
                          
                          // Force add a test goal with fallback user ID
                          const effectiveUserId = user?.id || 'anonymous_user_' + Date.now();
                          
                          const testGoal: ReadingGoal = {
                            id: crypto.randomUUID(),
                            title: newGoal.title.trim(),
                            description: newGoal.description?.trim() || '',
                            targetValue: newGoal.targetValue || 0,
                            currentValue: 0,
                            unit: newGoal.unit || '',
                            deadline: newGoal.deadline || '',
                            completed: false,
                            createdAt: new Date().toISOString(),
                            userId: effectiveUserId,
                          };
                          
                          const updatedGoals = [...goals, testGoal];
                          setGoals(updatedGoals);
                          saveGoalsToStorage(updatedGoals);
                          setNewGoal({});
                          
                          alert('✅ Debug goal added with user ID: ' + effectiveUserId);
                        }}
                        className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                      >
                        🧪 Force Add
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ReadingAssistant;