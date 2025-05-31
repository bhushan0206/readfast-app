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
    console.log('🔍 Checking if profile exists for user:', user.id);
    
    // First try to get existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // If profile exists, return it
    if (existingProfile) {
      console.log('✅ Profile already exists');
      return existingProfile;
    }

    // If there was a 406 error, it might indicate user already exists
    if (fetchError && fetchError.message.includes('406')) {
      console.warn('⚠️ Profile fetch returned 406 - user may already exist');
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    // If there was an error other than "not found", log it but continue
    if (fetchError && !fetchError.message.includes('No rows')) {
      console.warn('⚠️ Error fetching profile:', fetchError);
    }

    // Create new profile
    console.log('📝 Creating new profile...');
    const newProfile = {
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      email: user.email!,
      avatar_url: user.user_metadata?.avatar_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating profile:', createError);
      
      // Handle specific RLS errors
      if (createError.message.includes('row-level security') || createError.code === '42501') {
        throw new Error('An account with this email already exists. Please sign in instead.');
      } else if (createError.message.includes('duplicate key') || createError.code === '23505') {
        console.log('⚠️ Profile already exists (race condition), fetching existing...');
        // Try to fetch the existing profile again
        const { data: retryProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        return retryProfile;
      } else {
        throw new Error(`Failed to create user profile: ${createError.message}`);
      }
    }

    console.log('✅ Profile created successfully');
    return createdProfile;
  } catch (error) {
    console.error('❌ Error ensuring user profile:', error);
    throw error;
  }
};