import React from 'react';
import { Link } from 'react-router-dom';
import { CustomButton } from './index';

interface HeaderProps {
  showAuthButtons?: boolean;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  showAuthButtons = true, 
  className = '' 
}) => {
  return (
    <nav className={`bg-white shadow-lg ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Event Planner</h1>
            </Link>
          </div>
          
          {showAuthButtons && (
            <div className="flex space-x-4">
              <Link to="/auth/login">
                <CustomButton variant="secondary" className="text-sm">
                  Sign In
                </CustomButton>
              </Link>
              <Link to="/auth/signup">
                <CustomButton variant="primary" className="text-sm">
                  Sign Up
                </CustomButton>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;