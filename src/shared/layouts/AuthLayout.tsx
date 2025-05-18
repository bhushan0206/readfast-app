import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { BookOpen } from 'lucide-react';

const AuthLayout: React.FC = () => {
  const { user } = useAuthStore();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <BookOpen className="h-12 w-12 text-primary-500" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-neutral-900">ReadFast</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Improve your reading speed and comprehension
            </p>
          </div>
          
          <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10 border border-neutral-200">
            <Outlet />
          </div>
        </div>
      </div>
      
      <footer className="py-4 text-center text-sm text-neutral-500">
        &copy; {new Date().getFullYear()} ReadFast. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;