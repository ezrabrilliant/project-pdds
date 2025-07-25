import React, { useState, useEffect } from 'react';
import { Tv, Search, Filter, ChevronLeft, ChevronRight, X, ChevronDown, Calendar, Star, Globe } from 'lucide-react';
import { apiService } from '../services/api';
import MovieCard from '../components/MovieCard';
import type { TVShow, Genre } from '../services/api';

const TVShows: React.FC = () => {
  const [tvShows, setTVShows] = useState<TVShow[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');  const [selectedRating, setSelectedRating] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');  const [sortBy, setSortBy] = useState<'title' | 'release_year' | 'date_added' | 'vote_average' | 'popularity'>('popularity');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>(null); // Track active search filters

  // Helper function to determine sort order based on field
  const getSortOrder = (sortField: string): 'asc' | 'desc' => {
    switch(sortField) {
      case 'title': return 'asc'; // A-Z
      case 'date_added': return 'desc'; // Latest first
      case 'release_year': return 'desc'; // Newest first
      case 'vote_average': return 'desc'; // Highest rating first
      case 'popularity': return 'desc'; // Most popular first
      default: return 'desc';
    }
  };  useEffect(() => {
    const fetchData = async () => {
      try {
        let searchParams: any = {
          type: 'tvshows',
          page: currentPage,
          limit: 20,
          sortBy,
          sortOrder: getSortOrder(sortBy)
        };

        // If we have active filters, use them
        if (activeFilters) {
          searchParams = { ...searchParams, ...activeFilters, page: currentPage };
        }

        // Always use advanced search to ensure sorting is applied
        const [tvShowsResponse, genresResponse] = await Promise.all([
          apiService.advancedSearch(searchParams),
          currentPage === 1 ? apiService.getGenres() : Promise.resolve({ genres: genres })
        ]);
        
        console.log('TVShows response:', tvShowsResponse);

        // Handle response structure
        const tvShowsData = tvShowsResponse as any;
        const genresData = genresResponse as any;
        
        setTVShows(tvShowsData.results?.tvShows || tvShowsData.results?.tvshows || tvShowsData.tvShows || []);
        setTotalPages(tvShowsData.pagination?.totalPages || 1);
        
        // Only update genres on first page load
        if (currentPage === 1) {
          const genresArray = genresData.genres || genresData || [];
          setGenres(Array.isArray(genresArray) ? genresArray : []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, sortBy, activeFilters]);const handleSearch = async () => {
    setLoading(true);
    try {
      // Check if we have any search criteria
      const hasSearchCriteria = searchTerm.trim() || selectedGenre || selectedRating || selectedYear || selectedLanguage;
        
      let searchParams: any = {
        type: 'tvshows',
        page: 1,
        limit: 20,
        sortBy,
        sortOrder: getSortOrder(sortBy)
      };

      if (hasSearchCriteria) {
        if (searchTerm.trim()) searchParams.q = searchTerm.trim();
        if (selectedGenre) searchParams.genre = selectedGenre;
        if (selectedRating) {
          // Convert rating to vote_average filter (rating >= selected value)
          searchParams.ratings = [parseInt(selectedRating)];
        }
        if (selectedYear) searchParams.releaseYear = parseInt(selectedYear);
        if (selectedLanguage) searchParams.language = selectedLanguage;
      }

      // Store active filters for pagination
      setActiveFilters(hasSearchCriteria ? searchParams : null);
      setCurrentPage(1);
      
      // The useEffect will handle the actual API call
    } catch (error) {
      console.error('Search failed:', error);
      setLoading(false);
    }
  };const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setSelectedRating('');
    setSelectedYear('');
    setSelectedLanguage('');
    setCurrentPage(1);
    // Reload initial data
    handleSearch();
  };

  return (    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 animate-fade-in">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center justify-center space-x-3">
          <Tv size={40} className="text-purple-400" />
          <span>TV Shows Collection</span>
        </h1>
        <p className="text-slate-300 text-lg">
          Explore incredible TV series from around the world
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 animate-slide-up animate-stagger-1">
        {/* Main search row */}
        <div className="grid md:grid-cols-5 gap-4">          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none leading-none" size={20} />
            <input
              type="text"
              placeholder="Search TV shows... (optional)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/70 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 hover:bg-slate-800/80 hover:backdrop-blur-md transition-all"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>          <div className="relative">
            <Filter className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <ChevronDown className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full appearance-none pl-9 sm:pl-11 pr-9 sm:pr-11 py-2 sm:py-3 bg-slate-900/70 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 hover:bg-slate-800/80 hover:backdrop-blur-md transition-all text-sm sm:text-base cursor-pointer"
            >
              <option value="">All Genres</option>
              {Array.isArray(genres) && genres.map(genre => (
                <option key={genre.id} value={genre.name}>{genre.name}</option>
              ))}
            </select>
          </div>          <div className="relative">
            <Star className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <ChevronDown className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'title' | 'release_year' | 'date_added' | 'vote_average' | 'popularity');
              }}
              className="w-full appearance-none pl-9 sm:pl-11 pr-9 sm:pr-11 py-2 sm:py-3 bg-slate-900/70 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 hover:bg-slate-800/80 hover:backdrop-blur-md transition-all text-sm sm:text-base cursor-pointer"
            >
              <option value="date_added">Date Added (Latest)</option>
              <option value="title">Title A-Z</option>
              <option value="release_year">Year (Newest)</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-3 border rounded-xl transition-all flex items-center space-x-2 ${
                showAdvancedFilters 
                  ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' 
                  : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-600/50'
              }`}
            >
              <Filter size={16} />
              <span>Advanced</span>
            </button>
          </div>
        </div>        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-slate-600/50 animate-slide-up">            <div className="grid md:grid-cols-5 gap-4 mb-4">

              <div className="relative">
                <Star className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <ChevronDown className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="w-full appearance-none pl-9 sm:pl-11 pr-9 sm:pr-11 py-2 sm:py-3 bg-slate-900/70 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 hover:bg-slate-800/80 hover:backdrop-blur-md transition-all text-sm sm:text-base cursor-pointer"
                >
                  <option value="">All Ratings</option>
                  <option value="9">9.0+ ⭐ Excellent</option>
                  <option value="8">8.0+ ⭐ Very Good</option>
                  <option value="7">7.0+ ⭐ Good</option>
                  <option value="6">6.0+ ⭐ Above Average</option>
                  <option value="5">5.0+ ⭐ Average</option>
                  <option value="4">4.0+ ⭐ Below Average</option>
                </select>
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <ChevronDown className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full appearance-none pl-9 sm:pl-11 pr-9 sm:pr-11 py-2 sm:py-3 bg-slate-900/70 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 hover:bg-slate-800/80 hover:backdrop-blur-md transition-all text-sm sm:text-base cursor-pointer"
                >
                  <option value="">All Years</option>
                  {Array.from({ length: 16 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Globe className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <ChevronDown className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full appearance-none pl-9 sm:pl-11 pr-9 sm:pr-11 py-2 sm:py-3 bg-slate-900/70 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 hover:bg-slate-800/80 hover:backdrop-blur-md transition-all text-sm sm:text-base cursor-pointer"
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

              <div className="md:col-span-2 flex space-x-2">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-300 hover:text-white hover:bg-slate-600/50 transition-colors flex items-center justify-center space-x-2"
                >
                  <X size={16} />
                  <span>Clear</span>
                </button>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
                >
                  {loading ? 'Applying...' : 'Apply'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Loading TV shows...</p>
        </div>
      )}      {/* TV Shows Grid */}
      {!loading && tvShows.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">
              {searchTerm || selectedGenre ? 'Search Results' : 'All TV Shows'} ({tvShows.length} items)
            </h2>
              {/* Top Pagination - Compact */}
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600/50 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    const page = i + Math.max(1, currentPage - 1);
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg transition-colors text-sm ${
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

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600/50 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-5">
            {tvShows.map((tvShow) => (
              <MovieCard
                key={tvShow.show_id}
                item={tvShow}
                type="tvshow"
                size="medium"
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600/50 transition-colors"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <div className="flex space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + Math.max(1, currentPage - 2);
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
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

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600/50 transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {!loading && tvShows.length === 0 && (
        <div className="text-center py-16">
          <Tv className="mx-auto text-slate-500 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">No TV shows found</h3>
          <p className="text-slate-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default TVShows;
