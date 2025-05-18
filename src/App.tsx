import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

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
import Achievements from './features/gamification/pages/Achievements';
import NotFound from './shared/pages/NotFound';

// Components
import ProtectedRoute from './shared/components/ProtectedRoute';

function App() {
  const { initialized } = useAuthStore();

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <div className="h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/read/:id" element={<ReadingSession />} />
        <Route path="/library" element={<Library />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/achievements" element={<Achievements />} />
      </Route>
      
      {/* Fallback routes */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;