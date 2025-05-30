// DEPRECATED - Use /services/auth.ts instead
// This file is kept for compatibility with other features

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { config } from '../config/env';

export const supabase = createClient<Database>(config.supabase.url, config.supabase.anonKey);

// Re-export from new auth service for compatibility
export { ensureUserProfile } from './auth';

// Keep existing functions for compatibility with other parts of the app
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
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching reading stats:', error);
    throw error;
  }
  
  return data;
};

export const updateReadingStats = async (userId: string, updates: any) => {
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