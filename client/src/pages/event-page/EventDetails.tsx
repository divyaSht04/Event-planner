import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Header, Footer } from '../../components';
import CustomButton from '../../components/CustomButton';
import { eventService } from '../../services/events';
import { useAuth } from '../../context';
import type { Event } from '../../services/events';

const EventDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) {
        setError('Event ID is required');
        setLoading(false);
        return;
      }

      try {
        const eventData = await eventService.getEventById(parseInt(id));
        setEvent(eventData);
      } catch (err: any) {
        console.error('Error loading event:', err);
        setError(err.message || 'Event not found');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleEdit = () => {
    if (event) {
      navigate(`/events/edit/${event.id}`);
    }
  };

  const handleDelete = async () => {
    if (!event || !window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      return;
    }

    try {
      await eventService.deleteEvent(event.id!);
      toast.success('Event deleted successfully!');
      navigate('/events/my');
    } catch (err: any) {
      console.error('Error deleting event:', err);
      toast.error('Failed to delete event. Please try again.');
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isUpcoming = date > now;
    
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUpcoming,
      isPast: date < now
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
            <div className="h-24 bg-gray-200 rounded mb-6"></div>
            <div className="flex gap-4">
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <div className="text-red-600 text-lg font-medium mb-2">
              {error || 'Event not found'}
            </div>
            <p className="text-red-500 mb-4">
              The event you're looking for doesn't exist or may have been removed.
            </p>
            <CustomButton
              variant="primary"
              onClick={() => navigate('/events')}
            >
              Back to Events
            </CustomButton>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { date, time, isUpcoming } = formatEventDate(event.event_date);
  const isOwner = user && event.created_by === user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <CustomButton
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </CustomButton>
        </div>

        {/* Event Details Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Event Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{event.title}</h1>
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    event.event_type === 'public' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-purple-500 text-white'
                  }`}>
                    {event.event_type === 'public' ? 'Public Event' : 'Private Event'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-blue-100">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isUpcoming 
                      ? 'bg-green-400 text-green-900' 
                      : 'bg-gray-400 text-gray-900'
                  }`}>
                    {isUpcoming ? 'Upcoming' : 'Past Event'}
                  </span>
                </div>
              </div>
              
              {/* Action Buttons */}
              {isOwner && (
                <div className="flex gap-3 mt-4 sm:mt-0">
                  <CustomButton
                    variant="secondary"
                    onClick={handleEdit}
                    className="bg-white text-blue-600 hover:bg-gray-50"
                  >
                    Edit Event
                  </CustomButton>
                  <CustomButton
                    variant="danger"
                    onClick={handleDelete}
                    className="bg-red-500 text-white hover:bg-red-600"
                  >
                    Delete
                  </CustomButton>
                </div>
              )}
            </div>
          </div>

          {/* Event Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Event Information */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <div className="font-medium text-gray-900">{date}</div>
                        <div className="text-gray-600">{time}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <div className="font-medium text-gray-900">Location</div>
                        <div className="text-gray-600">{event.location}</div>
                      </div>
                    </div>
                    
                    {event.creator_name && (
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div>
                          <div className="font-medium text-gray-900">Organizer</div>
                          <div className="text-gray-600">{event.creator_name}</div>
                        </div>
                      </div>
                    )}

                    {event.category_name && (
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <div>
                          <div className="font-medium text-gray-900">Category</div>
                          <div className="text-gray-600">{event.category_name}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags Section */}
                {event.tags && event.tags.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {event.description && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {event.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Event Meta Information */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Information</h2>
                  
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Event Type</span>
                      <span className={`px-2 py-1 text-sm rounded-full ${
                        event.event_type === 'public' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {event.event_type === 'public' ? 'Public' : 'Private'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status</span>
                      <span className={`px-2 py-1 text-sm rounded-full ${
                        isUpcoming 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isUpcoming ? 'Upcoming' : 'Completed'}
                      </span>
                    </div>
                    
                    {event.created_at && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Created</span>
                        <span className="text-gray-900">
                          {new Date(event.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons for Non-Owners */}
                {!isOwner && isUpcoming && event.event_type === 'public' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Interested?</h2>
                    <div className="space-y-3">
                      <CustomButton
                        variant="primary"
                        className="w-full"
                        onClick={() => alert('RSVP functionality coming soon!')}
                      >
                        RSVP to Event
                      </CustomButton>
                      <p className="text-sm text-gray-600 text-center">
                        Join other attendees at this event
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default EventDetails;