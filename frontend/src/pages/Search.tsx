import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, X, ChevronDown } from 'lucide-react';
import { apiService } from '../services/api';
import type { Movie, TVShow, Genre, SearchFilters } from '../services/api';

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'movies' | 'tvshows' | 'all'>('all');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const ratings = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-Y', 'TV-Y7', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA'];
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
    fetchGenres();
  }, []);

  const handleSearch = async (page = 1) => {
    if (!searchQuery.trim() && Object.keys(filters).length === 0) return;

    setLoading(true);
    try {
      const searchParams = {
        ...filters,
        page,
        limit: 20,
        type: searchType
      };

      const response = await apiService.advancedSearch(searchParams);
      setResults(response.data);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
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
  };

  const renderContentCard = (item: Movie | TVShow) => {
    const isMovie = 'duration_minutes' in item;
    
    return (
      <div key={item.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-white line-clamp-2">{item.title}</h3>
          <span className="px-3 py-1 bg-purple-600/20 rounded-full text-xs text-purple-300 font-medium">
            {isMovie ? 'Movie' : 'TV Show'}
          </span>
        </div>
        
        <p className="text-slate-400 text-sm mb-4 line-clamp-3">{item.description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Year:</span>
            <span className="text-white">{item.release_year}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Rating:</span>
            <span className="text-white">{item.rating}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Duration:</span>
            <span className="text-white">
              {isMovie ? `${item.duration_minutes} min` : item.duration}
            </span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex flex-wrap gap-1">
            {item.genres.slice(0, 3).map((genre, index) => (
              <span key={index} className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300">
                {genre}
              </span>
            ))}
            {item.genres.length > 3 && (
              <span className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300">
                +{item.genres.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Smart Search
        </h1>
        <p className="text-slate-300 text-lg">
          Find your perfect movie or TV show with advanced filtering
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search movies and TV shows..."
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
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white hover:bg-slate-600/50 transition-colors flex items-center space-x-2"
          >
            <Filter size={16} />
            <span>Filters</span>
            <ChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} size={16} />
          </button>

          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-slate-600 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Rating</label>
              <select
                value={filters.rating || ''}
                onChange={(e) => updateFilter('rating', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">All Ratings</option>
                {ratings.map(rating => (
                  <option key={rating} value={rating}>{rating}</option>
                ))}
              </select>
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
              <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
              <select
                value={filters.sortBy || ''}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Relevance</option>
                <option value="title">Title</option>
                <option value="release_year">Release Year</option>
                <option value="date_added">Date Added</option>
              </select>
            </div>

            <div className="lg:col-span-4 flex justify-end space-x-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors flex items-center space-x-2"
              >
                <X size={16} />
                <span>Clear Filters</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">
              Search Results ({results.length} items)
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
