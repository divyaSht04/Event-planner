import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header, Footer } from '../components';
import CustomButton from '../components/CustomButton';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-200">404</h1>
          </div>
          
          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or the URL might be incorrect.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-4">
            <CustomButton
              variant="primary"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Go to Homepage
            </CustomButton>
            
            <CustomButton
              variant="secondary"
              onClick={() => navigate(-1)}
              className="w-full"
            >
              Go Back
            </CustomButton>
          </div>
          
          {/* Quick Links */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">You might be looking for:</p>
            <div className="space-y-2">
              <Link
                to="/events"
                className="block text-blue-600 hover:text-blue-800 text-sm transition-colors"
              >
                Browse Public Events
              </Link>
              <Link
                to="/auth/login"
                className="block text-blue-600 hover:text-blue-800 text-sm transition-colors"
              >
                Sign In to Your Account
              </Link>
              <Link
                to="/auth/signup"
                className="block text-blue-600 hover:text-blue-800 text-sm transition-colors"
              >
                Create New Account
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotFound;