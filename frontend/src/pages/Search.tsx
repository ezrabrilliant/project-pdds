import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, X, ChevronDown } from 'lucide-react';
import { apiService } from '../services/api';
import MovieCard from '../components/MovieCard';
import type { Movie, TVShow, Genre, SearchFilters } from '../services/api';

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState<'movies' | 'tvshows' | 'all'>('all');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const ratingRanges = [
    { label: '9.0 - 10.0 ⭐ Excellent', value: 9 },
    { label: '8.0 - 8.9 ⭐ Very Good', value: 8 },
    { label: '7.0 - 7.9 ⭐ Good', value: 7 },
    { label: '6.0 - 6.9 ⭐ Above Average', value: 6 },
    { label: '5.0 - 5.9 ⭐ Average', value: 5 },
    { label: '4.0 - 4.9 ⭐ Below Average', value: 4 },
    { label: '3.0 - 3.9 ⭐ Poor', value: 3 },
    { label: '2.0 - 2.9 ⭐ Very Poor', value: 2 },
    { label: '1.0 - 1.9 ⭐ Terrible', value: 1 }
  ];
  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresData = await apiService.getGenres();
        setGenres(genresData);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };
    fetchGenres();    // Auto-search if there's a query parameter from URL
    const queryFromUrl = searchParams.get('q');
    if (queryFromUrl && queryFromUrl.trim()) {
      setSearchQuery(queryFromUrl);
      // Use setTimeout to ensure state is updated first
      setTimeout(() => {
        handleSearch();
      }, 100);
    }
  }, []);  const handleSearch = async (page = 1) => {
    // Allow search with just filters (without requiring search query)
    if (!searchQuery.trim() && Object.keys(filters).length === 0) {
      console.warn('Search query or filters are required');
      return;
    }    setLoading(true);
    try {
      const searchParams: any = {
        ...filters,
        page,
        limit: 20,
        type: searchType
      };

      // Set default sortOrder based on sortBy if not specified
      if (filters.sortBy) {
        searchParams.sortBy = filters.sortBy;
        
        // Set logical default sortOrder for each sortBy option
        if (!filters.sortOrder) {
          switch (filters.sortBy) {
            case 'title':
              searchParams.sortOrder = 'asc'; // A-Z
              break;
            case 'release_year':
              searchParams.sortOrder = 'desc'; // Newest first
              break;
            case 'vote_average':
              searchParams.sortOrder = 'desc'; // Highest rating first
              break;
            case 'popularity':
              searchParams.sortOrder = 'desc'; // Most popular first
              break;
            case 'date_added':
            default:
              searchParams.sortOrder = 'desc'; // Latest first
              break;
          }
        } else {
          searchParams.sortOrder = filters.sortOrder;
        }
      } else {
        // Default sort when no sortBy is selected
        searchParams.sortBy = 'date_added';
        searchParams.sortOrder = 'desc';
      }

      // Only add query if it exists
      if (searchQuery.trim()) {
        searchParams.q = searchQuery.trim();
      }

      console.log('Search params being sent:', searchParams);

      const response = await apiService.advancedSearch(searchParams);
      
      // Response sudah di-unwrap oleh apiService.request(), jadi response langsung berisi data
      // Handle different search types
      let resultsData: (Movie | TVShow)[] = [];
      if (searchType === 'movies') {
        resultsData = response.results.movies || [];
      } else if (searchType === 'tvshows') {
        resultsData = response.results.tvShows || [];
      } else {
        // For 'all', use combined results
        resultsData = response.results.combined || [];
      }
      
      setResults(resultsData);
      setCurrentPage(response.pagination.page || 1);
      // For now, set totalPages based on results length (simplified pagination)
      setTotalPages(resultsData.length >= (response.pagination.limit || 20) ? page + 1 : page);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setResults([]);
  };  const renderContentCard = (item: Movie | TVShow) => {
    const type = 'duration_minutes' in item ? 'movie' : 'tvshow';
    
    return (
      <MovieCard 
        key={item.show_id} 
        item={item} 
        type={type}
        size="medium"
      />
    );
  };
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Search
        </h1>
        <p className="text-slate-300 text-lg">
          Find your perfect movie or TV show with advanced filtering
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 animate-slide-up animate-stagger-1"><div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search movies and TV shows... (optional)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'movies' | 'tvshows' | 'all')}
            className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Content</option>
            <option value="movies">Movies Only</option>
            <option value="tvshows">TV Shows Only</option>
          </select>          <select
            value={filters.sortBy || ''}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">Sort by Date Added (Latest)</option>
            <option value="title">Sort by Title (A-Z)</option>
            <option value="release_year">Sort by Year (Newest First)</option>
            <option value="date_added">Sort by Date Added (Latest)</option>
            <option value="popularity">Sort by Popularity (Most Popular)</option>
          </select>

          {/* Sort Order Toggle - only show when sortBy is selected */}
          {filters.sortBy && (
            <button
              onClick={() => {
                const currentOrder = filters.sortOrder || 
                  (filters.sortBy === 'title' ? 'asc' : 'desc');
                updateFilter('sortOrder', currentOrder === 'asc' ? 'desc' : 'asc');
              }}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white hover:bg-slate-600/50 transition-all"
              title="Toggle sort direction"
            >
              {(() => {
                const currentOrder = filters.sortOrder || 
                  (filters.sortBy === 'title' ? 'asc' : 'desc');
                if (filters.sortBy === 'title') {
                  return currentOrder === 'asc' ? 'A→Z' : 'Z→A';
                } else if (filters.sortBy === 'release_year') {
                  return currentOrder === 'desc' ? '↓New' : '↑Old';
                } else if (filters.sortBy === 'vote_average') {
                  return currentOrder === 'desc' ? '↓High' : '↑Low';
                } else {
                  return currentOrder === 'desc' ? '↓' : '↑';
                }
              })()}
            </button>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-3 border rounded-xl transition-all flex items-center space-x-2 ${
              showFilters 
                ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' 
                : 'bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50'
            }`}
          >
            <Filter size={16} />
            <span>More Filters</span>
            <ChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} size={16} />
          </button>

          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-slate-600 grid md:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Genre</label>
              <select
                value={filters.genre || ''}
                onChange={(e) => updateFilter('genre', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">All Genres</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.name}>{genre.name}</option>
                ))}
              </select>
            </div><div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Rating Ranges</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {ratingRanges.map(range => (
                  <label key={range.value} className="flex items-center space-x-2 text-sm text-slate-300 hover:text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(filters.ratings || []).includes(range.value)}
                      onChange={(e) => {
                        const currentRatings = filters.ratings || [];
                        if (e.target.checked) {
                          updateFilter('ratings', [...currentRatings, range.value]);
                        } else {
                          updateFilter('ratings', currentRatings.filter(r => r !== range.value));
                        }
                      }}
                      className="rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500"
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Release Year</label>
              <select
                value={filters.releaseYear || ''}
                onChange={(e) => updateFilter('releaseYear', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
              <select
                value={filters.language || ''}
                onChange={(e) => updateFilter('language', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">All Languages</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
                <option value="hi">Hindi</option>
                <option value="ar">Arabic</option>
              </select>
            </div>

            <div className="lg:col-span-4 flex justify-between items-center pt-4">
              <div className="text-sm text-slate-400">
                Use filters to narrow down results even without a search query
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <X size={16} />
                  <span>Clear Filters</span>
                </button>
                <button
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
                >
                  {loading ? 'Applying...' : 'Apply Filters'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>      {/* Results */}
      {results && results.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">
              Search Results ({results.length} items)
            </h2>
          </div>          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-5">
            {results.map(renderContentCard)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + Math.max(1, currentPage - 2);
                return (
                  <button
                    key={page}
                    onClick={() => handleSearch(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {results.length === 0 && !loading && (searchQuery || Object.keys(filters).length > 0) && (
        <div className="text-center py-16">
          <SearchIcon className="mx-auto text-slate-500 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">No results found</h3>
          <p className="text-slate-500">Try adjusting your search terms or filters</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Searching...</p>
        </div>
      )}
    </div>
  );
};

export default Search;
