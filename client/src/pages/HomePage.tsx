import React from 'react';
import { Link } from 'react-router-dom';
import { CustomButton, Header, Footer } from '../components';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <Header />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-6xl">
            Plan Amazing Events
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Create, manage, and organize unforgettable events with our comprehensive event planning platform. 
            From birthdays to conferences, we've got you covered.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link to="/auth/signup">
              <CustomButton variant="primary" className="text-lg px-8 py-3">
                Get Started Free
              </CustomButton>
            </Link>
            <CustomButton variant="secondary" className="text-lg px-8 py-3">
              Learn More
            </CustomButton>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-12">
              Everything You Need to Plan Events
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Event Creation</h4>
              <p className="text-gray-600">
                Easily create events with detailed information including date, time, location, and descriptions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Tags & Categories</h4>
              <p className="text-gray-600">
                Organize your events with custom tags and categories for easy filtering and management.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">RSVP Management</h4>
              <p className="text-gray-600">
                Track attendees with built-in RSVP system supporting Yes/No/Maybe responses.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Types Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900">
              Perfect for Any Event Type
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              From intimate gatherings to large-scale conferences
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Birthdays', emoji: '🎂' },
              { name: 'Weddings', emoji: '💒' },
              { name: 'Conferences', emoji: '🏢' },
              { name: 'Workshops', emoji: '🎓' },
              { name: 'Parties', emoji: '🎉' },
              { name: 'Meetings', emoji: '📝' },
              { name: 'Festivals', emoji: '🎪' },
              { name: 'Sports', emoji: '⚽' },
            ].map((eventType) => (
              <div key={eventType.name} className="bg-white p-6 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-2">{eventType.emoji}</div>
                <h4 className="font-semibold text-gray-900">{eventType.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Start Planning?
          </h3>
          <p className="text-xl text-indigo-200 mb-8">
            Join thousands of event planners who trust our platform for their events.
          </p>
          <Link to="/auth/signup">
            <CustomButton variant="secondary" className="text-lg px-8 py-3 bg-white text-indigo-600 hover:bg-gray-100">
              Create Your First Event
            </CustomButton>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;