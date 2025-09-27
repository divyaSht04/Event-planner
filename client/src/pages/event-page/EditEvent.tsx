import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Header, Footer } from '../../components';
import { CustomForm, CustomFormField, CustomButton } from '../../components';
import { eventService, tagService, categoryService } from '../../services';
import { useAuth } from '../../context';
import type { Event, UpdateEventData, Category, Tag } from '../../services/events';

const EditEvent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Categories and tags state
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingTags, setIsLoadingTags] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    event_type: 'public' as 'public' | 'private',
    category_id: '',
    tag_ids: [] as number[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadEventAndData = async () => {
      if (!id) {
        setError('Event ID is required');
        setIsLoadingEvent(false);
        return;
      }

      try {
        // Load event, categories, and tags in parallel
        const [eventData, categoriesData, tagsData] = await Promise.all([
          eventService.getEventById(parseInt(id)),
          categoryService.getAllCategories(),
          tagService.getAllTags()
        ]);

        setEvent(eventData);
        setCategories(categoriesData);
        setTags(tagsData);

        // Check if user owns this event
        if (!user || eventData.created_by !== user.id) {
          setError('You do not have permission to edit this event');
          return;
        }

        // Pre-populate form with event data
        setFormData({
          title: eventData.title || '',
          description: eventData.description || '',
          event_date: eventData.event_date ? new Date(eventData.event_date).toISOString().slice(0, 16) : '',
          location: eventData.location || '',
          event_type: eventData.event_type || 'public',
          category_id: eventData.category_id?.toString() || '',
          tag_ids: eventData.tags?.map(tag => tag.id) || [],
        });
      } catch (err: any) {
        console.error('Error loading event:', err);
        setError(err.message || 'Event not found');
      } finally {
        setIsLoadingEvent(false);
        setIsLoadingCategories(false);
        setIsLoadingTags(false);
      }
    };

    loadEventAndData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, category_id: value }));

    if (errors.category_id) {
      setErrors(prev => ({ ...prev, category_id: '' }));
    }
  };

  const handleTagChange = (tagId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: checked
        ? [...prev.tag_ids, tagId]
        : prev.tag_ids.filter(id => id !== tagId)
    }));

    if (errors.tag_ids) {
      setErrors(prev => ({ ...prev, tag_ids: '' }));
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
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        tag_ids: formData.tag_ids.length > 0 ? formData.tag_ids : undefined,
      };

      await eventService.updateEvent(event.id!, updateData);
      toast.success('Event updated successfully!');
      navigate('/events/my'); // Redirect to my events after update
    } catch (err: any) {
      console.error('Error updating event:', err);
      toast.error(err.message || 'Failed to update event. Please try again.');
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
          <CustomForm
            title="Edit Event"
            onSubmit={handleSubmit}
          >
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

            {/* Event Category */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleCategoryChange}
                disabled={isLoading || isLoadingCategories}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="">Select a category (optional)</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {isLoadingCategories && (
                <p className="text-gray-500 text-sm mt-1">Loading categories...</p>
              )}
              {errors.category_id && (
                <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>
              )}
              <p className="text-gray-500 text-sm">Categorize your event to help others find it</p>
            </div>

            {/* Event Tags */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              {isLoadingTags ? (
                <p className="text-gray-500 text-sm">Loading tags...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.tag_ids.includes(tag.id)}
                        onChange={(e) => handleTagChange(tag.id, e.target.checked)}
                        disabled={isLoading}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{tag.name}</span>
                    </label>
                  ))}
                </div>
              )}
              {errors.tag_ids && (
                <p className="text-red-500 text-sm mt-1">{errors.tag_ids}</p>
              )}
              <p className="text-gray-500 text-sm">Select tags that describe your event</p>
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
          </CustomForm>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default EditEvent;