import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const theme = useThemeStore.getState().theme;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}