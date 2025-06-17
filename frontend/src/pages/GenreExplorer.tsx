import React, { useState, useEffect } from 'react';
import { Grid3X3, Film, Tv, TrendingUp } from 'lucide-react';
import { apiService } from '../services/api';
import type { Genre } from '../services/api';

const GenreExplorer: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'total_count' | 'movies_count' | 'tv_shows_count'>('name');  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresData = await apiService.getGenres();
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
  }, []);
  const sortedGenres = Array.isArray(genres) ? [...genres].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'total_count':
        return b.total_count - a.total_count;
      case 'movies_count':
        return b.movie_count - a.movie_count;
      case 'tv_shows_count':
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
      <div className="text-center space-y-4 animate-fade-in">
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
            <div>
              <p className="text-2xl font-bold text-white">
                {genres.reduce((sum, genre) => sum + genre.movie_count, 0).toLocaleString()}
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
            <div>
              <p className="text-2xl font-bold text-white">
                {genres.reduce((sum, genre) => sum + genre.tvshow_count, 0).toLocaleString()}
              </p>
              <p className="text-slate-400">Total TV Shows</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-semibold text-white">All Genres</h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          <option value="name">Sort by Name</option>
          <option value="total_count">Sort by Total Content</option>
          <option value="movies_count">Sort by Movies</option>
          <option value="tv_shows_count">Sort by TV Shows</option>
        </select>
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
                    {(genre.movie_count || 0).toLocaleString()}
                  </p>
                </div>

                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Tv size={14} className="text-purple-400" />
                    <span className="text-xs text-slate-400">TV Shows</span>
                  </div>                  <p className="text-lg font-semibold text-white">
                    {(genre.tvshow_count || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Content Distribution</span>                  <span>{((genre.movie_count / genre.total_count) * 100).toFixed(0)}% Movies</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${getGenreColor(index)} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${(genre.movie_count / genre.total_count) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Popularity Indicator */}
              {genre.total_count > 100 && (
                <div className="flex items-center space-x-1 text-xs text-purple-400">
                  <TrendingUp size={12} />
                  <span>Popular Genre</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Genre Insights */}
      <div className="bg-gradient-to-r from-slate-800/50 to-purple-900/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Genre Insights
        </h3>
        
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
              {sortedGenres.sort((a, b) => b.movie_count - a.movie_count)[0]?.name || 'N/A'}
            </p>
            <p className="text-sm text-slate-400">
              {sortedGenres.sort((a, b) => b.movie_count - a.movie_count)[0]?.movie_count.toLocaleString()} movies
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-white">TV Show Leader</h4>
            <p className="text-slate-300">
              {sortedGenres.sort((a, b) => b.tvshow_count - a.tvshow_count)[0]?.name || 'N/A'}
            </p>
            <p className="text-sm text-slate-400">
              {sortedGenres.sort((a, b) => b.tvshow_count - a.tvshow_count)[0]?.tvshow_count.toLocaleString()} shows
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenreExplorer;
