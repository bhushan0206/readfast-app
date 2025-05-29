// Auth Debug Utilities for Production Issues
export const AuthDebugger = {
  // Log detailed auth state information
  logAuthState: () => {
    console.group('🔍 Auth State Debug');
    console.log('Environment:', import.meta.env.NODE_ENV);
    console.log('Current URL:', window.location.href);
    console.log('Origin:', window.location.origin);
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    
    // Check localStorage for auth tokens
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('auth') || key.includes('supabase') || key.includes('token')
    );
    console.log('Auth-related localStorage keys:', authKeys);
    
    authKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        console.log(`${key}:`, value ? JSON.parse(value) : value);
      } catch (e) {
        console.log(`${key}:`, localStorage.getItem(key));
      }
    });
    
    // Check sessionStorage
    const sessionAuthKeys = Object.keys(sessionStorage).filter(key => 
      key.includes('auth') || key.includes('supabase') || key.includes('token')
    );
    console.log('Auth-related sessionStorage keys:', sessionAuthKeys);
    
    console.groupEnd();
  },

  // Check cookie settings
  logCookieState: () => {
    console.group('🍪 Cookie Debug');
    console.log('All cookies:', document.cookie);
    console.log('Secure context (HTTPS):', window.isSecureContext);
    console.log('SameSite support:', 'cookieStore' in window);
    console.groupEnd();
  },

  // Monitor auth state changes
  monitorAuthChanges: (supabaseClient: any) => {
    console.log('📡 Setting up auth state monitor...');
    
    supabaseClient.auth.onAuthStateChange((event: string, session: any) => {
      console.group(`🔐 Auth State Change: ${event}`);
      console.log('Event:', event);
      console.log('Session exists:', !!session);
      console.log('User ID:', session?.user?.id);
      console.log('Access token exists:', !!session?.access_token);
      console.log('Refresh token exists:', !!session?.refresh_token);
      console.log('Session expires at:', session?.expires_at ? new Date(session.expires_at * 1000) : 'N/A');
      
      if (event === 'SIGNED_OUT') {
        console.log('🚪 User signed out');
      } else if (event === 'SIGNED_IN') {
        console.log('✅ User signed in successfully');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed');
      }
      
      console.groupEnd();
    });
  },

  // Test session persistence
  testSessionPersistence: async (supabaseClient: any) => {
    console.group('🧪 Session Persistence Test');
    
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      console.log('Current session:', session);
      console.log('Session error:', error);
      
      if (session) {
        console.log('✅ Session found');
        console.log('User:', session.user.email);
        console.log('Expires:', new Date(session.expires_at * 1000));
      } else {
        console.log('❌ No session found');
        
        // Check if we have tokens in storage but no active session
        const authData = localStorage.getItem('sb-' + import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
        if (authData) {
          console.log('🔍 Found auth data in localStorage:', JSON.parse(authData));
          console.log('💡 Session might need refresh');
        }
      }
    } catch (error) {
      console.error('❌ Session test failed:', error);
    }
    
    console.groupEnd();
  },
};