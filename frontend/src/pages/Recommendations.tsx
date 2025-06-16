import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Film, Tv, Heart } from 'lucide-react';
import { apiService } from '../services/api';
import MovieCard from '../components/MovieCard';
import type { Movie, TVShow, Genre } from '../services/api';

const Recommendations: React.FC = () => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [contentType, setContentType] = useState<'movies' | 'tvshows'>('movies');
  const [recommendations, setRecommendations] = useState<(Movie | TVShow)[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
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
  };

  const getRecommendations = async () => {
    if (selectedGenres.length === 0) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const recs = await apiService.getRecommendationsByGenres(
        selectedGenres,
        contentType,
        12
      );
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedGenres([]);
    setRecommendations([]);
    setHasSearched(false);  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center justify-center space-x-3">
          <Sparkles size={32} className="text-purple-400" />
          <span>AI Recommendations</span>
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Get personalized recommendations based on your favorite genres using our advanced AI algorithms
        </p>
      </div>

      {/* Genre Selection */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
        <div className="space-y-4">
          {/* Content Type Selection */}
          <div className="flex justify-center">
            <div className="flex bg-slate-700/50 rounded-xl p-1">
              <button
                onClick={() => setContentType('movies')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                  contentType === 'movies'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Film size={20} />
                <span>Movies</span>
              </button>
              <button
                onClick={() => setContentType('tvshows')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                  contentType === 'tvshows'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Tv size={20} />
                <span>TV Shows</span>
              </button>
            </div>
          </div>

          {/* Genre Selection */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <Heart className="text-pink-400" size={24} />
              <span>Select Your Favorite Genres</span>
            </h3>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {genres.slice(0, 16).map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreToggle(genre.name)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    selectedGenres.includes(genre.name)
                      ? 'border-purple-500 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white'
                      : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-purple-500/50 hover:bg-slate-600/30'
                  }`}
                >
                  <div className="font-semibold">{genre.name}</div>
                  <div className="text-sm text-slate-400">
                    {genre.total_count.toLocaleString()} items
                  </div>
                </button>
              ))}
            </div>
          </div>          {/* Action Buttons */}
          <div className="flex justify-center space-x-3">
            <button
              onClick={getRecommendations}
              disabled={selectedGenres.length === 0 || loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <Sparkles size={18} />
              <span>{loading ? 'Getting Recommendations...' : 'Get Recommendations'}</span>
            </button>
              {selectedGenres.length > 0 && (
              <button
                onClick={clearSelection}
                className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-300 hover:text-white hover:bg-slate-600/50 transition-colors"
              >
                Clear Selection
              </button>
            )}
          </div>

          {/* Selected Genres Display */}
          {selectedGenres.length > 0 && (
            <div className="text-center">
              <p className="text-slate-300 mb-2">Selected genres:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {selectedGenres.map((genre, index) => (
                  <span key={index} className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-sm text-purple-300">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm">Finding perfect recommendations for you...</p>
        </div>
      )}

      {/* Recommendations Results */}
      {!loading && recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-purple-400" size={24} />
            <h2 className="text-xl font-semibold text-white">
              Recommended {contentType === 'movies' ? 'Movies' : 'TV Shows'} for You
            </h2>
          </div><div className="grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {recommendations.map((item) => (
              <MovieCard
                key={item.show_id}
                item={item}
                type={'duration_minutes' in item ? 'movie' : 'tvshow'}
                size="small"
              />
            ))}
          </div>
        </div>
      )}      {/* No Results */}
      {!loading && hasSearched && recommendations.length === 0 && (
        <div className="text-center py-8">
          <Sparkles className="mx-auto text-slate-500 mb-3" size={40} />
          <h3 className="text-lg font-semibold text-slate-400 mb-1">No recommendations found</h3>
          <p className="text-slate-500 text-sm">Try selecting different genres or content type</p>
        </div>
      )}

      {/* Getting Started */}
      {!hasSearched && (
        <div className="text-center py-8">
          <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl p-6 border border-purple-500/20">
            <Sparkles className="mx-auto text-purple-400 mb-3" size={40} />
            <h3 className="text-lg font-semibold text-white mb-1">Ready to Discover?</h3>
            <p className="text-slate-300 text-sm">Select your favorite genres above to get personalized recommendations</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
