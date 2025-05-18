import { create } from 'zustand';
import { supabase, getUserAchievements } from '../services/supabase';
import { toast } from 'sonner';
import { useAuthStore } from './authStore';
import React from 'react';

interface AchievementState {
  achievements: any[];
  userAchievements: any[];
  loading: boolean;
  initialized: boolean;
  loadAchievements: () => Promise<void>;
  checkAchievements: (stats: any) => Promise<any[]>;
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  achievements: [],
  userAchievements: [],
  loading: false,
  initialized: false,

  loadAchievements: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      set({ loading: true });

      // Load all achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('level', { ascending: true });

      if (achievementsError) throw achievementsError;

      // Load user achievements
      const userAchievements = await getUserAchievements(user.id);

      set({
        achievements: achievements || [],
        userAchievements: userAchievements || [],
        loading: false,
        initialized: true,
      });
    } catch (error) {
      console.error('Error loading achievements:', error);
      set({ loading: false, initialized: true });
    }
  },

  checkAchievements: async (stats) => {
    const { user } = useAuthStore.getState();
    if (!user) return [];

    const { achievements, userAchievements } = get();
    const newlyUnlockedAchievements: any[] = [];

    // Map of already unlocked achievement IDs for quick lookup
    const unlockedMap = new Map(
      userAchievements.map(ua => [ua.achievement_id, ua])
    );

    for (const achievement of achievements) {
      // Skip if already unlocked
      if (unlockedMap.has(achievement.id)) continue;

      const criteria = achievement.criteria as any;
      let progress = 0;
      let unlocked = false;

      // Check different criteria types
      if (criteria.total_words_read && stats.total_words_read >= criteria.total_words_read) {
        progress = 100;
        unlocked = true;
      } else if (criteria.max_wpm && stats.max_wpm >= criteria.max_wpm) {
        progress = 100;
        unlocked = true;
      } else if (criteria.sessions_completed && stats.sessions_completed >= criteria.sessions_completed) {
        progress = 100;
        unlocked = true;
      } else if (criteria.total_words_read) {
        // Calculate progress percentage
        progress = Math.min(100, Math.round((stats.total_words_read / criteria.total_words_read) * 100));
      } else if (criteria.max_wpm) {
        progress = Math.min(100, Math.round((stats.max_wpm / criteria.max_wpm) * 100));
      } else if (criteria.sessions_completed) {
        progress = Math.min(100, Math.round((stats.sessions_completed / criteria.sessions_completed) * 100));
      }

      // If achievement unlocked, save it
      if (unlocked) {
        try {
          const { data, error } = await supabase
            .from('user_achievements')
            .insert({
              user_id: user.id,
              achievement_id: achievement.id,
              unlocked_at: new Date().toISOString(),
              progress: 100,
            })
            .select()
            .single();

          if (error) throw error;

          // Add to newly unlocked list
          newlyUnlockedAchievements.push({
            ...achievement,
            unlocked_at: data.unlocked_at,
          });

          // Show toast notification using React.createElement instead of JSX
          toast.success(
            React.createElement('div', { className: 'flex items-center space-x-2' },
              React.createElement('div', { className: 'w-8 h-8 flex items-center justify-center bg-accent-100 text-accent-800 rounded-full' }, '🏆'),
              React.createElement('div', null,
                React.createElement('div', { className: 'font-medium' }, 'Achievement Unlocked!'),
                React.createElement('div', { className: 'text-sm text-neutral-600' }, achievement.name)
              )
            )
          );
        } catch (error) {
          console.error('Error saving achievement:', error);
        }
      } else if (progress > 0) {
        // Update progress if not complete
        try {
          const { error } = await supabase
            .from('user_achievements')
            .upsert({
              user_id: user.id,
              achievement_id: achievement.id,
              progress,
              unlocked_at: null,
            })
            .select()
            .single();

          if (error) throw error;
        } catch (error) {
          console.error('Error updating achievement progress:', error);
        }
      }
    }

    // Reload achievements if any were unlocked
    if (newlyUnlockedAchievements.length > 0) {
      await get().loadAchievements();
    }

    return newlyUnlockedAchievements;
  }
}));