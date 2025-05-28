import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, ensureUserProfile } from '../../../services/supabase';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'sonner';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast.error('Authentication failed');
          navigate('/login');
          return;
        }

        if (data.session && data.session.user) {
          // Handle OAuth user profile creation/linking
          const profile = await ensureUserProfile(data.session.user);
          
          if (profile) {
            // Re-initialize auth to get the updated user and profile
            await initializeAuth();
            toast.success('Successfully signed in with Google');
            navigate('/');
          } else {
            console.error('Failed to create/link user profile');
            toast.error('Failed to complete sign in');
            navigate('/login');
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        toast.error('Authentication failed');
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, initializeAuth]);

  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      <p className="text-neutral-600 dark:text-neutral-400">Completing sign in...</p>
    </div>
  );
};

export default AuthCallback;