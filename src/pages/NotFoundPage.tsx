import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-card sm:rounded-lg sm:px-10 text-center">
          <img className="h-16 w-auto mx-auto mb-6" src="/favicon.svg" alt="MediIndia" />
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">404</h2>
          <p className="text-xl font-medium text-gray-700 mb-6">Page Not Found</p>
          
          <p className="text-gray-500 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <Link to="/">
            <Button
              variant="primary"
              leftIcon={<Home size={18} />}
              className="w-full"
            >
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;