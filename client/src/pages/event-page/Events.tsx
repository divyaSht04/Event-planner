import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from '../../components';
import { CustomFormField, CustomButton } from '../../components';
import { eventService } from '../../services';
import tagService from '../../services/tags';
import categoryService from '../../services/categories';
import type { Event, Tag, Category } from '../../services/events';

const Events: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState<'public' | 'private' | ''>('');
  const [upcoming, setUpcoming] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
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

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const loadEvents = async (page: number = 1) => {
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

      const response = await eventService.getAllEvents(filters);

      setEvents(response.events);

      if (response.pagination) {
        setPagination({
          currentPage: response.pagination.page,
          totalPages: response.pagination.totalPages,
          hasNext: response.pagination.hasNext,
          hasPrev: response.pagination.hasPrev,
          totalCount: response.pagination.total
        });
      }
    } catch (err: any) {
      console.error('Error loading events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents(1);
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

  const handleApplyFilters = () => {
    loadEvents(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setEventType('');
    setUpcoming(false);
    setSelectedCategoryId(null);
    setSelectedTagIds([]);
    setDateStart('');
    setDateEnd('');
    setSortBy('event_date');
    setSortOrder('asc');
    loadEvents(1);
  };

  const handleTagChange = (tagId: number, checked: boolean) => {
    if (checked) {
      setSelectedTagIds(prev => [...prev, tagId]);
    } else {
      setSelectedTagIds(prev => prev.filter(id => id !== tagId));
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadEvents(newPage);
    }
  };

  const handleEventClick = (eventId: number) => {
    navigate(`/events/${eventId}`);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Public Events</h1>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Discover and attend events happening in your community
            </p>
            {pagination.totalCount > 0 && (
              <p className="text-sm text-gray-500">
                Showing {events.length} of {pagination.totalCount} events
                {pagination.totalPages > 1 && ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
              </p>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Events</h2>

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

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-600">{error}</div>
          </div>
        )}


        {/* Events List */}
        {!loading || events.length > 0 ? (
          <>
            {events.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">
                  {(search || selectedCategoryId || selectedTagIds.length > 0 || dateStart || dateEnd) ? 'No events match your filters' : 'No public events found'}
                </div>
                <div className="text-gray-400">
                  {(search || selectedCategoryId || selectedTagIds.length > 0 || dateStart || dateEnd) ? 'Try adjusting your filters' : 'Check back later for new events'}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {events.map((event) => {
                  const { date, time, isUpcoming } = formatEventDate(event.event_date);
                  return (
                    <div 
                      key={event.id} 
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleEventClick(event.id!)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              isUpcoming 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {isUpcoming ? 'Upcoming' : 'Past'}
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
                            {event.creator_name && (
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Organized by {event.creator_name}
                              </div>
                            )}
                            {event.category_name && (
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                {event.category_name}
                              </div>
                            )}
                          </div>
                          
                          {/* Tags */}
                          {event.tags && event.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {event.tags.map((tag) => (
                                <span
                                  key={tag.id}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 sm:mt-0 sm:ml-6">
                          <CustomButton
                            variant="primary"
                            onClick={() => handleEventClick(event.id!)}
                          >
                            View Details
                          </CustomButton>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <CustomButton
                  variant="secondary"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev || loading}
                  className="px-3 py-2"
                >
                  ← Previous
                </CustomButton>

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
        ) : null}
      </div>
      
      <Footer />
    </div>
  );
};

export default Events;