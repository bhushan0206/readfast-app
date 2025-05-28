import React, { useState, useEffect } from 'react';
import { BarChart3, Brain, Clock, BookOpen, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateText } from '../../../services/groq';

interface TextAnalysis {
  difficulty: number; // 1-10 scale
  estimatedTime: number; // minutes
  readabilityScore: number;
  keyTopics: string[];
  recommendations: string[];
  vocabularyLevel: 'Basic' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface TextAnalyzerProps {
  text: string;
  title?: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  onAnalysisComplete?: (analysis: TextAnalysis) => void;
}

const TextAnalyzer: React.FC<TextAnalyzerProps> = ({ 
  text, 
  title, 
  userLevel = 'intermediate',
  onAnalysisComplete 
}) => {
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeText = async () => {
    if (!text) return;

    setLoading(true);
    try {
      // Basic text analysis
      const wordCount = text.split(/\s+/).length;
      const sentenceCount = text.split(/[.!?]+/).length;
      const avgWordsPerSentence = wordCount / sentenceCount;
      
      // Estimate reading time (average 250 WPM)
      const estimatedTime = Math.ceil(wordCount / 250);

      // AI-powered analysis
      const prompt = `Analyze this text for reading difficulty and provide insights:

Title: ${title || 'Untitled'}
Text: ${text.substring(0, 1000)}...
Word count: ${wordCount}
User level: ${userLevel}

Provide analysis in JSON format with:
- difficulty (1-10 scale)
- readabilityScore (1-100)
- keyTopics (array of 3-5 main topics)
- recommendations (array of 2-3 reading tips)
- vocabularyLevel (Basic/Intermediate/Advanced/Expert)

Keep topics under 15 characters and recommendations under 50 characters each.`;

      const aiResponse = await generateText(prompt);
      
      let aiAnalysis: any = {};
      try {
        aiAnalysis = JSON.parse(aiResponse);
      } catch {
        // Fallback analysis
        aiAnalysis = {
          difficulty: Math.min(Math.max(Math.round(avgWordsPerSentence / 3), 1), 10),
          readabilityScore: Math.max(100 - (avgWordsPerSentence * 2), 20),
          keyTopics: ['Reading', 'Comprehension', 'Practice'],
          recommendations: ['Take breaks every 20 minutes', 'Focus on key concepts', 'Review difficult sections'],
          vocabularyLevel: wordCount > 1000 ? 'Advanced' : 'Intermediate'
        };
      }

      const finalAnalysis: TextAnalysis = {
        difficulty: aiAnalysis.difficulty || Math.round(avgWordsPerSentence / 3),
        estimatedTime,
        readabilityScore: aiAnalysis.readabilityScore || Math.max(100 - (avgWordsPerSentence * 2), 20),
        keyTopics: aiAnalysis.keyTopics || ['General', 'Reading'],
        recommendations: aiAnalysis.recommendations || ['Take your time', 'Focus on comprehension'],
        vocabularyLevel: aiAnalysis.vocabularyLevel || 'Intermediate'
      };

      setAnalysis(finalAnalysis);
      onAnalysisComplete?.(finalAnalysis);
    } catch (error) {
      console.error('Error analyzing text:', error);
      // Provide basic fallback analysis
      const basicAnalysis: TextAnalysis = {
        difficulty: 5,
        estimatedTime: Math.ceil(text.split(/\s+/).length / 250),
        readabilityScore: 70,
        keyTopics: ['Reading', 'Practice'],
        recommendations: ['Read at comfortable pace', 'Take notes if needed'],
        vocabularyLevel: 'Intermediate'
      };
      setAnalysis(basicAnalysis);
      onAnalysisComplete?.(basicAnalysis);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (text) {
      analyzeText();
    }
  }, [text]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="animate-pulse text-primary-500" size={24} />
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-32"></div>
            <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-48"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-neutral-100 dark:bg-neutral-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-600 dark:text-green-400';
    if (difficulty <= 6) return 'text-yellow-600 dark:text-yellow-400';
    if (difficulty <= 8) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 3) return 'Easy';
    if (difficulty <= 6) return 'Medium';
    if (difficulty <= 8) return 'Hard';
    return 'Very Hard';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700 space-y-4"
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
          <Brain size={24} className="text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-white">AI Text Analysis</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Powered by advanced AI</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
          <BarChart3 className={`mx-auto mb-2 ${getDifficultyColor(analysis.difficulty)}`} size={20} />
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Difficulty</p>
          <p className={`font-semibold ${getDifficultyColor(analysis.difficulty)}`}>
            {getDifficultyLabel(analysis.difficulty)}
          </p>
        </div>

        <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
          <Clock className="mx-auto mb-2 text-blue-600 dark:text-blue-400" size={20} />
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Est. Time</p>
          <p className="font-semibold text-blue-600 dark:text-blue-400">
            {analysis.estimatedTime}m
          </p>
        </div>

        <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
          <BookOpen className="mx-auto mb-2 text-purple-600 dark:text-purple-400" size={20} />
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Readability</p>
          <p className="font-semibold text-purple-600 dark:text-purple-400">
            {analysis.readabilityScore}%
          </p>
        </div>

        <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
          <Zap className="mx-auto mb-2 text-orange-600 dark:text-orange-400" size={20} />
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Vocabulary</p>
          <p className="font-semibold text-orange-600 dark:text-orange-400">
            {analysis.vocabularyLevel}
          </p>
        </div>
      </div>

      {analysis.keyTopics.length > 0 && (
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-white mb-2">Key Topics</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.keyTopics.map((topic, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-xs"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis.recommendations.length > 0 && (
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-white mb-2">AI Recommendations</h4>
          <ul className="space-y-1">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-neutral-600 dark:text-neutral-400 flex items-start">
                <span className="text-primary-500 mr-2">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default TextAnalyzer;