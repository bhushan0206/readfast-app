/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { supabase, signInWithProvider } from '../services/supabase';
import type { Provider } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { AuthSecurity, SessionManager } from '../utils/securityMiddleware';
import { logger, LogCategory } from '../utils/logger';
import { handleProductionOAuth } from '../utils/oauth-fix';

interface AuthState {
  user: any | null;
  profile: any | null;
  initialized: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: Provider) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
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
      console.log('🔄 Initializing auth...');
      const currentState = get();
      
      // Don't initialize if already loading or initialized
      if (currentState.loading) {
        console.log('⏳ Auth already initializing, skipping...');
        return;
      }
      
      set({ loading: true });

      // Try production OAuth fix first
      const productionSession = await handleProductionOAuth();
      if (productionSession?.user) {
        console.log('✅ Production OAuth session found');
        set({
          user: productionSession.user,
          profile: null,
          initialized: true,
          loading: false
        });
        return;
      }

      // In production, wait for auth state to settle after OAuth redirect
      if (typeof window !== 'undefined' && window.location.href.includes('/auth/callback')) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth initialization timeout')), 10000)
      );

      const authPromise = supabase.auth.getSession();

      const { data: { session }, error } = await Promise.race([authPromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ Session error:', error);
        set({ user: null, profile: null, initialized: true, loading: false });
        return;
      }

      if (session?.user) {
        console.log('✅ Session found for:', session.user.email);
        
        // Get user profile with timeout
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const profileTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
        );

        let profile = null;
        try {
          const { data: profileData, error: profileError } = await Promise.race([profilePromise, profileTimeoutPromise]) as any;
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('❌ Profile fetch error:', profileError);
          } else {
            profile = profileData;
          }
        } catch (profileTimeoutError) {
          console.warn('⚠️ Profile fetch timed out, continuing without profile');
        }

        set({
          user: session.user,
          profile: profile,
          initialized: true,
          loading: false
        });

        console.log('✅ Auth initialized successfully');
      } else {
        console.log('ℹ️ No session found');
        
        // In production, check for auth state in URL hash (OAuth callback)
        if (typeof window !== 'undefined') {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            console.log('🔄 Found tokens in URL, setting session...');
            try {
              const { data: { session: newSession }, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
              
              if (sessionError) {
                console.error('❌ Failed to set session from URL tokens:', sessionError);
              } else if (newSession?.user) {
                console.log('✅ Session set from URL tokens');
                set({
                  user: newSession.user,
                  profile: null,
                  initialized: true,
                  loading: false
                });
                return;
              }
            } catch (tokenError) {
              console.error('❌ Error processing URL tokens:', tokenError);
            }
          }
        }
        
        set({ user: null, profile: null, initialized: true, loading: false });
      }
    } catch (error) {
      console.error('💥 Auth initialization error:', error);
      set({ user: null, profile: null, initialized: true, loading: false });
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
      
      console.log('🚀 Starting OAuth login with provider:', provider);
      console.log('🌍 Current origin:', window.location.origin);
      
      // Determine the correct redirect URL based on current location
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('🔗 Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      });

      console.log('📤 OAuth response:', { data, error });

      if (error) {
        console.error('❌ OAuth error:', error);
        set({ loading: false });
        toast.error(error.message || `Failed to login with ${provider}`);
        throw error;
      }

      console.log('✅ OAuth initiated successfully, should redirect to Google...');
      // Don't set loading to false here - the redirect will handle it
    } catch (error: any) {
      console.error('💥 Provider login error:', error);
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

  loginWithGoogle: async () => {
    try {
      console.log('🔵 Starting Google OAuth...');
      set({ loading: true });

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      });

      if (error) {
        console.error('❌ Google OAuth error:', error);
        toast.error(`Google sign-in failed: ${error.message}`);
        set({ loading: false });
        return;
      }

      console.log('✅ Google OAuth initiated successfully');
      // Don't set loading to false here - let the auth state change handle it
    } catch (error) {
      console.error('💥 Google OAuth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Google sign-in failed: ${errorMessage}`);
      set({ loading: false });
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

// Don't auto-initialize to prevent conflicts with OAuth flow
// Initialize manually when needed