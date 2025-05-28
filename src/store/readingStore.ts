/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { saveReadingSession, updateReadingStats } from '../services/supabase';
import { useAuthStore } from './authStore';

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
  stopReading: (completedWords?: number) => Promise<void>;
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
    set({
      isReading: true,
      progress: 0,
      currentIndex: 0,
      currentSession: {
        ...get().currentSession,
        textId,
        startTime: new Date(),
        endTime: null,
        wordsRead: 0,
        wpm: 0,
      }
    });
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

  stopReading: async (completedWords) => {
    const { currentSession, readingSettings } = get();
    const { user } = useAuthStore.getState();
    
    if (!user || !currentSession.textId || !currentSession.startTime) {
      set({ isReading: false });
      return;
    }
    
    const endTime = new Date();
    const timeSpentMs = endTime.getTime() - currentSession.startTime.getTime();
    const timeSpentMinutes = timeSpentMs / 60000; // Convert to minutes
    
    const wordsRead = completedWords || 0;
    const wpm = timeSpentMinutes > 0 ? Math.round(wordsRead / timeSpentMinutes) : 0;
    
    // Update state
    set({
      isReading: false,
      currentSession: {
        ...currentSession,
        endTime,
        wordsRead,
        wpm,
      }
    });
    
    try {
      // Save reading session
      const sessionData = {
        user_id: user.id,
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
      
      await updateReadingStats(user.id, statsUpdate);
    } catch (error) {
      console.error('Error saving reading session or stats:', error);
    }
  },

  updateProgress: (index, totalWords) => {
    const progress = Math.min(100, Math.round((index / totalWords) * 100));
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

    // Also update user profile if logged in
    const { user, updateProfile } = useAuthStore.getState();
    if (user && settings.speed) {
      updateProfile({ reading_speed: settings.speed }).catch(console.error);
    }
    if (user && settings.fontSize) {
      updateProfile({ font_size: settings.fontSize }).catch(console.error);
    }
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