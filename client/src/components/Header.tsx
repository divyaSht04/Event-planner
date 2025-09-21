import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CustomButton } from './index';
import { useAuth } from '../context';

interface HeaderProps {
  showAuthButtons?: boolean;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  showAuthButtons = true, 
  className = '' 
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className={`bg-white shadow-lg ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Event Planner</h1>
            </Link>
          </div>
          
          {/* Show auth buttons for non-authenticated users */}
          {showAuthButtons && !isAuthenticated && (
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

          {/* Show user menu for authenticated users */}
          {isAuthenticated && user && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user.name}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;