import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateText } from '../../../services/groq';
import Button from '../../../shared/components/Button';

interface AIInsight {
  id: string;
  type: 'improvement' | 'achievement' | 'suggestion' | 'challenge';
  title: string;
  description: string;
  action?: string;
  icon: React.ReactNode;
}

interface AIInsightsProps {
  userStats?: {
    averageWPM: number;
    totalTextsRead: number;
    comprehensionScore: number;
    readingStreak: number;
  };
}

const AIInsights: React.FC<AIInsightsProps> = ({ userStats }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);

  const generateAIInsights = async () => {
    if (!userStats) return;

    setLoading(true);
    try {
      const prompt = `Based on these reading statistics:
      - Average reading speed: ${userStats.averageWPM} WPM
      - Total texts read: ${userStats.totalTextsRead}
      - Comprehension score: ${userStats.comprehensionScore}%
      - Reading streak: ${userStats.readingStreak} days
      
      Generate 3-4 personalized insights for improving reading speed and comprehension. 
      Format as JSON array with objects containing: type (improvement/achievement/suggestion/challenge), title, description, action.
      Keep descriptions under 50 words and actions under 30 words.`;

      const aiResponse = await generateText(prompt);
      
      // Try to parse AI response, fallback to default insights
      let parsedInsights: any[] = [];
      try {
        parsedInsights = JSON.parse(aiResponse);
      } catch {
        // Fallback insights based on stats
        parsedInsights = getDefaultInsights(userStats);
      }

      const formattedInsights: AIInsight[] = parsedInsights.map((insight, index) => ({
        id: `insight-${index}`,
        ...insight,
        icon: getIconForType(insight.type)
      }));

      setInsights(formattedInsights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      setInsights(getDefaultInsights(userStats));
    } finally {
      setLoading(false);
    }
  };

  const getDefaultInsights = (stats: NonNullable<typeof userStats>): AIInsight[] => {
    const insights: AIInsight[] = [];

    if (stats.averageWPM < 200) {
      insights.push({
        id: 'speed-improvement',
        type: 'improvement',
        title: 'Boost Your Reading Speed',
        description: 'Your current speed is below average. Try speed reading exercises to reach 250+ WPM.',
        action: 'Practice with shorter texts first',
        icon: <TrendingUp size={20} />
      });
    }

    if (stats.comprehensionScore > 80) {
      insights.push({
        id: 'comprehension-achievement',
        type: 'achievement',
        title: 'Excellent Comprehension!',
        description: 'Your comprehension score is outstanding. You can focus more on speed now.',
        action: 'Try increasing your reading speed',
        icon: <Target size={20} />
      });
    }

    if (stats.readingStreak >= 7) {
      insights.push({
        id: 'streak-achievement',
        type: 'achievement',
        title: 'Amazing Reading Streak!',
        description: `${stats.readingStreak} days of consistent reading. Keep up the great work!`,
        action: 'Challenge yourself with harder texts',
        icon: <Sparkles size={20} />
      });
    }

    insights.push({
      id: 'daily-challenge',
      type: 'challenge',
      title: 'Daily Challenge',
      description: 'Try reading a text 25 WPM faster than your average today.',
      action: 'Start challenge now',
      icon: <Brain size={20} />
    });

    return insights;
  };

  const getIconForType = (type: string): React.ReactNode => {
    switch (type) {
      case 'improvement': return <TrendingUp size={20} />;
      case 'achievement': return <Target size={20} />;
      case 'suggestion': return <Brain size={20} />;
      case 'challenge': return <Sparkles size={20} />;
      default: return <Brain size={20} />;
    }
  };

  useEffect(() => {
    if (userStats) {
      generateAIInsights();
    }
  }, [userStats]);

  useEffect(() => {
    if (insights.length > 1) {
      const interval = setInterval(() => {
        setCurrentInsightIndex((prev) => (prev + 1) % insights.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [insights.length]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3">
          <Brain className="animate-pulse" size={24} />
          <div className="animate-pulse">
            <div className="h-4 bg-white/30 rounded w-48 mb-2"></div>
            <div className="h-3 bg-white/20 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (insights.length === 0) return null;

  const currentInsight = insights[currentInsightIndex];

  return (
    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Brain size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Insights</h3>
              <p className="text-white/80 text-sm">Personalized recommendations</p>
            </div>
          </div>
          {insights.length > 1 && (
            <div className="flex space-x-1">
              {insights.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentInsightIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentInsight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              {currentInsight.icon}
              <h4 className="font-medium">{currentInsight.title}</h4>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">
              {currentInsight.description}
            </p>
            {currentInsight.action && (
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50"
                rightIcon={<ChevronRight size={16} />}
              >
                {currentInsight.action}
              </Button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIInsights;