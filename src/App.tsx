import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { useNavigationFix } from './hooks/useNavigationFix';
import { supabase } from './services/supabase';

// Layouts
import MainLayout from './shared/layouts/MainLayout';
import AuthLayout from './shared/layouts/AuthLayout';

// Pages
import Dashboard from './features/dashboard/pages/Dashboard';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import ReadingSession from './features/reading/pages/ReadingSession';
import Library from './features/library/pages/Library';
import Profile from './features/profile/pages/Profile';
import Settings from './features/profile/pages/Settings';
import AdminPage from './features/admin/pages/AdminPage';
import Achievements from './features/gamification/pages/Achievements';
import Analytics from './features/analytics/pages/Analytics';
import VocabularyBuilder from './features/vocabulary/pages/VocabularyBuilder';
import VocabularyReview from './features/vocabulary/pages/VocabularyReview';
import VocabularyDemo from './features/vocabulary/pages/VocabularyDemo';
import NotFound from './shared/pages/NotFound';

// Components
import ProtectedRoute from './shared/components/ProtectedRoute';
import ErrorBoundary from './shared/components/ErrorBoundary';
import AuthDebug from './shared/components/AuthDebug';

function App() {
  const { initialized, initializeAuth } = useAuthStore();
  const { theme } = useThemeStore();
  
  // Fix mobile navigation issues
  useNavigationFix();

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Initialize auth on app load
  React.useEffect(() => {
    const initAuth = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error('💥 Failed to initialize auth:', error);
        // Force set initialized to true if initialization fails
        useAuthStore.setState({ initialized: true, loading: false });
      }
    };

    initAuth();

    // Failsafe: Force initialization after 5 seconds if still loading
    const timeout = setTimeout(() => {
      const { initialized, loading } = useAuthStore.getState();
      if (!initialized && loading) {
        console.warn('⚠️ Auth initialization timeout, forcing initialized state');
        useAuthStore.setState({ initialized: true, loading: false });
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  // Listen for auth state changes
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await initializeAuth();
        } else if (event === 'SIGNED_OUT') {
          useAuthStore.setState({ 
            user: null, 
            profile: null, 
            initialized: true, 
            loading: false 
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth]);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <div className="animate-pulse">
          <div className="h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ErrorBoundary>
        {/* Dynamic Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100/30 to-secondary-100/30 dark:from-primary-900/30 dark:to-secondary-900/30 animate-gradient" />
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/5076531/pexels-photo-5076531.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center opacity-5 dark:opacity-10" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors"
          >
            <Routes>
              {/* Debug Route */}
              <Route path="/debug" element={<div>Debug Route Working!</div>} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
              <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
              
              {/* Main App Routes - All use the same pattern */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/read/:id" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ReadingSession />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/library" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Library />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Analytics />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/vocabulary" element={
                <ProtectedRoute>
                  <MainLayout>
                    <VocabularyBuilder />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/vocabulary/review" element={
                <ProtectedRoute>
                  <MainLayout>
                    <VocabularyReview />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/vocabulary/demo" element={
                <ProtectedRoute>
                  <MainLayout>
                    <VocabularyDemo />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Settings />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/achievements" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Achievements />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              {import.meta.env.DEV && (
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AdminPage />
                    </MainLayout>
                  </ProtectedRoute>
                } />
              )}
              
              {/* Fallback routes */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
        
        {/* Debug component for development */}
        <AuthDebug />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;