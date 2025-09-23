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
  const [hasMoreEvents, setHasMoreEvents] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
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
      
      const response = await eventService.getAllEvents({ 
        page, 
        limit: 10, 
        search: searchTerms || undefined,
        event_type: 'public',
        category_id: selectedCategoryId || undefined,
        tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined
      });
      
      if (page === 1) {
        setEvents(response.events);
      } else {
        setEvents(prev => [...prev, ...response.events]);
      }
      
      setHasMoreEvents(response.events.length === 10);
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Error loading events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents(1, '', ''); 
  }, [selectedCategoryId, selectedTagIds]);

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

  const handleLoadMore = () => {
    loadEvents(currentPage + 1, titleSearch, locationSearch);
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
          <p className="text-gray-600">
            Discover and attend events happening in your community
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            {(titleSearch || locationSearch || selectedCategoryId || selectedTagIds.length > 0) && (
              <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                <span>
                  Filtering events
                  {titleSearch && ` with title "${titleSearch}"`}
                  {locationSearch && ` at location "${locationSearch}"`}
                  {selectedCategoryId && ` in category "${categories.find(c => c.id === selectedCategoryId)?.name}"`}
                  {selectedTagIds.length > 0 && ` with tags: ${selectedTagIds.map(id => tags.find(t => t.id === id)?.name).join(', ')}`}
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

            {hasMoreEvents && (
              <div className="text-center pt-8">
                <CustomButton
                  variant="secondary"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Events'}
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