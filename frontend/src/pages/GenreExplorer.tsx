import React, { useState, useEffect } from 'react';
import { Grid3X3, Film, Tv, TrendingUp, Crown, Star, Award } from 'lucide-react';
import { apiService } from '../services/api';
import type { Genre } from '../services/api';

const GenreExplorer: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'total_count' | 'movie_count' | 'tvshow_count'>('name');
  const [hideTVShowOnly, setHideTVShowOnly] = useState(false);  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const genresData = await apiService.getGenres({ hideTVShowOnly });
        console.log('Genres data received:', genresData);
        
        // Ensure genresData is an array
        if (Array.isArray(genresData)) {
          setGenres(genresData);
        } else if (genresData && typeof genresData === 'object' && 'genres' in genresData && Array.isArray((genresData as any).genres)) {
          setGenres((genresData as any).genres);
        } else {
          console.error('Genres data is not an array:', genresData);
          setGenres([]);
        }
      } catch (error) {
        console.error('Failed to fetch genres:', error);
        setGenres([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGenres();
  }, [hideTVShowOnly]);const sortedGenres = Array.isArray(genres) ? [...genres].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'total_count':
        return b.total_count - a.total_count;
      case 'movie_count':
        return b.movie_count - a.movie_count;
      case 'tvshow_count':
        return b.tvshow_count - a.tvshow_count;
      default:
        return 0;
    }
  }) : [];

  const getGenreColor = (index: number) => {
    const colors = [
      'from-purple-600 to-pink-600',
      'from-blue-600 to-purple-600',
      'from-green-600 to-blue-600',
      'from-yellow-600 to-orange-600',
      'from-red-600 to-pink-600',
      'from-indigo-600 to-purple-600',
      'from-teal-600 to-green-600',
      'from-orange-600 to-red-600',
    ];
    return colors[index % colors.length];
  };

  // Function to determine popularity indicator based on relative ranking
  const getPopularityIndicator = (genre: Genre, allGenres: Genre[]) => {
    if (allGenres.length === 0) return null;
    
    // Sort genres by total_count to find percentile ranking
    const sortedByCount = [...allGenres].sort((a, b) => b.total_count - a.total_count);
    const genreRank = sortedByCount.findIndex(g => g.id === genre.id) + 1;
    const percentile = (genreRank / sortedByCount.length) * 100;
    
    // Top 10% = Trending (with Crown icon)
    if (percentile <= 10) {
      return (
        <div className="flex items-center space-x-1 text-xs text-yellow-400">
          <Crown size={12} />
          <span>Trending Genre</span>
        </div>
      );
    }
    
    // Top 25% = Popular (with TrendingUp icon)  
    if (percentile <= 25) {
      return (
        <div className="flex items-center space-x-1 text-xs text-purple-400">
          <TrendingUp size={12} />
          <span>Popular Genre</span>
        </div>
      );
    }
    
    // Top 50% = Well-Known (with Star icon)
    if (percentile <= 50) {
      return (
        <div className="flex items-center space-x-1 text-xs text-blue-400">
          <Star size={12} />
          <span>Well-Known</span>
        </div>
      );
    }
    
    // Bottom 50% = Niche (with Award icon for specialty content)
    return (
      <div className="flex items-center space-x-1 text-xs text-green-400">
        <Award size={12} />
        <span>Niche Genre</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Genre Explorer
        </h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Discover content by genre. Explore our comprehensive collection organized by categories.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-12 h-12 rounded-lg flex items-center justify-center">
              <Grid3X3 className="text-white" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{genres.length}</p>
              <p className="text-slate-400">Total Genres</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/20">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center">
              <Film className="text-white" size={24} />
            </div>
            <div>              <p className="text-2xl font-bold text-white">
                {genres.reduce((sum, genre) => sum + (Number(genre.movie_count) || 0), 0).toLocaleString()}
              </p>
              <p className="text-slate-400">Total Movies</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-6 border border-green-500/20">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 w-12 h-12 rounded-lg flex items-center justify-center">
              <Tv className="text-white" size={24} />
            </div>
            <div>              <p className="text-2xl font-bold text-white">
                {genres.reduce((sum, genre) => sum + (Number(genre.tvshow_count) || 0), 0).toLocaleString()}
              </p>
              <p className="text-slate-400">Total TV Shows</p>
            </div>
          </div>
        </div>
      </div>      
      
      {/* Genre Insights */}
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Genre Insights
        </h3>
      <div className="bg-gradient-to-r from-slate-800/50 to-purple-900/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">

        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-white">Most Popular Genre</h4>
            <p className="text-slate-300">
              {sortedGenres.sort((a, b) => b.total_count - a.total_count)[0]?.name || 'N/A'}
            </p>
            <p className="text-sm text-slate-400">
              {sortedGenres.sort((a, b) => b.total_count - a.total_count)[0]?.total_count.toLocaleString()} items
            </p>
          </div>          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-white">Movie-Heavy Genre</h4>
            <p className="text-slate-300">
              {sortedGenres.sort((a, b) => Number(b.movie_count) - Number(a.movie_count))[0]?.name || 'N/A'}
            </p>
            <p className="text-sm text-slate-400">
              {Number(sortedGenres.sort((a, b) => Number(b.movie_count) - Number(a.movie_count))[0]?.movie_count || 0).toLocaleString()} movies
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-white">TV Show Leader</h4>
            <p className="text-slate-300">
              {sortedGenres.sort((a, b) => Number(b.tvshow_count) - Number(a.tvshow_count))[0]?.name || 'N/A'}
            </p>
            <p className="text-sm text-slate-400">
              {Number(sortedGenres.sort((a, b) => Number(b.tvshow_count) - Number(a.tvshow_count))[0]?.tvshow_count || 0).toLocaleString()} shows
            </p>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-semibold text-white">All Genres</h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Filter Toggle */}
          <label className="flex items-center space-x-2 text-white">
            <input
              type="checkbox"
              checked={hideTVShowOnly}
              onChange={(e) => setHideTVShowOnly(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm">Hide TV-only genres</span>
          </label>
          
          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="name">Sort by Name</option>
            <option value="total_count">Sort by Total Content</option>
            <option value="movie_count">Sort by Movies</option>
            <option value="tvshow_count">Sort by TV Shows</option>
          </select>
        </div>
      </div>

      {/* Genre Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedGenres.map((genre, index) => (
          <div
            key={genre.id}
            className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            <div className="space-y-4">
              {/* Genre Header */}
              <div className="flex items-center space-x-3">
                <div className={`bg-gradient-to-r ${getGenreColor(index)} w-12 h-12 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300`}>
                  <Grid3X3 className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {genre.name}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {genre.total_count.toLocaleString()} items
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Film size={14} className="text-purple-400" />
                    <span className="text-xs text-slate-400">Movies</span>
                  </div>                  <p className="text-lg font-semibold text-white">
                    {(genre.movie_count || 0).toLocaleString()
                  }</p>
                </div>

                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Tv size={14} className="text-purple-400" />
                    <span className="text-xs text-slate-400">TV Shows</span>
                  </div>                  <p className="text-lg font-semibold text-white">
                    {(genre.tvshow_count || 0).toLocaleString()}
                  </p>
                </div>
              </div>              {/* Content Distribution Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span title="Shows the ratio of Movies vs TV Shows in this genre">Content Distribution</span>
                  <span>{((Number(genre.movie_count) / Number(genre.total_count)) * 100).toFixed(0)}% Movies</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2" title={`${genre.movie_count} movies, ${genre.tvshow_count} TV shows`}>
                  <div
                    className={`bg-gradient-to-r ${getGenreColor(index)} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${(Number(genre.movie_count) / Number(genre.total_count)) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Movies</span>
                  <span>TV Shows</span>
                </div>
              </div>{/* Popularity Indicator */}
              {getPopularityIndicator(genre, genres)}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default GenreExplorer;
