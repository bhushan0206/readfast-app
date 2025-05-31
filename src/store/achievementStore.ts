import { create } from 'zustand';
import { supabase, getUserAchievements } from '../services/supabase';
import { toast } from 'sonner';
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
    try {
      set({ loading: true });
      console.log('🔄 Achievement Store: Starting to load achievements...');
      
      // Get current user from Supabase auth directly
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔍 Achievement Store: Current user:', user?.id);
      
      if (!user) {
        console.log('❌ Achievement Store: No authenticated user found');
        set({ loading: false, initialized: true });
        return;
      }

      // Load all achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('level', { ascending: true });

      if (achievementsError) {
        console.error('❌ Error loading achievements:', achievementsError);
        // Set some default achievements if database fails
        const defaultAchievements = [
          {
            id: 'first-session',
            name: 'First Steps',
            description: 'Complete your first reading session',
            icon: '🎯',
            criteria: { sessions_completed: 1 }
          },
          {
            id: 'word-explorer',
            name: 'Word Explorer',
            description: 'Read 1000 words',
            icon: '📖',
            criteria: { total_words_read: 1000 }
          },
          {
            id: 'speed-reader',
            name: 'Speed Reader',
            description: 'Reach 300 WPM reading speed',
            icon: '⚡',
            criteria: { max_wpm: 300 }
          }
        ];
        
        console.log('✅ Using default achievements:', defaultAchievements.length);
        
        // Load user achievements
        const userAchievements = await getUserAchievements(user.id);
        console.log('✅ Loaded user achievements:', userAchievements?.length || 0);
        
        set({
          achievements: defaultAchievements,
          userAchievements: userAchievements || [],
          loading: false,
          initialized: true,
        });
        
        return;
      }

      console.log('✅ Loaded achievements from database:', achievements?.length || 0);

      // Load user achievements
      const userAchievements = await getUserAchievements(user.id);
      console.log('✅ Loaded user achievements:', userAchievements?.length || 0);

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
    try {
      // Get current user from Supabase auth directly
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔍 checkAchievements: Current user:', user?.id);
      
      if (!user) {
        console.log('❌ checkAchievements: No user found for achievement checking');
        return [];
      }

    const { achievements, userAchievements } = get();
    console.log('🔍 Checking achievements with stats:', stats);
    console.log('🔍 Available achievements:', achievements.length);
    console.log('🔍 Current user achievements:', userAchievements.length);
    
    const newlyUnlockedAchievements: any[] = [];

    // Map of already unlocked achievement IDs for quick lookup
    const unlockedMap = new Map(
      userAchievements.map(ua => [ua.achievement_id, ua])
    );

    for (const achievement of achievements) {
      // Skip if already unlocked
      if (unlockedMap.has(achievement.id)) {
        console.log(`Achievement ${achievement.name} already unlocked`);
        continue;
      }

      const criteria = achievement.criteria as any;
      let progress = 0;
      let unlocked = false;

      console.log(`Checking achievement: ${achievement.name}`, { criteria, stats });

      // Check different criteria types
      if (criteria.total_words_read && stats.total_words_read >= criteria.total_words_read) {
        progress = 100;
        unlocked = true;
        console.log(`Achievement ${achievement.name} unlocked by total_words_read!`);
      } else if (criteria.max_wpm && stats.max_wpm >= criteria.max_wpm) {
        progress = 100;
        unlocked = true;
        console.log(`Achievement ${achievement.name} unlocked by max_wpm!`);
      } else if (criteria.sessions_completed && stats.sessions_completed >= criteria.sessions_completed) {
        progress = 100;
        unlocked = true;
        console.log(`Achievement ${achievement.name} unlocked by sessions_completed!`);
      } else if (criteria.total_words_read) {
        // Calculate progress percentage
        progress = Math.min(100, Math.round((stats.total_words_read / criteria.total_words_read) * 100));
        console.log(`Progress for ${achievement.name} (words): ${progress}%`);
      } else if (criteria.max_wpm) {
        progress = Math.min(100, Math.round((stats.max_wpm / criteria.max_wpm) * 100));
        console.log(`Progress for ${achievement.name} (wpm): ${progress}%`);
      } else if (criteria.sessions_completed) {
        progress = Math.min(100, Math.round((stats.sessions_completed / criteria.sessions_completed) * 100));
        console.log(`Progress for ${achievement.name} (sessions): ${progress}%`);
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
            React.createElement('div', { 
              className: 'flex items-center space-x-3 p-2',
              style: {
                background: 'linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)',
                borderRadius: '12px',
                border: '2px solid #d97706',
                boxShadow: '0 10px 25px rgba(251, 191, 36, 0.3)',
                animation: 'bounce 0.6s ease-in-out'
              }
            },
              React.createElement('div', { 
                className: 'relative',
                style: {
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  borderRadius: '50%',
                  padding: '12px',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
                  animation: 'pulse 2s infinite'
                }
              }, 
                React.createElement('span', { 
                  style: { 
                    fontSize: '24px',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  } 
                }, '🏆')
              ),
              React.createElement('div', { className: 'flex-1' },
                React.createElement('div', { 
                  className: 'font-bold text-amber-900 text-lg',
                  style: { 
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    marginBottom: '2px'
                  }
                }, '🎉 Achievement Unlocked!'),
                React.createElement('div', { 
                  className: 'text-amber-800 font-semibold text-base',
                  style: { marginBottom: '4px' }
                }, achievement.name),
                React.createElement('div', { 
                  className: 'text-amber-700 text-sm opacity-90'
                }, achievement.description)
              ),
              React.createElement('div', {
                style: {
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
                  animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
                }
              },
                React.createElement('span', { 
                  style: { 
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }
                }, '!')
              )
            ),
            {
              duration: 5000,
              style: {
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                padding: '0'
              }
            }
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
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }
}));