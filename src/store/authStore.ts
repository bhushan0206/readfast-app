/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { supabase, signInWithProvider } from '../services/supabase';
import type { Provider } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { AuthSecurity, SessionManager } from '../utils/securityMiddleware';
import { logger, LogCategory } from '../utils/logger';

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
      
      // Security validation
      const validation = AuthSecurity.validateLoginAttempt(email, password);
      if (!validation.isValid) {
        set({ loading: false });
        const errorMessage = validation.errors.join(', ');
        toast.error(errorMessage);
        logger.warn(LogCategory.AUTH, 'Login validation failed', { email, errors: validation.errors });
        throw new Error(errorMessage);
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Reset login attempts on successful login
      AuthSecurity.resetLoginAttempts(email);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      // Extend session
      SessionManager.extendSession(24);
      
      set({
        user: data.user,
        profile,
        loading: false,
      });
      
      logger.info(LogCategory.AUTH, 'User login successful', { userId: data.user.id });
      toast.success('Logged in successfully');
    } catch (error: any) {
      set({ loading: false });
      logger.error(LogCategory.AUTH, 'Login failed', { email }, error);
      toast.error(error.message || 'Failed to login');
      throw error;
    }
  },

  loginWithProvider: async (provider: Provider) => {
    try {
      set({ loading: true });
      await signInWithProvider(provider);
      // Note: The actual user session will be handled by the auth callback
      // where we'll check for account linking
    } catch (error: any) {
      set({ loading: false });
      toast.error(error.message || `Failed to login with ${provider}`);
      throw error;
    }
  },

  register: async (email, password, fullName) => {
    try {
      set({ loading: true });

      // Security validation
      const validation = AuthSecurity.validateRegistration(email, password, password);
      if (!validation.isValid) {
        set({ loading: false });
        const errorMessage = validation.errors.join(', ');
        toast.error(errorMessage);
        logger.warn(LogCategory.AUTH, 'Registration validation failed', { email, errors: validation.errors });
        throw new Error(errorMessage);
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
        set({ loading: false });
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
          logger.error(LogCategory.AUTH, 'Profile fetch error after signup', { userId: data.user.id }, profileError);
        }
        profile = profileData;
      }

      set({
        user: data.user,
        profile,
        loading: false,
      });

      logger.info(LogCategory.AUTH, 'User registration successful', { userId: data.user?.id });
      toast.success('Registration successful');
    } catch (error: any) {
      set({ loading: false });
      logger.error(LogCategory.AUTH, 'Registration failed', { email }, error);
      toast.error(error.message || 'Failed to register');
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ loading: true });
      
      const { user } = get();
      
      await supabase.auth.signOut();
      
      // Clear session data
      SessionManager.clearSession();
      
      set({
        user: null,
        profile: null,
        loading: false,
      });
      
      logger.info(LogCategory.AUTH, 'User logout successful', { userId: user?.id });
      toast.success('Logged out successfully');
    } catch (error: any) {
      set({ loading: false });
      logger.error(LogCategory.AUTH, 'Logout failed', {}, error);
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