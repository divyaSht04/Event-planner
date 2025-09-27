import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from '../components';
import { useAuth } from '../context';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showAuthButtons={false} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Welcome to your Dashboard, {user?.name}!
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Your Events</h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-blue-600">Events created</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Upcoming</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-sm text-green-600">Events this month</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Attendees</h3>
              <p className="text-3xl font-bold text-purple-600">0</p>
              <p className="text-sm text-purple-600">Total RSVPs</p>
            </div>
          </div>

          {/* Quick Action */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Action</h2>
            <button 
              onClick={() => navigate('/events/create')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create New Event
            </button>
          </div>

          {/* User Info Section */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{user?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
              </div>
              {user?.phone_number && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{user.phone_number}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DashboardPage;