import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header, Footer } from '../../components';
import CustomFormField from '../../components/CustomFormField';
import CustomButton from '../../components/CustomButton';
import { eventService } from '../../services/events/eventService';
import type { Event, UpdateEventData } from '../../services/events/types';

const EditEvent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    event_type: 'public' as 'public' | 'private',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) {
        setError('Event ID is required');
        setIsLoadingEvent(false);
        return;
      }

      try {
        const eventData = await eventService.getEventById(parseInt(id));
        setEvent(eventData);
        
        // Pre-populate form with event data
        setFormData({
          title: eventData.title || '',
          description: eventData.description || '',
          event_date: eventData.event_date ? new Date(eventData.event_date).toISOString().slice(0, 16) : '',
          location: eventData.location || '',
          event_type: eventData.event_type || 'public',
        });
      } catch (err: any) {
        console.error('Error loading event:', err);
        setError(err.message || 'Event not found');
      } finally {
        setIsLoadingEvent(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.event_date) {
      newErrors.event_date = 'Event date and time is required';
    } else {
      const eventDate = new Date(formData.event_date);
      const now = new Date();
      if (eventDate <= now) {
        newErrors.event_date = 'Event date must be in the future';
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Event location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event || !validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert datetime-local to ISO string
      const updateData: UpdateEventData = {
        title: formData.title.trim(),
        event_date: new Date(formData.event_date).toISOString(),
        location: formData.location.trim(),
        event_type: formData.event_type,
        description: formData.description.trim() || undefined,
      };

      await eventService.updateEvent(event.id!, updateData);
      navigate('/events/my'); // Redirect to my events after update
    } catch (err: any) {
      console.error('Error updating event:', err);
      setError(err.message || 'Failed to update event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  if (isLoadingEvent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/2"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <div className="text-red-600 text-lg font-medium mb-2">
              {error || 'Event not found'}
            </div>
            <p className="text-red-500 mb-4">
              The event you're looking for doesn't exist or you don't have permission to edit it.
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Event</h1>
          <p className="text-gray-600">
            Update your event details below.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Event Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Title */}
            <CustomFormField
              type="text"
              name="title"
              label="Event Title"
              placeholder="Enter event title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
              disabled={isLoading}
            />

            {/* Event Description */}
            <CustomFormField
              type="textarea"
              name="description"
              label="Description"
              placeholder="Describe your event (optional)"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              disabled={isLoading}
              rows={4}
              helperText="Provide details about what attendees can expect"
            />

            {/* Event Date & Time */}
            <CustomFormField
              type="datetime-local"
              name="event_date"
              label="Event Date & Time"
              value={formData.event_date}
              onChange={handleChange}
              error={errors.event_date}
              required
              disabled={isLoading}
              helperText="Select when your event will take place"
            />

            {/* Event Location */}
            <CustomFormField
              type="text"
              name="location"
              label="Location"
              placeholder="Enter event location"
              value={formData.location}
              onChange={handleChange}
              error={errors.location}
              required
              disabled={isLoading}
              helperText="Where will your event be held?"
            />

            {/* Event Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Event Type <span className="text-red-500">*</span>
              </label>
              <select
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="public">Public - Anyone can see this event</option>
                <option value="private">Private - Only you can see this event</option>
              </select>
              {errors.event_type && (
                <p className="text-red-500 text-sm mt-1">{errors.event_type}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <CustomButton
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Updating...' : 'Update Event'}
              </CustomButton>
              
              <CustomButton
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </CustomButton>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default EditEvent;