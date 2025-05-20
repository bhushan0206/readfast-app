/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { supabase, signInWithProvider } from '../services/supabase';
import type { Provider } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthState {
  user: any | null;
  profile: any | null;
  initialized: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: Provider) => Promise<void>;
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
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
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
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
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

  loginWithProvider: async (provider: Provider) => {
    try {
      set({ loading: true });
      await signInWithProvider(provider);
    } catch (error: any) {
      set({ loading: false });
      toast.error(error.message || `Failed to login with ${provider}`);
      throw error;
    }
  },

  register: async (email, password, fullName) => {
    try {
      set({ loading: true });

      // Validate input before making the request
      if (!email || !password) {
        set({ loading: false });
        toast.error('Email and password are required');
        throw new Error('Email and password are required');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        // Log the full error object for debugging
        console.error("Supabase signup error:", error);
        set({ loading: false });
        toast.error(error.message || 'Failed to register');
        throw error;
      }

      // Only fetch profile if user was created
      let profile = null;
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        if (profileError) {
          console.error("Profile fetch error after signup:", profileError);
        }
        profile = profileData;
      }

      set({
        user: data.user,
        profile,
        loading: false,
      });

      toast.success('Registration successful');
    } catch (error: any) {
      set({ loading: false });
      // Log the error for debugging
      console.error("Registration failed:", error);
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
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      set({ profile });
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  },
}));

// Initialize auth on import
useAuthStore.getState().initializeAuth();