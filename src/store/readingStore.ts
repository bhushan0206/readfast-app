/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { saveReadingSession, updateReadingStats } from '../services/supabase';
import { useAchievementStore } from './achievementStore';

interface ReadingState {
  currentText: any | null;
  currentSession: {
    textId: string | null;
    startTime: Date | null;
    endTime: Date | null;
    wordsRead: number;
    wpm: number;
    comprehensionScore: number | null;
  };
  readingSettings: {
    speed: number;
    fontSize: number;
    mode: 'word' | 'chunk';
    chunkSize: number;
  };
  isReading: boolean;
  progress: number;
  currentIndex: number;
  setCurrentText: (text: any) => void;
  startReading: (textId: string) => void;
  pauseReading: () => void;
  resumeReading: () => void;
  stopReading: (totalWords: number, userId?: string) => Promise<void>;
  restartReading: () => void;
  updateProgress: (index: number, totalWords: number) => void;
  updateSettings: (settings: Partial<ReadingState['readingSettings']>) => void;
  setComprehensionScore: (score: number) => void;
}

export const useReadingStore = create<ReadingState>((set, get) => ({
  currentText: null,
  currentSession: {
    textId: null,
    startTime: null,
    endTime: null,
    wordsRead: 0,
    wpm: 0,
    comprehensionScore: null,
  },
  readingSettings: {
    speed: 300, // WPM
    fontSize: 18,
    mode: 'word',
    chunkSize: 3,
  },
  isReading: false,
  progress: 0,
  currentIndex: 0,

  setCurrentText: (text) => {
    set({ currentText: text });
  },

  startReading: (textId) => {
    console.log('🚀 Starting reading session for text:', textId);
    const startTime = new Date();
    
    set({
      isReading: true,
      progress: 0,
      currentIndex: 0,
      currentSession: {
        textId,
        startTime,
        endTime: null,
        wordsRead: 0,
        wpm: 0,
        comprehensionScore: null,
      }
    });
    
    console.log('✅ Reading session started at:', startTime);
  },

  pauseReading: () => {
    set({ isReading: false });
  },

  resumeReading: () => {
    set({ isReading: true });
  },

  restartReading: () => {
    set({
      isReading: false,
      progress: 0,
      currentIndex: 0,
      currentSession: {
        ...get().currentSession,
        startTime: null,
        endTime: null,
        wordsRead: 0,
        wpm: 0,
        comprehensionScore: null,
      }
    });
  },

  stopReading: async (totalWords: number, userId?: string) => {
    const state = get();
    const { currentSession, progress } = state;
    
    console.log('🔍 stopReading called with:', { totalWords, userId });
    console.log('🔍 Current state:', { currentSession, progress });
    
    if (!currentSession.textId || !currentSession.startTime) {
      console.log('❌ Missing required session data:', { textId: currentSession.textId, startTime: currentSession.startTime });
      set({ isReading: false });
      return;
    }
    
    const endTime = new Date();
    const timeSpentMs = endTime.getTime() - currentSession.startTime.getTime();
    const timeSpentMinutes = timeSpentMs / 60000; // Convert to minutes
    const timeSpentSeconds = timeSpentMs / 1000; // Convert to seconds for display
    
    // Calculate words read - if progress is 0 or very low, assume they read the whole text
    let wordsRead;
    if (progress <= 5) {
      // If progress is very low, assume they read at least some portion based on time
      // Use a minimum reading speed assumption (e.g., 100 WPM minimum)
      wordsRead = Math.min(totalWords, Math.max(Math.round(timeSpentMinutes * 100), totalWords * 0.1));
    } else {
      wordsRead = Math.round((totalWords * progress) / 100);
    }
    
    // Calculate WPM - ensure it's reasonable
    let wpm = 0;
    if (timeSpentMinutes > 0 && wordsRead > 0) {
      wpm = Math.round(wordsRead / timeSpentMinutes);
      // Cap WPM at reasonable bounds (50-1000 WPM)
      wpm = Math.max(50, Math.min(1000, wpm));
    }
    
    console.log('📊 Reading session completed:', {
      totalWords,
      progress,
      wordsRead,
      wpm,
      timeSpentMs,
      timeSpentMinutes: timeSpentMinutes.toFixed(2),
      timeSpentSeconds: timeSpentSeconds.toFixed(1),
      startTime: currentSession.startTime,
      endTime
    });
    
    // Update state FIRST before saving to database
    const updatedSession = {
      ...currentSession,
      endTime,
      wordsRead,
      wpm,
    };
    
    set({
      isReading: false,
      currentSession: updatedSession
    });
    
    console.log('✅ Session state updated with:', { wordsRead, wpm });
    console.log('✅ Full updated session:', updatedSession);
    
    // Only save to database if user is authenticated
    if (userId) {
      try {
        // Save reading session
        const sessionData = {
          user_id: userId,
          text_id: currentSession.textId,
          start_time: currentSession.startTime.toISOString(),
          end_time: endTime.toISOString(),
          words_read: wordsRead,
          wpm,
          comprehension_score: currentSession.comprehensionScore,
        };
        
        await saveReadingSession(sessionData);
      
      // Update reading stats
      const statsUpdate: {
        total_words_read: number;
        total_time_spent: number;
        sessions_completed: number;
        max_wpm?: number;
        avg_wpm?: number;
        avg_comprehension?: number | null;
      } = {
        total_words_read: Math.round(wordsRead), // Ensure integer
        total_time_spent: Math.round(timeSpentMs / 1000), // Convert to seconds and round
        sessions_completed: 1,
      };
      
      if (wpm > 0) {
        statsUpdate.max_wpm = Math.round(wpm); // Ensure integer
        statsUpdate.avg_wpm = Math.round(wpm); // Ensure integer
      }
      
      if (currentSession.comprehensionScore !== null) {
        statsUpdate.avg_comprehension = Math.round(currentSession.comprehensionScore || 0); // Ensure integer
      }
      
      await updateReadingStats(userId, statsUpdate);
      
      // Get the current cumulative stats from database for achievement checking
      try {
        const { getUserReadingStats } = await import('../services/supabase');
        const currentStats = await getUserReadingStats(userId);
        
        if (currentStats) {
          console.log('Current cumulative stats from DB:', currentStats);
          
          // Get achievement store and check achievements
          const { checkAchievements } = useAchievementStore.getState();
          await checkAchievements({
            total_words_read: currentStats.total_words_read || 0,
            sessions_completed: currentStats.sessions_completed || 0,
            max_wpm: currentStats.max_wpm || 0,
            avg_wpm: currentStats.avg_wpm || 0,
            avg_comprehension: currentStats.avg_comprehension || null
          });
        }        } catch (error) {
          console.error('Error fetching stats for achievement checking:', error);
        }
        
      } catch (error) {
        console.error('Error saving reading session or stats:', error);
      }
    } else {
      console.log('📝 Session completed without database save (user not authenticated)');
    }
  },

  updateProgress: (index, totalWords) => {
    const progress = Math.min(100, Math.round((index / totalWords) * 100));
    console.log('📈 Progress updated:', { index, totalWords, progress });
    set({
      progress,
      currentIndex: index,
    });
  },

  updateSettings: (settings) => {
    set({
      readingSettings: {
        ...get().readingSettings,
        ...settings,
      }
    });
  },

  setComprehensionScore: (score) => {
    set({
      currentSession: {
        ...get().currentSession,
        comprehensionScore: score,
      }
    });
  },
}));