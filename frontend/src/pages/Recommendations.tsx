import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Film, Tv, Heart, Search } from 'lucide-react';
import { apiService } from '../services/api';
import MovieCard from '../components/MovieCard';
import type { Movie, TVShow, Genre, RecommendationItem } from '../services/api';

const Recommendations: React.FC = () => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [contentType, setContentType] = useState<'movies' | 'tvshows' | 'all'>('all');
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [algorithmUsed, setAlgorithmUsed] = useState<string>('');
  const [showAllGenres, setShowAllGenres] = useState(false);

  const [searchMode, setSearchMode] = useState<'genre' | 'item'>('genre');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableItems, setAvailableItems] = useState<(Movie | TVShow)[]>([]);
  const [selectedItem, setSelectedItem] = useState<Movie | TVShow | null>(null);
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresResponse = await apiService.getGenres();
        console.log('Genres response:', genresResponse);
        // Handle wrapped response structure
        const genresData = (genresResponse as any).data || genresResponse;
        const genres = genresData.genres || genresData;

        if (Array.isArray(genres)) {
          setGenres(genres.sort((a, b) => b.total_count - a.total_count));
        } else {
          console.error('Genres data is not an array:', genres);
        }
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };
    fetchGenres();
  }, []);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  }; const getRecommendations = async () => {
    if (selectedGenres.length === 0) return;

    setLoading(true);
    setHasSearched(true);
    try {
      console.log('Sending request with:', {
        genres: selectedGenres,
        type: contentType,
        limit: 20
      });

      const response = await apiService.getRecommendationsByGenres(
        selectedGenres,
        contentType,
        20
      );
      console.log('API Response:', response);

      if (response.recommendations) {
        console.log('Recommendations found:', response.recommendations.length);
        setRecommendations(response.recommendations);
        setAlgorithmUsed(response.algorithm);
      } else {
        console.log('No recommendations or invalid response structure');
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  // Search for items (movies/TV shows) for item-based recommendations
  const searchItems = async (query: string) => {
    if (query.length < 2) {
      setAvailableItems([]);
      return;
    }

    try {
      const response = await apiService.searchContent({
        query,
        type: contentType === 'all' ? undefined : contentType,
        limit: 10
      }); const items = contentType === 'movies' ? response.movies :
        contentType === 'tvshows' ? response.tvShows :
          [...(response.movies || []), ...(response.tvShows || [])];

      setAvailableItems(items || []);
    } catch (error) {
      console.error('Failed to search items:', error);
      setAvailableItems([]);
    }
  };

  // Get recommendations based on selected item
  const getItemRecommendations = async () => {
    if (!selectedItem) return;

    setLoading(true);
    setHasSearched(true);
    try {
      let response;
      if ('duration_minutes' in selectedItem) {
        // It's a movie
        response = await apiService.getMovieRecommendations(selectedItem.show_id, 20);
      } else {
        // It's a TV show
        response = await apiService.getTVShowRecommendations(selectedItem.show_id, 20);
      }
      if (response.recommendations) {
        setRecommendations(response.recommendations);
        setAlgorithmUsed(response.algorithm);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Failed to get item recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedGenres([]);
    setRecommendations([]);
    setHasSearched(false);
  }; return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 sm:space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center justify-center space-x-2 sm:space-x-3">
          <Sparkles size={28} className="text-purple-400 sm:w-8 sm:h-8" />
          <span>Recommendations</span>
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base px-4">
          Get personalized recommendations based on your favorite genres
        </p>
      </div>

      {/* Genre Selection */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20">
        <div className="space-y-4 sm:space-y-6">          
          {/* Content Type Selection */}
          <div className="flex justify-center">
            <div className="flex bg-slate-700/50 rounded-xl p-1 w-full max-w-md">
              <button
                onClick={() => setContentType('movies')}
                className={`flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all flex-1 text-sm sm:text-base ${contentType === 'movies'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white'
                  }`}
              >
                <Film size={18} />
                <span>Movies</span>
              </button>
              <button
                onClick={() => setContentType('tvshows')}
                className={`flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all flex-1 text-sm sm:text-base ${contentType === 'tvshows'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white'
                  }`}
              >
                <Tv size={18} />
                <span>TV Shows</span>
              </button>
              <button
                onClick={() => setContentType('all')}
                className={`flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all flex-1 text-sm sm:text-base ${contentType === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white'
                  }`}
              >
                <Heart size={18} />
                <span>Both</span>
              </button>
            </div>
          </div>
          {/* Genre Selection */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center space-x-2">
              <Heart className="text-pink-400" size={20} />
              <span>Select Your Favorite Genres</span>
            </h3>            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {genres.slice(0, showAllGenres ? genres.length : 8).map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreToggle(genre.name)}
                  className={`w-[140px] h-[70px] sm:w-[150px] sm:h-[80px] p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 text-center flex flex-col justify-center ${selectedGenres.includes(genre.name)
                    ? 'border-purple-500 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white'
                    : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-purple-500/50 hover:bg-slate-600/30'
                    }`}
                >
                  <div className="font-semibold text-sm sm:text-base truncate">{genre.name}</div>
                  <div className="text-xs sm:text-sm text-slate-400">
                    {genre.total_count.toLocaleString()} items
                  </div>
                </button>
              ))}
            </div>

            {/* Show More/Less Button */}
            {genres.length > 8 && (
              <div className="flex justify-center mt-3 sm:mt-4">
                <button
                  onClick={() => setShowAllGenres(!showAllGenres)}
                  className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 hover:text-white hover:bg-slate-600/50 transition-colors text-sm flex items-center space-x-2"
                >
                  <span>{showAllGenres ? 'Show Less' : `Show ${genres.length - 8} More Genres`}</span>
                  <span className="text-xs">
                    {showAllGenres ? '▲' : '▼'}
                  </span>
                </button>
              </div>
            )}
          </div>{/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={getRecommendations}
              disabled={selectedGenres.length === 0 || loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <Sparkles size={18} />
              <span>{loading ? 'Getting Recommendations...' : 'Get Recommendations'}</span>
            </button>

            {selectedGenres.length > 0 && (
              <button
                onClick={clearSelection}
                className="w-full sm:w-auto px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-300 hover:text-white hover:bg-slate-600/50 transition-colors text-sm sm:text-base"
              >
                Clear Selection
              </button>
            )}
          </div>

          {/* Selected Genres Display */}
          {selectedGenres.length > 0 && (
            <div className="text-center">
              <p className="text-slate-300 mb-2 text-sm sm:text-base">Selected genres:</p>
              <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                {selectedGenres.map((genre, index) => (
                  <span key={index} className="px-2 sm:px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-xs sm:text-sm text-purple-300">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>      {/* Loading */}
      {loading && (
        <div className="text-center py-6 sm:py-8">
          <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-slate-400 text-xs sm:text-sm">Finding perfect recommendations for you...</p>
        </div>
      )}

      {/* Recommendations Results */}
      {!loading && recommendations.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          {/* Algorithm Information */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-purple-500/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <TrendingUp className="text-purple-400" size={18} />
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    {recommendations.length} Recommendations Found
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    Algorithm: {algorithmUsed.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <p className="text-slate-300 text-xs sm:text-sm">Content Type:
                  <span className="ml-1 px-2 py-1 bg-purple-600/20 rounded-full text-xs">
                    {contentType === 'all' ? 'Movies & TV Shows' : contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                  </span>
                </p>
              </div>
            </div>
          </div>{/* Recommendations Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {recommendations.map((item) => (
              <MovieCard
                key={item.show_id}
                item={item as (Movie | TVShow)}
                type={(() => {
                  // First check for content_type property from backend
                  if ((item as any).content_type) {
                    return (item as any).content_type === 'movie' ? 'movie' : 'tvshow';
                  }
                  // Fallback to duration_minutes check
                  return ('duration_minutes' in item) ? 'movie' : 'tvshow';
                })()}
                size="medium"
              />
            ))}
          </div>
        </div>
      )}      {/* No Results */}
      {!loading && hasSearched && recommendations.length === 0 && (
        <div className="text-center py-6 sm:py-8">
          <Sparkles className="mx-auto text-slate-500 mb-3" size={32} />
          <h3 className="text-base sm:text-lg font-semibold text-slate-400 mb-1">No recommendations found</h3>
          <p className="text-slate-500 text-xs sm:text-sm">Try selecting different genres or content type</p>
        </div>
      )}

      {/* Getting Started */}
      {!hasSearched && (
        <div className="text-center py-6 sm:py-8">
          <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl p-4 sm:p-6 border border-purple-500/20">
            <Sparkles className="mx-auto text-purple-400 mb-3" size={32} />
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Ready to Discover?</h3>
            <p className="text-slate-300 text-xs sm:text-sm">Select your favorite genres above to get personalized recommendations</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
