import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useNavigationFix = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔧 Navigation fix hook activated');
    console.log('🔍 Current location:', location.pathname + location.search);

    // CRITICAL: Don't interfere with OAuth callback
    if (location.pathname === '/auth/callback' || location.search.includes('code=')) {
      console.log('🔄 OAuth callback detected - skipping navigation fix');
      return;
    }

    // Handle browser back/forward navigation on mobile
    const handlePopState = (event: PopStateEvent) => {
      // CRITICAL: Don't interfere with OAuth callback
      if (window.location.pathname === '/auth/callback' || window.location.search.includes('code=')) {
        console.log('🔄 OAuth in progress - not handling popstate');
        return;
      }
      
      // Check if we're on a valid route
      const validRoutes = [
        '/', '/library', '/profile', '/settings', '/achievements', '/login', '/register',
        '/analytics', '/vocabulary', '/vocabulary/review', '/vocabulary/demo'
      ];
      const isDynamicRoute = location.pathname.startsWith('/read/') || location.pathname.startsWith('/auth/');
      
      if (!validRoutes.includes(location.pathname) && !isDynamicRoute) {
        // If invalid route, redirect to home
        navigate('/', { replace: true });
      }
    };

    // Listen for browser navigation events
    window.addEventListener('popstate', handlePopState);
    
    // Also check current location on mount (but skip for OAuth)
    if (location.pathname !== '/auth/callback' && !location.search.includes('code=')) {
      handlePopState({} as PopStateEvent);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname, location.search, navigate]);

  // Handle mobile browser refresh/reload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Store current path in sessionStorage
      sessionStorage.setItem('lastPath', location.pathname);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location.pathname]);

  // Restore path after refresh
  useEffect(() => {
    // Don't restore path if we're on OAuth callback
    if (location.pathname === '/auth/callback' || location.search.includes('code=')) {
      console.log('🔄 OAuth callback - not restoring last path');
      return;
    }
    
    const lastPath = sessionStorage.getItem('lastPath');
    if (lastPath && lastPath !== location.pathname && lastPath !== '/') {
      sessionStorage.removeItem('lastPath');
      navigate(lastPath, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);
};