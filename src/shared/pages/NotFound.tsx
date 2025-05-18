import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Button from '../components/Button';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-primary-500">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-neutral-900">Page Not Found</h2>
        <p className="mt-4 text-lg text-neutral-600">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link to="/">
            <Button leftIcon={<ChevronLeft size={18} />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;