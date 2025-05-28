import { createClient } from '@supabase/supabase-js';
import type { Provider } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { config } from '../config/env';

export const supabase = createClient<Database>(config.supabase.url, config.supabase.anonKey);

export const signInWithProvider = async (provider: Provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) {
    console.error(`${provider} login error:`, error);
    throw error;
  }
  
  return data;
};

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
  
  return data;
};

export const getUserReadingStats = async (userId: string) => {
  const { data, error } = await supabase
    .from('reading_stats')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
    console.error('Error fetching reading stats:', error);
    throw error;
  }
  
  return data;
};

export const updateReadingStats = async (userId: string, updates: any) => {
  // Ensure all numeric values are integers for database compatibility
  const sanitizedUpdates = {
    ...updates,
    total_words_read: updates.total_words_read ? Math.round(updates.total_words_read) : updates.total_words_read,
    words_read: updates.words_read ? Math.round(updates.words_read) : updates.words_read,
    average_wpm: updates.average_wpm ? Math.round(updates.average_wpm) : updates.average_wpm,
    sessions_completed: updates.sessions_completed ? Math.round(updates.sessions_completed) : updates.sessions_completed
  };

  const { data: existingStats } = await supabase
    .from('reading_stats')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (!existingStats) {
    // Create new stats record
    const { data, error } = await supabase
      .from('reading_stats')
      .insert({ user_id: userId, ...sanitizedUpdates })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating reading stats:', error);
      throw error;
    }
    
    return data;
  } else {
    // Update existing stats
    const { data, error } = await supabase
      .from('reading_stats')
      .update(sanitizedUpdates)
      .eq('user_id', userId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating reading stats:', error);
      throw error;
    }
    
    return data;
  }
};

export const getTexts = async () => {
  const { data, error } = await supabase
    .from('texts')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching texts:', error);
    throw error;
  }
  
  return data;
};

export const getTextById = async (id: string) => {
  const { data, error } = await supabase
    .from('texts')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching text:', error);
    throw error;
  }
  
  return data;
};

export const saveCustomText = async (userId: string, title: string, content: string) => {
  const { data, error } = await supabase
    .from('texts')
    .insert({
      user_id: userId,
      title,
      content,
      is_custom: true
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error saving custom text:', error);
    throw error;
  }
  
  return data;
};

export const getUserAchievements = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievements (*)
    `)
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error fetching user achievements:', error);
    throw error;
  }
  
  return data;
};

export const saveReadingSession = async (sessionData: any) => {
  const { data, error } = await supabase
    .from('reading_sessions')
    .insert(sessionData)
    .select()
    .single();
    
  if (error) {
    console.error('Error saving reading session:', error);
    throw error;
  }
  
  return data;
};

export const getReadingSessions = async (userId: string) => {
  const { data, error } = await supabase
    .from('reading_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching reading sessions:', error);
    throw error;
  }
  
  return data;
};

// Account linking functions
export const linkAccountIfExists = async (user: any) => {
  try {
    // Check if there's an existing user with the same email but different provider
    const { data: existingProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', user.email)
      .neq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking for existing profile:', error);
      return null;
    }

    if (existingProfile) {
      console.log('Found existing profile for email:', user.email);
      
      // Update the existing profile with the new OAuth provider info
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          // Keep the original profile data but add OAuth info
          oauth_provider: user.app_metadata.provider,
          social_id: user.id, // Use existing social_id field
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProfile.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating profile with OAuth info:', updateError);
        return null;
      }

      // Now we need to handle the auth user merge
      // Since we can't directly merge users in Supabase, we'll update the profile
      // to point to the new OAuth user but keep the original data
      const { error: profileLinkError } = await supabase
        .from('profiles')
        .update({
          id: user.id, // Link to new OAuth user
          email: user.email,
          full_name: existingProfile.full_name || user.user_metadata?.full_name,
          avatar_url: user.user_metadata?.avatar_url || existingProfile.avatar_url,
          reading_level: existingProfile.reading_level,
          reading_speed: existingProfile.reading_speed,
          oauth_provider: user.app_metadata.provider,
          social_id: user.id, // Use existing social_id field
          created_at: existingProfile.created_at, // Keep original creation date
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProfile.id);

      if (profileLinkError) {
        console.error('Error linking profile:', profileLinkError);
        return null;
      }

      console.log('Successfully linked OAuth account with existing profile');
      return updatedProfile;
    }

    return null;
  } catch (error) {
    console.error('Error in linkAccountIfExists:', error);
    return null;
  }
};

export const ensureUserProfile = async (user: any) => {
  try {
    // First, try to link with existing account
    await linkAccountIfExists(user);

    // Check if profile exists for this user
    const { data: existingProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (!existingProfile) {
      // Create new profile for OAuth user
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          oauth_provider: user.app_metadata?.provider || null,
          social_id: user.id, // Use existing social_id field
          reading_level: 'intermediate',
          reading_speed: 250,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return null;
      }

      console.log('Created new profile for OAuth user');
      return newProfile;
    }

    return existingProfile;
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
    return null;
  }
};