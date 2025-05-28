import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { BookOpen } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Header with Theme Toggle */}
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-xl font-bold text-neutral-900 dark:text-white">ReadFast</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <BookOpen className="h-12 w-12 text-primary-500" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-neutral-900 dark:text-white">ReadFast</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Improve your reading speed and comprehension
            </p>
          </div>
          
          <div className="bg-white dark:bg-neutral-800 py-8 px-4 shadow-sm rounded-lg sm:px-10 border border-neutral-200 dark:border-neutral-700">
            {children}
          </div>
        </div>
      </div>
      
      <footer className="py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
        &copy; {new Date().getFullYear()} ReadFast. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;