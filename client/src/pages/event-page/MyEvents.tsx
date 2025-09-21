import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from '../../components';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import { eventService } from '../../services/events';
import type { Event } from '../../services/events';

const MyEvents: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private' | 'upcoming' | 'past'>('all');

  const loadMyEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getMyEvents();
      setEvents(response.events);
      setFilteredEvents(response.events);
    } catch (err: any) {
      console.error('Error loading my events:', err);
      setError('Failed to load your events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyEvents();
  }, []);

  // Filter events based on search term and filter type
  useEffect(() => {
    let filtered = events;

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term) ||
        event.location.toLowerCase().includes(term)
      );
    }

    // Filter by type
    const now = new Date();
    switch (filterType) {
      case 'public':
        filtered = filtered.filter(event => event.event_type === 'public');
        break;
      case 'private':
        filtered = filtered.filter(event => event.event_type === 'private');
        break;
      case 'upcoming':
        filtered = filtered.filter(event => new Date(event.event_date) > now);
        break;
      case 'past':
        filtered = filtered.filter(event => new Date(event.event_date) <= now);
        break;
      default:
        break;
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, filterType]);

  const handleCreateEvent = () => {
    navigate('/events/create');
  };

  const handleEditEvent = (eventId: number) => {
    navigate(`/events/edit/${eventId}`);
  };

  const handleViewEvent = (eventId: number) => {
    navigate(`/events/${eventId}`);
  };

  const handleDeleteEvent = async (event: Event) => {
    if (!window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      return;
    }

    try {
      await eventService.deleteEvent(event.id!);
      // Remove the deleted event from the list
      setEvents(prev => prev.filter(e => e.id !== event.id));
    } catch (err: any) {
      console.error('Error deleting event:', err);
      alert('Failed to delete event. Please try again.');
    }
  };

  const getEventStats = () => {
    const now = new Date();
    return {
      total: events.length,
      upcoming: events.filter(event => new Date(event.event_date) > now).length,
      public: events.filter(event => event.event_type === 'public').length,
      private: events.filter(event => event.event_type === 'private').length,
    };
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isUpcoming = date > now;
    
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUpcoming
    };
  };

  if (error && events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <div className="text-red-600 text-lg font-medium mb-2">
              Error Loading Your Events
            </div>
            <p className="text-red-500 mb-4">{error}</p>
            <CustomButton
              variant="primary"
              onClick={loadMyEvents}
            >
              Try Again
            </CustomButton>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const stats = getEventStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Events</h1>
            <p className="text-gray-600">
              Manage your created events
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <CustomButton
              variant="primary"
              onClick={handleCreateEvent}
            >
              Create Event
            </CustomButton>
          </div>
        </div>

        {/* Quick Stats */}
        {!loading && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
              <div className="text-gray-600">Total Events</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-green-600">
                {stats.upcoming}
              </div>
              <div className="text-gray-600">Upcoming</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-purple-600">
                {stats.public}
              </div>
              <div className="text-gray-600">Public Events</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-orange-600">
                {stats.private}
              </div>
              <div className="text-gray-600">Private Events</div>
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        {!loading && events.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <CustomInput
                  type="text"
                  placeholder="Search your events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="sm:w-48">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Events</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past Events</option>
                  <option value="public">Public Events</option>
                  <option value="private">Private Events</option>
                </select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-3 text-sm text-gray-600">
              {searchTerm || filterType !== 'all' ? (
                <span>
                  Showing {filteredEvents.length} of {events.length} events
                  {searchTerm && ` matching "${searchTerm}"`}
                </span>
              ) : (
                <span>Showing {events.length} events</span>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Events List */}
        {!loading && (
          <>
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                {events.length === 0 ? (
                  <div>
                    <div className="text-gray-500 text-xl mb-4">You haven't created any events yet</div>
                    <p className="text-gray-400 mb-6">
                      Start by creating your first event. You can make it public for everyone to see or keep it private for your own planning.
                    </p>
                    <CustomButton
                      variant="primary"
                      onClick={handleCreateEvent}
                    >
                      Create Your First Event
                    </CustomButton>
                  </div>
                ) : (
                  <div>
                    <div className="text-gray-500 text-lg mb-2">
                      No events match your criteria
                    </div>
                    <div className="text-gray-400">
                      Try adjusting your search or filter settings
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => {
                  const { date, time, isUpcoming } = formatEventDate(event.event_date);
                  return (
                    <div 
                      key={event.id} 
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 
                              className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                              onClick={() => handleViewEvent(event.id!)}
                            >
                              {event.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              event.event_type === 'public' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {event.event_type}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              isUpcoming 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {isUpcoming ? 'upcoming' : 'past'}
                            </span>
                          </div>
                          
                          {event.description && (
                            <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                          )}
                          
                          <div className="space-y-1 text-sm text-gray-500">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {date} at {time}
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {event.location}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4 sm:mt-0 sm:ml-6">
                          <CustomButton
                            variant="secondary"
                            onClick={() => handleViewEvent(event.id!)}
                          >
                            View
                          </CustomButton>
                          <CustomButton
                            variant="secondary"
                            onClick={() => handleEditEvent(event.id!)}
                          >
                            Edit
                          </CustomButton>
                          <CustomButton
                            variant="danger"
                            onClick={() => handleDeleteEvent(event)}
                          >
                            Delete
                          </CustomButton>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default MyEvents;