import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Layout Components
import MainLayout from './shared/layouts/MainLayout';

// Page Components
import Dashboard from './features/dashboard/pages/Dashboard';
import ReadingSession from './features/reading/pages/ReadingSession';
import Library from './features/library/pages/Library';
import Analytics from './features/analytics/pages/Analytics';
import VocabularyBuilder from './features/vocabulary/pages/VocabularyBuilder';
import VocabularyReview from './features/vocabulary/pages/VocabularyReview';
import VocabularyDemo from './features/vocabulary/pages/VocabularyDemo';
import Profile from './features/profile/pages/Profile';
import Settings from './features/profile/pages/Settings';
import Achievements from './features/gamification/pages/Achievements';
import AdminPage from './features/admin/pages/AdminPage';
import NotFound from './shared/pages/NotFound';

// Context & State
import { ThemeProvider } from './contexts/ThemeContext';
import { useThemeStore } from './store/themeStore';

// New Clean Auth Components
import Login from './features/auth/pages/Login';
import ProtectedRoute from './features/auth/components/ProtectedRoute'; 
import AuthProvider from './features/auth/providers/AuthProvider';

// Shared Components
import ErrorBoundary from './shared/components/ErrorBoundary';

function App() {
  const { theme } = useThemeStore();

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <AuthProvider>
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
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/auth/callback" element={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      <p className="text-neutral-600 dark:text-neutral-400">Completing sign in...</p>
                    </div>
                  </div>
                } />
                
                {/* Main App Routes */}
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
        </ErrorBoundary>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;