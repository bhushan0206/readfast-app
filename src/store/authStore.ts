import { create } from 'zustand';
import { supabase, getUserProfile } from '../services/supabase';
import { toast } from 'sonner';

interface AuthState {
  user: any | null;
  profile: any | null;
  initialized: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  initialized: false,
  loading: false,

  initializeAuth: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const profile = await getUserProfile(user.id);
        set({ user, profile, initialized: true });
      } else {
        set({ initialized: true });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ initialized: true });
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      const profile = await getUserProfile(data.user.id);
      
      set({
        user: data.user,
        profile,
        loading: false,
      });
      
      toast.success('Logged in successfully');
    } catch (error: any) {
      set({ loading: false });
      toast.error(error.message || 'Failed to login');
      throw error;
    }
  },

  register: async (email, password, fullName) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) throw error;
      
      // Create profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user!.id,
          email,
          full_name: fullName,
          reading_speed: 200, // Default reading speed (WPM)
          font_size: 18,
          theme: 'light',
          reading_level: 'beginner',
        });
      
      if (profileError) throw profileError;
      
      // Initialize reading stats
      const { error: statsError } = await supabase
        .from('reading_stats')
        .insert({
          user_id: data.user!.id,
          avg_wpm: 0,
          max_wpm: 0,
          total_words_read: 0,
          total_time_spent: 0,
          avg_comprehension: null,
          sessions_completed: 0,
        });
      
      if (statsError) throw statsError;
      
      const profile = await getUserProfile(data.user!.id);
      
      set({
        user: data.user,
        profile,
        loading: false,
      });
      
      toast.success('Registration successful');
    } catch (error: any) {
      set({ loading: false });
      toast.error(error.message || 'Failed to register');
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ loading: true });
      
      await supabase.auth.signOut();
      
      set({
        user: null,
        profile: null,
        loading: false,
      });
      
      toast.success('Logged out successfully');
    } catch (error: any) {
      set({ loading: false });
      toast.error(error.message || 'Failed to logout');
      throw error;
    }
  },

  updateProfile: async (updates) => {
    try {
      const { user } = get();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      const updatedProfile = await getUserProfile(user.id);
      
      set({ profile: updatedProfile });
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  },
}));

// Initialize auth on import
useAuthStore.getState().initializeAuth();