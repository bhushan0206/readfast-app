import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  throw new Error('Missing Supabase environment variables');
}

console.log('🔧 Supabase configured:', { url: supabaseUrl, keyPresent: !!supabaseAnonKey });

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Auth service functions
export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, fullName: string) {
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
    return data;
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // Sign in with Google
  async signInWithGoogle() {
    try {
      console.log('🚀 Starting Google OAuth flow...');
      console.log('🔧 Current URL:', window.location.href);
      console.log('🔧 Redirect URL will be:', `${window.location.origin}/auth/callback`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      });
      
      console.log('📋 OAuth response:', { data, error });
      
      if (error) {
        console.error('❌ OAuth setup error:', error);
        throw error;
      }
      
      console.log('✅ OAuth redirect should have started');
      return data;
    } catch (error) {
      console.error('💥 Google OAuth setup failed:', error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    try {
      console.log('🔍 Fetching current session...');
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session fetch error:', error);
        throw error;
      }
      
      console.log('✅ Session fetch successful:', data.session ? 'Has session' : 'No session');
      return data.session;
    } catch (error) {
      console.error('❌ getSession failed:', error);
      throw error;
    }
  },

  // Get current user
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  }
};

// Profile service functions
export const profileService = {
  // Get user profile
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Create or update profile
  async upsertProfile(userId: string, profileData: any) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Utility function to ensure user profile exists
export async function ensureUserProfile(user: any) {
  try {
    // Validate user has required fields
    if (!user?.id || !user?.email) {
      console.error('Invalid user object:', user);
      return null;
    }

    let profile = await profileService.getProfile(user.id);
    
    if (!profile) {
      // Create new profile
      profile = await profileService.upsertProfile(user.id, {
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      });
    }
    
    return profile;
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    return null;
  }
}