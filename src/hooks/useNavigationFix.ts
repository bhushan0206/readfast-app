import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useNavigationFix = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle browser back/forward navigation on mobile
    const handlePopState = (event: PopStateEvent) => {
      // Check if we're on a valid route
      const validRoutes = ['/', '/library', '/profile', '/settings', '/achievements', '/login', '/register'];
      const isDynamicRoute = location.pathname.startsWith('/read/') || location.pathname.startsWith('/auth/');
      
      if (!validRoutes.includes(location.pathname) && !isDynamicRoute) {
        // If invalid route, redirect to home
        navigate('/', { replace: true });
      }
    };

    // Listen for browser navigation events
    window.addEventListener('popstate', handlePopState);
    
    // Also check current location on mount
    handlePopState({} as PopStateEvent);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname, navigate]);

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
    const lastPath = sessionStorage.getItem('lastPath');
    if (lastPath && lastPath !== location.pathname && lastPath !== '/') {
      sessionStorage.removeItem('lastPath');
      navigate(lastPath, { replace: true });
    }
  }, []);
};