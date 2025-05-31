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
      set({ loading: true, error: null });
      console.log('🔐 Starting sign up process...');

      // First, check if user already exists by attempting to sign in
      console.log('🔍 Checking if user already exists...');
      const { data: existingUser, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy-password-to-check-existence'
      });

      // If sign in succeeds or fails with invalid credentials, user exists
      if (existingUser?.user || 
          (signInError && signInError.message.includes('Invalid login credentials'))) {
        console.log('❌ User already exists');
        throw new Error('An account with this email already exists. Please sign in instead.');
      }

      // Also check the profiles table directly
      const { data: profileCheck } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (profileCheck) {
        console.log('❌ Profile already exists for this email');
        throw new Error('An account with this email already exists. Please sign in instead.');
      }

      console.log('✅ Email appears to be available, proceeding with registration...');

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
        console.error('❌ Supabase auth error:', error);
        
        // Handle specific Supabase error codes
        if (error.message.includes('User already registered') || 
            error.message.includes('already been registered') ||
            error.message.includes('email already exists')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 6 characters long.');
        } else if (error.message.includes('signup is disabled')) {
          throw new Error('New registrations are currently disabled. Please contact support.');
        } else {
          throw new Error(error.message || 'Registration failed. Please try again.');
        }
      }

      if (!data.user) {
        throw new Error('Failed to create user account. Please try again.');
      }

      console.log('✅ User created:', data.user.id);

      // Only try to create profile if user was successfully created and confirmed
      if (data.user && data.session) {
        // User is immediately signed in (email confirmation disabled)
        try {
          await ensureUserProfile(data.user, fullName);
          console.log('✅ Profile created/updated successfully');
        } catch (profileError) {
          console.warn('⚠️ Profile creation failed:', profileError);
          // Check if it's a duplicate user issue
          if (profileError instanceof Error && 
              (profileError.message.includes('row-level security') || 
               profileError.message.includes('already exists'))) {
            throw new Error('An account with this email already exists. Please sign in instead.');
          }
          // Don't throw here - user account was created successfully
          // Profile can be created later when they sign in
        }

        // Get the updated user data
        const { data: { user: updatedUser } } = await supabase.auth.getUser();
        const profile = await getUserProfile(updatedUser?.id);

        set({ 
          user: updatedUser, 
          profile,
          initialized: true,
          loading: false 
        });
      } else if (data.user && !data.user.email_confirmed_at) {
        // Email confirmation required - this is likely a duplicate
        console.log('📧 Email confirmation required');
        
        // Check if this user was created just now or already existed
        const createdAt = new Date(data.user.created_at);
        const now = new Date();
        const timeDiff = now.getTime() - createdAt.getTime();
        
        // If user was created more than 10 seconds ago, it's likely a duplicate
        if (timeDiff > 10000) {
          console.log('⚠️ User appears to be a duplicate (created more than 10s ago)');
          throw new Error('An account with this email already exists. Please check your email for a confirmation link or sign in instead.');
        }
        
        set({ 
          user: null, 
          profile: null,
          initialized: true,
          loading: false 
        });
      }

      console.log('✅ Sign up complete');
    } catch (error) {
      console.error('❌ Sign up failed:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Sign up failed',
        loading: false 
      });
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
      console.log('🔄 Auth store: Starting sign out...');
      
      // Try to sign out, but don't fail if there's no session
      try {
        await authService.signOut();
        console.log('✅ Auth service sign out successful');
      } catch (signOutError: any) {
        console.warn('⚠️ Auth service sign out failed, clearing state anyway:', signOutError.message);
        // Continue to clear state even if signOut fails
      }
      
      set({ user: null, profile: null, loading: false });
      toast.success('Signed out successfully!');
      console.log('✅ Auth store: Sign out complete');
    } catch (error: any) {
      console.error('❌ Auth store: Sign out error:', error);
      // Always clear state even on error
      set({ user: null, profile: null, loading: false });
      toast.error('Signed out (with warnings)');
      // Don't re-throw the error to prevent UI issues
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
      console.log('🔄 updateProfile called with:', { updates, user: user?.id, profile: profile?.id });
      
      if (!user?.id) {
        console.error('❌ No authenticated user found');
        throw new Error('No authenticated user');
      }
      
      const updatedProfile = await profileService.upsertProfile(user.id, {
        ...profile,
        ...updates,
      });
      
      set({ profile: updatedProfile });
      toast.success('Profile updated successfully!');
      console.log('✅ Profile updated successfully');
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  },
}));