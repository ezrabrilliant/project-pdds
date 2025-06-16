import React, { useState, useEffect } from 'react';
import { Tv, Search, Filter, ChevronLeft, ChevronRight, X, ChevronDown } from 'lucide-react';
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
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'release_year' | 'date_added' | 'rating'>('date_added');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tvShowsResponse, genresResponse] = await Promise.all([          apiService.getTVShows({ page: currentPage, limit: 20 }),
          apiService.getGenres()
        ]);
        
        console.log('TVShows response:', tvShowsResponse);
        console.log('Genres response:', genresResponse);
          // Handle wrapped response structure
        const tvShowsData = (tvShowsResponse as any).data || tvShowsResponse;
        const genresData = (genresResponse as any).data || genresResponse;
        
        setTVShows(tvShowsData.tvShows || []);
        setTotalPages(tvShowsData.pagination?.totalPages || 1);
        
        // Ensure genres is always an array
        const genresArray = genresData.genres || genresData || [];
        setGenres(Array.isArray(genresArray) ? genresArray : []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);  const handleSearch = async () => {
    setLoading(true);
    try {
      // Check if we have any search criteria
      const hasSearchCriteria = searchTerm.trim() || selectedGenre || selectedRating || selectedYear || selectedLanguage;
      
      if (!hasSearchCriteria) {
        // If no search criteria, just apply sort to all TV shows
        const tvShowsResponse = await apiService.getTVShows({ 
          page: 1, 
          limit: 20
        } as any);
        const tvShowsData = tvShowsResponse as any;
        setTVShows(tvShowsData.tvShows || []);
        setCurrentPage(1);
        setTotalPages(tvShowsData.pagination?.totalPages || 1);
        setLoading(false);
        return;
      }

      // Use advanced search with filters
      const searchParams: any = {
        type: 'tvshows',
        page: 1,
        limit: 20,
        sortBy,
        sortOrder: 'desc'
      };      if (searchTerm.trim()) searchParams.q = searchTerm.trim();
      if (selectedGenre) searchParams.genre = selectedGenre;
      if (selectedRating) searchParams.rating = selectedRating;
      if (selectedYear) searchParams.releaseYear = parseInt(selectedYear);
      if (selectedLanguage) searchParams.language = selectedLanguage;

      const response = await apiService.advancedSearch(searchParams);
      
      console.log('Search response:', response);
      
      // Handle response structure (now unwrapped by API service)
      const searchData = response as any;
      
      setTVShows(searchData.results?.tvShows || searchData.results?.tvshows || searchData.tvShows || []);
      setCurrentPage(1);
      setTotalPages(searchData.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setSelectedRating('');
    setSelectedYear('');
    setSelectedLanguage('');
    setCurrentPage(1);
    // Reload initial data
    handleSearch();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center justify-center space-x-3">
          <Tv size={40} className="text-purple-400" />
          <span>TV Shows Collection</span>
        </h1>
        <p className="text-slate-300 text-lg">
          Explore incredible TV series from around the world
        </p>
      </div>      {/* Search and Filters */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
        {/* Main search row */}
        <div className="grid md:grid-cols-5 gap-4 mb-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search TV shows... (optional)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">All Genres</option>
            {Array.isArray(genres) && genres.map(genre => (
              <option key={genre.id} value={genre.name}>{genre.name}</option>
            ))}
          </select>

          <select
            value={sortBy}            onChange={(e) => {
              setSortBy(e.target.value as 'title' | 'release_year' | 'date_added' | 'rating');
              // Auto-apply sort when changed
              setTimeout(() => handleSearch(), 100);
            }}
            className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
          >            <option value="date_added">Sort by Date Added (Latest)</option>
            <option value="title">Sort by Title A-Z</option>
            <option value="release_year">Sort by Year (Newest)</option>
            <option value="rating">Sort by Rating</option>
          </select>

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
          <div className="pt-4 border-t border-slate-600/50">
            <div className="grid md:grid-cols-5 gap-4 mb-4">
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">All Ratings</option>
                <option value="TV-Y">TV-Y</option>
                <option value="TV-Y7">TV-Y7</option>
                <option value="TV-G">TV-G</option>
                <option value="TV-PG">TV-PG</option>
                <option value="TV-14">TV-14</option>
                <option value="TV-MA">TV-MA</option>
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">All Years</option>
                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
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
            <div className="text-sm text-slate-400 text-center">
              Use filters and sorting even without a search query to browse TV shows
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
      )}

      {/* TV Shows Grid */}
      {!loading && tvShows.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">
              {searchTerm || selectedGenre ? 'Search Results' : 'All TV Shows'} ({tvShows.length} items)
            </h2>
          </div>          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tvShows.map((tvShow) => (
              <MovieCard
                key={tvShow.show_id}
                item={tvShow}
                type="tvshow"
                size="large"
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
