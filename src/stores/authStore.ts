import { create } from 'zustand';
import { supabase, authService, profileService, ensureUserProfile } from '../services/auth';
import { toast } from 'sonner';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  [key: string]: any;
}

interface AuthState {
  user: SupabaseUser | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  initialized: false,

  signUp: async (email: string, password: string, fullName: string) => {
    try {
      set({ loading: true });
      console.log('📝 Attempting to sign up:', email);
      
      const { user } = await authService.signUp(email, password, fullName);
      console.log('Sign up result:', user ? `Success for ${user.email}` : 'No user returned');
      
      if (user) {
        // Create profile for new user
        console.log('👤 Creating user profile...');
        const profile = await ensureUserProfile(user);
        
        if (profile) {
          console.log('✅ Profile created successfully');
        } else {
          console.warn('⚠️ Profile creation failed');
        }
        
        set({ user, profile, loading: false });
        toast.success('Account created successfully! Please check your email to verify your account.');
        console.log('✅ Sign up complete');
      } else {
        console.warn('⚠️ Sign up succeeded but no user returned');
        set({ loading: false });
      }
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      set({ loading: false });
      toast.error(error.message || 'Failed to create account');
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true });
      console.log('🔐 Attempting to sign in:', email);
      
      const { user } = await authService.signIn(email, password);
      
      if (user) {
        console.log('✅ Sign in successful for:', user.email);
        const profile = await ensureUserProfile(user);
        
        set({ user, profile, loading: false });
        toast.success('Signed in successfully!');
        console.log('✅ Auth store updated after sign in');
      }
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      set({ loading: false });
      toast.error(error.message || 'Failed to sign in');
      throw error;
    }
  },

  signInWithGoogle: async () => {
    try {
      console.log('🔵 Starting Google OAuth...');
      // Don't set loading here - let the auth state listener handle it
      
      await authService.signInWithGoogle();
      
      // The OAuth redirect will bring us back to /auth/callback
      // The session will be handled by the auth state listener in App.tsx
      console.log('✅ Google OAuth redirect initiated');
    } catch (error: any) {
      console.error('❌ Google OAuth error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      
      await authService.signOut();
      
      set({ user: null, profile: null, loading: false });
      toast.success('Signed out successfully!');
    } catch (error: any) {
      set({ loading: false });
      toast.error(error.message || 'Failed to sign out');
      throw error;
    }
  },

  initialize: async () => {
    try {
      console.log('🔄 Initializing auth...');
      set({ loading: true });
      
      // Use direct Supabase call instead of auth service to avoid potential issues
      console.log('🔧 Getting session directly from Supabase...');
      
      // Get session with timeout
      const { data: { session }, error } = await Promise.race([
        supabase.auth.getSession(),
        new Promise<{ data: { session: null }, error: Error }>((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000) // Increased to 10 seconds
        )
      ]);
      
      if (error) {
        console.error('❌ Session error:', error);
        throw error;
      }
      
      console.log('📋 Session result:', session ? `User: ${session.user?.email}` : 'No session');
      
      if (session?.user) {
        console.log('✅ Session found for:', session.user.email);
        
        // Try to get/create profile
        console.log('👤 Loading user profile...');
        try {
          const profile = await ensureUserProfile(session.user);
          
          if (profile) {
            console.log('✅ Profile loaded successfully:', profile.full_name || profile.email);
            set({ 
              user: session.user, 
              profile, 
              initialized: true, 
              loading: false 
            });
          } else {
            console.warn('⚠️ Failed to load profile, but user is authenticated');
            set({ 
              user: session.user, 
              profile: null, 
              initialized: true, 
              loading: false 
            });
          }
        } catch (profileError) {
          console.error('❌ Profile error:', profileError);
          // Still set user even if profile fails
          set({ 
            user: session.user, 
            profile: null, 
            initialized: true, 
            loading: false 
          });
        }
        
        console.log('✅ Auth initialized successfully');
      } else {
        console.log('ℹ️ No session found - user needs to sign in');
        set({ 
          user: null, 
          profile: null, 
          initialized: true, 
          loading: false 
        });
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Force initialization complete even on error
      set({ 
        user: null, 
        profile: null, 
        initialized: true, 
        loading: false 
      });
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    try {
      const { user, profile } = get();
      if (!user?.id) throw new Error('No authenticated user');
      
      const updatedProfile = await profileService.upsertProfile(user.id, {
        ...profile,
        ...updates,
      });
      
      set({ profile: updatedProfile });
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  },
}));