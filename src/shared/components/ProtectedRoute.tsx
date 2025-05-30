import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, initialized, loading } = useAuthStore();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute check:', { 
    user: user?.email || 'none', 
    initialized, 
    loading,
    currentPath: location.pathname,
    hasOAuthCode: window.location.search.includes('code=')
  });

  // Don't redirect if we're on OAuth callback with code - let it process first
  if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
    console.log('🔄 OAuth callback detected in ProtectedRoute - allowing processing');
    return <>{children}</>;
  }

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('🚫 ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('✅ ProtectedRoute: User authenticated, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;