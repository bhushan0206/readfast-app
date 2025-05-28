import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, ensureUserProfile } from '../../../services/supabase';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'sonner';

const SimpleOAuthCallback: React.FC = () => {
  const navigate = useNavigate();

  // THIS IS A CRITICAL LOG - CHECK IF THIS APPEARS
  console.log('🔴🔴🔴 SimpleOAuthCallback COMPONENT RENDERED! 🔴🔴🔴');
  console.log('🔴 Current window.location.href on render:', window.location.href);

  useEffect(() => {
    // THIS IS A CRITICAL LOG - CHECK IF THIS APPEARS
    console.log('🟡🟡🟡 SimpleOAuthCallback useEffect STARTED! 🟡🟡🟡');
    console.log('🟡 Current window.location.href in useEffect:', window.location.href);

    const processOAuth = async () => {
      console.log('🔥 SIMPLE OAuth Callback Started');
      console.log('📍 URL:', window.location.href);
      console.log('⚡ Using SimpleOAuthCallback component');
      
      try {
        // Extract tokens directly from URL
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        
        console.log('🔑 Tokens:', { 
          accessToken: accessToken ? 'FOUND' : 'MISSING',
          refreshToken: refreshToken ? 'FOUND' : 'MISSING'
        });
        
        if (!accessToken) {
          console.error('❌ No access token in URL hash!');
          toast.error('Authentication Error: No access token found in URL.');
          navigate('/login?error=no_access_token');
          return;
        }
        
        // Set session directly
        console.log('⚡ Setting session...');
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });
        
        console.log('📋 Session result:', { 
          session: !!data.session, 
          user: data.session?.user?.email,
          error: error?.message 
        });
        
        if (error || !data.session) {
          console.error('❌ Session failed:', error);
          toast.error('Failed to create session');
          navigate('/login');
          return;
        }
        
        // Create profile
        console.log('👤 Creating profile...');
        const profile = await ensureUserProfile(data.session.user);
        
        // Force update auth store
        console.log('💾 Updating store...');
        useAuthStore.setState({
          user: data.session.user,
          profile: profile,
          initialized: true,
          loading: false
        });
        
        // Success!
        console.log('✅ OAuth SUCCESS!');
        toast.success(`Welcome, ${data.session.user.email}!`);
        
        // Clean redirect
        window.history.replaceState({}, '', '/');
        navigate('/', { replace: true });
        
      } catch (error) {
        console.error('💥 OAuth ERROR:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown OAuth error';
        toast.error(`OAuth Processing Failed: ${errorMessage}`);
        navigate('/login?error=oauth_processing_failed');
      }
    };
    
    // Small delay then process
    const timerId = setTimeout(processOAuth, 100);
    return () => clearTimeout(timerId); // Cleanup timer

  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center font-mono bg-red-50 dark:bg-red-900">
      <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-4">
          CALLBACK PAGE ACTIVE
        </h1>
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-5"></div>
        <h2 className="text-xl mb-2">🔥 Processing OAuth...</h2>
        <p className="text-gray-600 dark:text-gray-300">Check console for details. If you see this for more than a few seconds, something is wrong.</p>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 break-all">
          Current URL: {window.location.href}
        </p>
      </div>
    </div>
  );
};

export default SimpleOAuthCallback;