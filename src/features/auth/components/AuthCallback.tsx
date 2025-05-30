import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, ensureUserProfile } from '../../../services/auth';
import { useAuthStore } from '../../../stores/authStore';
import { toast } from 'sonner';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing authentication...');

  console.log('🚀 AuthCallback component mounted');
  console.log('🔍 Current URL:', window.location.href);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Processing OAuth callback...');
        setStatus('Verifying authentication...');
        console.log('🔍 Current URL:', window.location.href);
        
        // Check if we have a code parameter
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        console.log('🔍 URL parameters:', { code: code?.substring(0, 10) + '...', error });
        
        if (error) {
          console.error('❌ OAuth error in URL:', error);
          navigate('/login?error=oauth_error');
          return;
        }
        
        if (!code) {
          console.error('❌ No OAuth code found in URL');
          navigate('/login?error=no_code');
          return;
        }
        
        console.log('✅ OAuth code found:', code.substring(0, 10) + '...');
        setStatus('Processing OAuth callback...');
        
        // Wait for Supabase to process the OAuth callback automatically via auth state listener
        console.log('🔄 Waiting for Supabase auth state to update...');
        
        let attempts = 0;
        const maxAttempts = 15; // Increased attempts
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('❌ Session error after OAuth:', sessionError);
            navigate('/login?error=session_error');
            return;
          }
          
          if (session?.user) {
            console.log('✅ OAuth session detected for:', session.user.email);
            setStatus('Setting up your account...');
            
            // Continue with profile setup...
            const user = session.user;
            break;
          }
          
          attempts++;
          console.log(`🔄 Attempt ${attempts}/${maxAttempts}: Waiting for session...`);
          setStatus(`Waiting for authentication... (${attempts}/${maxAttempts})`);
        }
        
        if (attempts >= maxAttempts) {
          console.error('❌ OAuth session not found after waiting');
          navigate('/login?error=session_timeout');
          return;
        }
        
        // Get the session again to ensure we have it
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          console.error('❌ No session after OAuth callback');
          navigate('/login?error=no_session');
          return;
        }
        
        const user = session.user;
        console.log('✅ OAuth session established for:', user.email);
        setStatus('Setting up your account...');
        
        // Create/update user profile
        console.log('👤 Setting up user profile...');
        const profile = await ensureUserProfile(user);
        
        setStatus('Completing sign in...');
        
        // Update auth store directly
        useAuthStore.setState({
          user,
          profile,
          loading: false,
          initialized: true,
        });
        
        console.log('✅ Auth store updated with OAuth user');
        console.log('✅ OAuth callback complete, redirecting to dashboard');
        
        // Clear the URL parameters and redirect
        navigate('/', { replace: true });

      } catch (error: any) {
        console.error('💥 OAuth callback processing error:', error);
        setStatus('Authentication failed');
        navigate('/login?error=callback_failed');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-md w-full text-center p-6">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-8">
          {/* Loading Spinner */}
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
          
          {/* Status Text */}
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            Completing Sign In
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6">
            {status}
          </p>
          
          {/* Progress Indicators */}
          <div className="space-y-3 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Authentication verified</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Setting up your account...</span>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-neutral-400 mt-4">
          This usually takes just a few seconds
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;