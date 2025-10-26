import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Header, Footer } from '../../components';
import { CustomButton, CustomFormField } from '../../components';
import { eventService } from '../../services';
import tagService from '../../services/tags';
import categoryService from '../../services/categories';
import type { Event, Tag, Category } from '../../services/events';

const MyEvents: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState<'public' | 'private' | ''>('');
  const [upcoming, setUpcoming] = useState(false);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [sortBy, setSortBy] = useState<'event_date' | 'created_at' | 'title'>('event_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
    totalCount: 0
  });
  
  // Category and tag filtering state
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const loadMyEvents = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: any = {
        page,
        limit: 5,
        search: search || undefined,
        event_type: eventType || undefined,
        upcoming: upcoming || undefined,
        category_id: selectedCategoryId || undefined,
        tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        date_start: dateStart || undefined,
        date_end: dateEnd || undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined
      };
      
      const response = await eventService.getMyEvents(filters);
      setEvents(response.events);
      
      // Update pagination state using backend response
      if (response.pagination) {
        const shouldShowPagination = response.pagination.totalPages > 1 && response.pagination.total > 5;
        setPagination({
          currentPage: response.pagination.page,
          totalPages: shouldShowPagination ? response.pagination.totalPages : 1,
          hasNext: shouldShowPagination ? response.pagination.hasNext : false,
          hasPrev: shouldShowPagination ? response.pagination.hasPrev : false,
          totalCount: response.pagination.total
        });
      } else {
        // Reset pagination if no pagination data
        setPagination({
          currentPage: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
          totalCount: response.events.length
        });
      }
    } catch (err: any) {
      console.error('Error loading my events:', err);
      setError('Failed to load your events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyEvents(1);
  }, []);

  const loadCategoriesAndTags = async () => {
    try {
      const [categoriesResponse, tagsResponse] = await Promise.all([
        categoryService.getAllCategories(),
        tagService.getAllTags()
      ]);
      setCategories(categoriesResponse);
      setTags(tagsResponse);
    } catch (err) {
      console.error('Error loading categories and tags:', err);
    }
  };

  useEffect(() => {
    loadCategoriesAndTags();
  }, []);

  const handleCreateEvent = () => {
    navigate('/events/create');
  };

  const handleEditEvent = (eventId: number) => {
    navigate(`/events/edit/${eventId}`);
  };

  const handleViewEvent = (eventId: number) => {
    navigate(`/events/${eventId}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadMyEvents(newPage);
    }
  };

  const handleTagChange = (tagId: number, checked: boolean) => {
    if (checked) {
      setSelectedTagIds(prev => [...prev, tagId]);
    } else {
      setSelectedTagIds(prev => prev.filter(id => id !== tagId));
    }
  };

  const handleApplyFilters = () => {
    loadMyEvents(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setEventType('');
    setUpcoming(false);
    setDateStart('');
    setDateEnd('');
    setSelectedCategoryId(null);
    setSelectedTagIds([]);
    setSortBy('event_date');
    setSortOrder('asc');
    loadMyEvents(1);
  };

  const handleDeleteEvent = async (event: Event) => {
    if (!window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      return;
    }

    try {
      await eventService.deleteEvent(event.id!);
      toast.success('Event deleted successfully!');
      // Remove the deleted event from the list
      setEvents(prev => prev.filter(e => e.id !== event.id));
    } catch (err: any) {
      console.error('Error deleting event:', err);
      toast.error('Failed to delete event. Please try again.');
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
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Manage your created events
              </p>
              {pagination.totalCount > 0 && events.length > 0 && (
                <p className="text-sm text-gray-500">
                  Showing {((pagination.currentPage - 1) * 5) + 1}-{((pagination.currentPage - 1) * 5) + events.length} of {pagination.totalCount} events
                  {pagination.totalPages > 1 && ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
                </p>
              )}
            </div>
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

        {/* Filter Controls */}
        {!loading && events.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter My Events</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <CustomFormField
                type="text"
                name="search"
                label="Search"
                placeholder="Title, description, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {/* Event Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as 'public' | 'private' | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={selectedCategoryId || ''}
                  onChange={(e) => setSelectedCategoryId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              {/* Upcoming Only */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Show Only</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="upcoming"
                    checked={upcoming}
                    onChange={(e) => setUpcoming(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="upcoming" className="text-sm text-gray-700">Upcoming Events</label>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <CustomFormField
                type="date"
                name="dateStart"
                label="Start Date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
              />

              <CustomFormField
                type="date"
                name="dateEnd"
                label="End Date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
              />
            </div>

            {/* Sorting */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'event_date' | 'created_at' | 'title')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="event_date">Event Date</option>
                  <option value="created_at">Created Date</option>
                  <option value="title">Title</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <label key={tag.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedTagIds.includes(tag.id)}
                        onChange={(e) => handleTagChange(tag.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Buttons */}
            <div className="flex space-x-2">
              <CustomButton onClick={handleApplyFilters} variant="primary">
                Apply Filters
              </CustomButton>
              <CustomButton onClick={handleClearFilters} variant="secondary">
                Clear Filters
              </CustomButton>
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
            {events.length === 0 ? (
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
                {events.map((event) => {
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

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                {/* Previous Button */}
                <CustomButton
                  variant="secondary"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev || loading}
                  className="px-3 py-2"
                >
                  ← Previous
                </CustomButton>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isCurrentPage = pageNum === pagination.currentPage;
                    const isNearCurrentPage = Math.abs(pageNum - pagination.currentPage) <= 2;
                    const isFirstOrLast = pageNum === 1 || pageNum === pagination.totalPages;
                    
                    if (!isNearCurrentPage && !isFirstOrLast) {
                      // Show ellipsis for pages that are too far
                      if (pageNum === 2 || pageNum === pagination.totalPages - 1) {
                        return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                      }
                      return null;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isCurrentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <CustomButton
                  variant="secondary"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext || loading}
                  className="px-3 py-2"
                >
                  Next →
                </CustomButton>
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