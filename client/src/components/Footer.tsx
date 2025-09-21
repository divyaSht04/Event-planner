import React from 'react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-gray-800 text-white py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0 md:space-x-6">
          <div className="md:w-1/3">
            <h4 className="text-lg font-semibold mb-4">Event Planner</h4>
            <p className="text-gray-400 text-sm">
              Create, manage, and organize unforgettable events with our comprehensive event planning platform.
            </p>
          </div>

          <div>
            <h5 className="text-md font-semibold mb-4">Quick Links</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Event Planner. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;