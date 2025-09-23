import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from '../../components';
import { CustomFormField, CustomButton } from '../../components';
import { eventService } from '../../services/events';
import tagService from '../../services/tags';
import categoryService from '../../services/categories';
import type { Event, Tag, Category } from '../../services/events';

const Events: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [titleSearch, setTitleSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({start: '', end: ''});
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

  const loadEvents = async (page: number = 1, titleFilter: string = '', locationFilter: string = '') => {
    try {
      setLoading(true);
      setError(null); 
      
      const searchTerms = [titleFilter, locationFilter].filter(term => term.trim()).join(' ');
      
      // Build filters object with date filtering
      const filters: any = {
        page, 
        limit: 10, 
        search: searchTerms || undefined,
        event_type: 'public',
        category_id: selectedCategoryId || undefined,
        tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined
      };

      // Add date filtering
      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        filters.date_start = today;
        filters.date_end = today;
      } else if (dateFilter === 'week') {
        const today = new Date();
        const weekFromNow = new Date(today);
        weekFromNow.setDate(today.getDate() + 7);
        filters.date_start = today.toISOString().split('T')[0];
        filters.date_end = weekFromNow.toISOString().split('T')[0];
      } else if (dateFilter === 'month') {
        const today = new Date();
        const monthFromNow = new Date(today);
        monthFromNow.setMonth(today.getMonth() + 1);
        filters.date_start = today.toISOString().split('T')[0];
        filters.date_end = monthFromNow.toISOString().split('T')[0];
      } else if (dateFilter === 'custom' && dateRange.start && dateRange.end) {
        filters.date_start = dateRange.start;
        filters.date_end = dateRange.end;
      }
      
      const response = await eventService.getAllEvents(filters);
      
      // Replace events for new page instead of appending
      setEvents(response.events);
      
      // Update pagination state using backend response
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
    loadEvents(1, titleSearch, locationSearch); 
  }, [selectedCategoryId, selectedTagIds, dateFilter, dateRange]);

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

  const handleTitleFilter = () => {
    loadEvents(1, titleSearch, locationSearch);
  };

  const handleLocationFilter = () => {
    loadEvents(1, titleSearch, locationSearch);
  };

  const handleClearFilters = () => {
    setTitleSearch('');
    setLocationSearch('');
    setDateFilter('');
    setDateRange({start: '', end: ''});
    setSelectedCategoryId(null);
    setSelectedTagIds([]);
    loadEvents(1, '', '');
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    loadEvents(1, titleSearch, locationSearch);
  };

  const handleTagChange = (tagId: number, checked: boolean) => {
    if (checked) {
      setSelectedTagIds(prev => [...prev, tagId]);
    } else {
      setSelectedTagIds(prev => prev.filter(id => id !== tagId));
    }
    loadEvents(1, titleSearch, locationSearch);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadEvents(newPage, titleSearch, locationSearch);
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

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Title Search */}
              <div className="space-y-2">
                <CustomFormField
                  type="text"
                  name="titleSearch"
                  label="Search by Title and Description"
                  placeholder="Event title..."
                  value={titleSearch}
                  onChange={(e) => setTitleSearch(e.target.value)}
                />
                <CustomButton
                  variant="secondary"
                  onClick={handleTitleFilter}
                  className="w-full"
                >
                  Filter by Title
                </CustomButton>
              </div>

              <div className="space-y-2">
                <CustomFormField
                  type="text"
                  name="locationSearch"
                  label="Search by Location"
                  placeholder="Event location..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                />
                <CustomButton
                  variant="secondary"
                  onClick={handleLocationFilter}
                  className="w-full"
                >
                  Filter by Location
                </CustomButton>
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Filter by Date
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">Next 7 Days</option>
                  <option value="month">Next Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Filter by Category
                </label>
                <select
                  value={selectedCategoryId || ''}
                  onChange={(e) => handleCategoryChange(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Actions
                </label>
                <div className="pt-6">
                  <CustomButton
                    variant="danger"
                    onClick={handleClearFilters}
                    className="w-full"
                  >
                    Clear All Filters
                  </CustomButton>
                </div>
              </div>
            </div>

            {/* Custom Date Range */}
            {dateFilter === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Tags Filter */}
            {tags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Filter by Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTagIds.includes(tag.id)}
                        onChange={(e) => handleTagChange(tag.id, e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Results Summary */}
            {(titleSearch || locationSearch || selectedCategoryId || selectedTagIds.length > 0 || dateFilter) && (
              <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                <span>
                  Filtering events
                  {titleSearch && ` with title "${titleSearch}"`}
                  {locationSearch && ` at location "${locationSearch}"`}
                  {selectedCategoryId && ` in category "${categories.find(c => c.id === selectedCategoryId)?.name}"`}
                  {selectedTagIds.length > 0 && ` with tags: ${selectedTagIds.map(id => tags.find(t => t.id === id)?.name).join(', ')}`}
                  {dateFilter && dateFilter !== 'custom' && ` for ${dateFilter === 'today' ? 'today' : dateFilter === 'week' ? 'next 7 days' : 'next month'}`}
                  {dateFilter === 'custom' && dateRange.start && dateRange.end && ` from ${dateRange.start} to ${dateRange.end}`}
                </span>
              </div>
            )}
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
                  {(titleSearch || locationSearch || selectedCategoryId || selectedTagIds.length > 0) ? 'No events match your search' : 'No public events found'}
                </div>
                <div className="text-gray-400">
                  {(titleSearch || locationSearch || selectedCategoryId || selectedTagIds.length > 0) ? 'Try adjusting your search terms' : 'Check back later for new events'}
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
        ) : null}
      </div>
      
      <Footer />
    </div>
  );
};

export default Events;