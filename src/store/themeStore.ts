import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { supabase } from '../services/supabase';

interface ThemeState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: async (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
        
        // Update user preference in database
        const { user } = useAuthStore.getState();
        if (user) {
          await supabase
            .from('profiles')
            .update({ theme_preference: theme })
            .eq('id', user.id);
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Initialize theme
if (typeof window !== 'undefined') {
  const theme = useThemeStore.getState().theme;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}