import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { useAuthStore } from './authStore';
import { analyzeText, TextAnalysis } from '../utils/textAnalysis';

// Generate sample data for demo purposes
const generateSampleData = (): ReadingPattern[] => {
  const patterns: ReadingPattern[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Skip some days to make it more realistic (not reading every day)
    if (Math.random() < 0.3) continue;
    
    // Generate realistic reading data with some variance
    const baseWPM = 220 + Math.random() * 60; // 220-280 WPM range
    const variance = (Math.random() - 0.5) * 40; // ±20 WPM variance
    const wpm = Math.max(150, Math.round(baseWPM + variance));
    
    const wordsRead = Math.round(200 + Math.random() * 800); // 200-1000 words
    const sessions = Math.round(1 + Math.random() * 2); // 1-3 sessions
    
    patterns.push({
      date: date.toISOString().split('T')[0],
      avgWPM: wpm,
      wordsRead,
      sessionsCount: sessions,
      comprehensionScore: Math.round(75 + Math.random() * 20), // 75-95%
      difficultyLevel: ['Beginner', 'Intermediate', 'Advanced', 'Expert'][Math.floor(Math.random() * 4)] as any
    });
  }
  
  return patterns;
};

interface ReadingPattern {
  date: string;
  wordsRead: number;
  avgWPM: number;
  sessionsCount: number;
  comprehensionScore: number | null;
  difficultyLevel: string;
}

interface ReadingInsight {
  type: 'speed' | 'volume' | 'comprehension' | 'difficulty' | 'pattern';
  title: string;
  description: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  recommendation?: string;
}

interface AnalyticsState {
  patterns: ReadingPattern[];
  insights: ReadingInsight[];
  textAnalyses: Map<string, TextAnalysis>;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  loadAnalytics: () => Promise<void>;
  analyzeCurrentText: (textId: string, content: string, userWPM?: number) => TextAnalysis;
  generateInsights: () => void;
  getReadingTrends: (days?: number) => ReadingPattern[];
  getPerformanceMetrics: () => {
    avgWPM: number;
    totalWords: number;
    avgComprehension: number;
    consistencyScore: number;
  };
  resetAnalytics: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  patterns: [],
  insights: [],
  textAnalyses: new Map(),
  loading: false,
  initialized: false,

  loadAnalytics: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const state = get();
    if (state.loading || state.initialized) return; // Prevent multiple calls

    try {
      set({ loading: true });

      // Load reading sessions from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: sessions, error } = await supabase
        .from('reading_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', thirtyDaysAgo.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Group sessions by date to create patterns
      const patternMap = new Map<string, {
        wordsRead: number;
        totalWPM: number;
        sessionsCount: number;
        comprehensionScores: number[];
        difficultyLevels: number[];
      }>();

      sessions?.forEach(session => {
        const date = new Date(session.start_time).toISOString().split('T')[0];
        const existing = patternMap.get(date) || {
          wordsRead: 0,
          totalWPM: 0,
          sessionsCount: 0,
          comprehensionScores: [],
          difficultyLevels: []
        };

        existing.wordsRead += session.words_read || 0;
        existing.totalWPM += session.wpm || 0;
        existing.sessionsCount += 1;
        
        if (session.comprehension_score !== null) {
          existing.comprehensionScores.push(session.comprehension_score);
        }
        
        // Calculate difficulty based on WPM and word count
        const avgWPM = session.wpm || 0;
        let difficultyLevel = 1; // Default to beginner
        
        if (avgWPM > 0) {
          if (avgWPM >= 300) difficultyLevel = 4; // Expert
          else if (avgWPM >= 250) difficultyLevel = 3; // Advanced  
          else if (avgWPM >= 200) difficultyLevel = 2; // Intermediate
          else difficultyLevel = 1; // Beginner
        }
        
        existing.difficultyLevels.push(difficultyLevel);

        patternMap.set(date, existing);
      });

      // Convert to patterns array
      const patterns: ReadingPattern[] = Array.from(patternMap.entries()).map(([date, data]) => ({
        date,
        wordsRead: data.wordsRead,
        avgWPM: data.sessionsCount > 0 ? Math.round(data.totalWPM / data.sessionsCount) : 0,
        sessionsCount: data.sessionsCount,
        comprehensionScore: data.comprehensionScores.length > 0 
          ? Math.round(data.comprehensionScores.reduce((a, b) => a + b, 0) / data.comprehensionScores.length)
          : null,
        difficultyLevel: data.difficultyLevels.length > 0
          ? (['Beginner', 'Intermediate', 'Advanced', 'Expert'][Math.round(data.difficultyLevels.reduce((a, b) => a + b, 0) / data.difficultyLevels.length) - 1] || 'Beginner')
          : 'Beginner'
      }));

      set({ patterns, loading: false, initialized: true });
      
      // Generate insights after loading data
      get().generateInsights();

      // If no data exists, generate sample data for demonstration
      if (patterns.length === 0) {
        const samplePatterns = generateSampleData();
        set({ patterns: samplePatterns });
        get().generateInsights();
      }

    } catch (error) {
      console.error('Error loading analytics:', error);
      
      // Always generate sample data when there's an error or no data
      const samplePatterns = generateSampleData();
      set({ patterns: samplePatterns, loading: false, initialized: true });
      get().generateInsights();
    }
  },

  analyzeCurrentText: (textId: string, content: string, userWPM = 250) => {
    const analysis = analyzeText(content, userWPM);
    
    set(state => ({
      textAnalyses: new Map(state.textAnalyses).set(textId, analysis)
    }));
    
    return analysis;
  },

  generateInsights: () => {
    const { patterns } = get();
    if (patterns.length === 0) return;

    const insights: ReadingInsight[] = [];
    
    // Speed trend analysis
    const recentPatterns = patterns.slice(-7); // Last 7 days
    const olderPatterns = patterns.slice(-14, -7); // Previous 7 days
    
    if (recentPatterns.length > 0 && olderPatterns.length > 0) {
      const recentAvgWPM = recentPatterns.reduce((sum, p) => sum + p.avgWPM, 0) / recentPatterns.length;
      const olderAvgWPM = olderPatterns.reduce((sum, p) => sum + p.avgWPM, 0) / olderPatterns.length;
      const speedChange = ((recentAvgWPM - olderAvgWPM) / olderAvgWPM) * 100;
      
      insights.push({
        type: 'speed',
        title: 'Reading Speed Trend',
        description: `Your reading speed has ${speedChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(speedChange).toFixed(1)}% this week`,
        value: `${Math.round(recentAvgWPM)} WPM`,
        trend: speedChange > 5 ? 'up' : speedChange < -5 ? 'down' : 'stable',
        recommendation: speedChange < 0 ? 'Try shorter reading sessions to improve focus' : 'Great progress! Keep up the consistent practice'
      });
    }

    // Volume analysis
    const totalWords = patterns.reduce((sum, p) => sum + p.wordsRead, 0);
    const avgWordsPerDay = patterns.length > 0 ? totalWords / patterns.length : 0;
    
    insights.push({
      type: 'volume',
      title: 'Daily Reading Volume',
      description: `You're reading an average of ${Math.round(avgWordsPerDay)} words per day`,
      value: totalWords,
      trend: avgWordsPerDay > 1000 ? 'up' : avgWordsPerDay > 500 ? 'stable' : 'down',
      recommendation: avgWordsPerDay < 500 ? 'Try to increase your daily reading time' : 'Excellent reading consistency!'
    });

    // Comprehension analysis
    const comprehensionScores = patterns
      .map(p => p.comprehensionScore)
      .filter((score): score is number => score !== null);
    
    if (comprehensionScores.length > 0) {
      const avgComprehension = comprehensionScores.reduce((sum, score) => sum + score, 0) / comprehensionScores.length;
      
      insights.push({
        type: 'comprehension',
        title: 'Comprehension Score',
        description: `Your average comprehension score is ${Math.round(avgComprehension)}%`,
        value: `${Math.round(avgComprehension)}%`,
        trend: avgComprehension > 80 ? 'up' : avgComprehension > 60 ? 'stable' : 'down',
        recommendation: avgComprehension < 70 ? 'Consider reading slower for better comprehension' : 'Great comprehension! You can try more challenging texts'
      });
    }

    // Consistency analysis
    const daysWithReading = patterns.filter(p => p.sessionsCount > 0).length;
    const consistencyScore = (daysWithReading / Math.min(patterns.length, 30)) * 100;
    
    insights.push({
      type: 'pattern',
      title: 'Reading Consistency',
      description: `You've been reading ${daysWithReading} out of the last ${patterns.length} days`,
      value: `${Math.round(consistencyScore)}%`,
      trend: consistencyScore > 70 ? 'up' : consistencyScore > 40 ? 'stable' : 'down',
      recommendation: consistencyScore < 50 ? 'Try to establish a daily reading habit' : 'Excellent reading consistency!'
    });

    set({ insights });
  },

  getReadingTrends: (days = 7) => {
    const { patterns } = get();
    return patterns.slice(-days);
  },

  getPerformanceMetrics: () => {
    const { patterns } = get();
    
    if (patterns.length === 0) {
      return {
        avgWPM: 0,
        totalWords: 0,
        avgComprehension: 0,
        consistencyScore: 0
      };
    }

    const totalWords = patterns.reduce((sum, p) => sum + p.wordsRead, 0);
    const avgWPM = patterns.reduce((sum, p) => sum + p.avgWPM, 0) / patterns.length;
    
    const comprehensionScores = patterns
      .map(p => p.comprehensionScore)
      .filter((score): score is number => score !== null);
    const avgComprehension = comprehensionScores.length > 0
      ? comprehensionScores.reduce((sum, score) => sum + score, 0) / comprehensionScores.length
      : 0;
    
    const daysWithReading = patterns.filter(p => p.sessionsCount > 0).length;
    const consistencyScore = (daysWithReading / patterns.length) * 100;

    return {
      avgWPM: Math.round(avgWPM),
      totalWords,
      avgComprehension: Math.round(avgComprehension),
      consistencyScore: Math.round(consistencyScore)
    };
  },

  // Reset analytics state - useful for debugging
  resetAnalytics: () => {
    set({
      patterns: [],
      insights: [],
      textAnalyses: new Map(),
      loading: false,
      initialized: false
    });
  }
}));