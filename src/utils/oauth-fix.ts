import { supabase } from '../services/supabase';

// Production OAuth Fix - Forces session handling for OAuth callbacks
export const handleProductionOAuth = async () => {
  // Only run in production and if we're on auth callback route
  if (process.env.NODE_ENV !== 'production' || !window.location.pathname.includes('/auth/callback')) {
    return null;
  }

  console.log('🔧 Production OAuth handler activated');
  
  // Wait for page to fully load
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // Try multiple methods to get session in production
    
    // Method 1: Direct session check
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session?.user) {
      console.log('✅ Found session via getSession');
      return session;
    }
    
    // Method 2: Check URL hash for tokens
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    
    if (accessToken && refreshToken) {
      console.log('🔄 Setting session from URL tokens');
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (sessionData?.session && !sessionError) {
        console.log('✅ Session set from URL tokens');
        return sessionData.session;
      }
    }
    
    // Method 3: Force refresh attempt
    console.log('🔄 Attempting session refresh');
    const { data: refreshData } = await supabase.auth.refreshSession();
    
    if (refreshData?.session) {
      console.log('✅ Session found via refresh');
      return refreshData.session;
    }
    
    console.log('❌ No session found via any method');
    return null;
    
  } catch (error) {
    console.error('💥 Production OAuth handler error:', error);
    return null;
  }
};