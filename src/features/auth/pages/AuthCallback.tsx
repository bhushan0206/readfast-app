import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, ensureUserProfile } from '../../../services/supabase';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'sonner';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 OAuth Callback - Current URL:', window.location.href);
        setStatus('Processing OAuth response...');
        
        // Small delay to ensure app is fully loaded
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Handle port redirect if needed
        if (window.location.port === '3000' && window.location.protocol === 'http:') {
          console.log('🔄 Redirecting from port 3000 to 5173...');
          const newUrl = window.location.href.replace('localhost:3000', 'localhost:5173');
          window.location.replace(newUrl);
          return;
        }
        
        // Extract tokens from URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log('🔑 Found tokens:', { 
          accessToken: accessToken ? 'present' : 'missing',
          refreshToken: refreshToken ? 'present' : 'missing'
        });
        
        if (!accessToken) {
          console.error('❌ No access token found in URL');
          toast.error('Authentication failed - no access token');
          navigate('/login');
          return;
        }
        
        setStatus('Establishing session...');
        
        // Use Supabase's setSession to manually set the session from the tokens
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });
        
        console.log('📋 Set session result:', { sessionData, sessionError });
        
        if (sessionError || !sessionData.session) {
          console.error('❌ Failed to set session:', sessionError);
          toast.error('Authentication failed - could not establish session');
          navigate('/login');
          return;
        }
        
        const user = sessionData.session.user;
        console.log('✅ Session established for user:', user.email);
        setStatus('Creating user profile...');
        
        // Ensure user profile exists
        const profile = await ensureUserProfile(user);
        console.log('👤 Profile result:', profile);
        
        if (!profile) {
          console.error('❌ Failed to create user profile');
          toast.error('Failed to create user profile');
          navigate('/login');
          return;
        }
        
        console.log('✅ Profile created/updated');
        setStatus('Completing sign-in...');
        
        // Manually update the auth store with the session data
        useAuthStore.setState({
          user: user,
          profile: profile,
          initialized: true,
          loading: false
        });
        
        console.log('✅ Auth store updated directly');
        
        // Show success message
        const userName = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.email;
        
        toast.success(`Welcome back, ${userName}!`);
        
        // Clean URL and redirect
        console.log('🚀 Redirecting to dashboard...');
        window.history.replaceState({}, document.title, '/');
        navigate('/', { replace: true });
        
      } catch (error) {
        console.error('💥 OAuth callback error:', error);
        setStatus('Authentication failed');
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Authentication failed: ${errorMessage}`);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 border border-neutral-200 dark:border-neutral-700">
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              Completing Sign In
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              {status}
            </p>
          </div>
          
          <div className="space-y-3 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Google authentication successful</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Processing your account...</span>
            </div>
          </div>
          
          {/* Debug button for development */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={async () => {
                console.log('🧪 Manual session test...');
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');
                
                if (accessToken) {
                  try {
                    const { data, error } = await supabase.auth.setSession({
                      access_token: accessToken,
                      refresh_token: refreshToken || ''
                    });
                    console.log('Manual session result:', { data, error });
                    
                    if (data.session) {
                      toast.success('Manual session set successfully!');
                      useAuthStore.setState({
                        user: data.session.user,
                        profile: null,
                        initialized: true,
                        loading: false
                      });
                      navigate('/');
                    }
                  } catch (err) {
                    console.error('Manual session error:', err);
                  }
                }
              }}
              className="mt-4 px-4 py-2 text-xs bg-primary-500 text-white rounded hover:bg-primary-600"
            >
              🧪 Manual Session Test
            </button>
          )}
        </div>
        
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4">
          This usually takes just a few seconds
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;