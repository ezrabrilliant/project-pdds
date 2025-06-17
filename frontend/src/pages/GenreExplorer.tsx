import React, { useState, useEffect } from 'react';
import { Grid3X3, Film, Tv, TrendingUp } from 'lucide-react';
import { apiService } from '../services/api';
import type { Genre } from '../services/api';

const GenreExplorer: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'total_count' | 'movies_count' | 'tv_shows_count'>('name'); useEffect(() => {
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


      {/* Genre Insights */}
      <div className="bg-gradient-to-r from-slate-800/50 to-purple-900/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
        <h3 className="text-2xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          📊 Genre Analytics Dashboard
        </h3>

        {/* Top Performers */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span>👑 Most Popular Genre</span>
            </h4>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <p className="text-xl font-bold text-amber-400">
                {sortedGenres.sort((a, b) => b.total_count - a.total_count)[0]?.name || 'N/A'}
              </p>
              <p className="text-sm text-slate-400">
                {sortedGenres.sort((a, b) => b.total_count - a.total_count)[0]?.total_count.toLocaleString()} total items
              </p>
              <div className="mt-2 w-full bg-slate-600 rounded-full h-2">
                <div className="bg-gradient-to-r from-amber-400 to-yellow-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>🎬 Most Popular Movie</span>
            </h4>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <p className="text-xl font-bold text-red-400">
                {sortedGenres.sort((a, b) => b.movie_count - a.movie_count)[0]?.name || 'N/A'}
              </p>
              <p className="text-sm text-slate-400">
                {sortedGenres.sort((a, b) => b.movie_count - a.movie_count)[0]?.movie_count.toLocaleString()} movies
              </p>
              <div className="mt-2 w-full bg-slate-600 rounded-full h-2">
                <div className="bg-gradient-to-r from-red-400 to-pink-500 h-2 rounded-full" style={{
                  width: `${Math.min(100, (sortedGenres.sort((a, b) => b.movie_count - a.movie_count)[0]?.movie_count || 0) / (sortedGenres.sort((a, b) => b.total_count - a.total_count)[0]?.total_count || 1) * 100)}%`
                }}></div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
              <span>📺 Most Popular Series</span>
            </h4>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <p className="text-xl font-bold text-indigo-400">
                {sortedGenres.sort((a, b) => b.tvshow_count - a.tvshow_count)[0]?.name || 'N/A'}
              </p>
              <p className="text-sm text-slate-400">
                {sortedGenres.sort((a, b) => b.tvshow_count - a.tvshow_count)[0]?.tvshow_count.toLocaleString()} shows
              </p>
              <div className="mt-2 w-full bg-slate-600 rounded-full h-2">
                <div className="bg-gradient-to-r from-indigo-400 to-blue-500 h-2 rounded-full" style={{
                  width: `${Math.min(100, (sortedGenres.sort((a, b) => b.tvshow_count - a.tvshow_count)[0]?.tvshow_count || 0) / (sortedGenres.sort((a, b) => b.total_count - a.total_count)[0]?.total_count || 1) * 100)}%`
                }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Distribution Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>📈 Content Distribution</span>
            </h4>
            <div className="space-y-3">
              {sortedGenres.slice(0, 5).map((genre, index) => {
                const maxCount = sortedGenres[0]?.total_count || 1;
                const percentage = (genre.total_count / maxCount) * 100;
                return (
                  <div key={genre.id} className="flex items-center space-x-3">
                    <div className="w-20 text-sm text-slate-400 truncate">{genre.name}</div>
                    <div className="flex-1 bg-slate-600 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${getGenreColor(index)} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-400 w-12 text-right">{genre.total_count}</div>
                  </div>
                );
              })}
            </div>
          </div>          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>⚖️ Balance Score</span>
            </h4>
            <div className="space-y-3">
              {(() => {
                // Create a sorted list specifically for balance score
                const genresWithBalance = genres
                  .filter(genre => genre.total_count >= 20)
                  .map(genre => {
                    const movieRatio = genre.movie_count / genre.total_count;
                    const balanceScore = 100 - Math.abs(50 - (movieRatio * 100)) * 2;
                    return { ...genre, balanceScore };
                  })
                  .sort((a, b) => b.balanceScore - a.balanceScore)
                  .slice(0, 5);                return genresWithBalance.map((genre, index) => {
                  // Different colors for each rank
                  const rankColors = [
                    'bg-gradient-to-r from-amber-400 to-yellow-500',     // #1 - Gold
                    'bg-gradient-to-r from-purple-400 to-pink-500',     // #2 - Purple-Pink
                    'bg-gradient-to-r from-blue-400 to-cyan-500',       // #3 - Blue-Cyan
                    'bg-gradient-to-r from-green-400 to-emerald-500',   // #4 - Green
                    'bg-gradient-to-r from-orange-400 to-red-500'       // #5 - Orange-Red
                  ];
                    return (
                    <div key={genre.id} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 w-24">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' :
                          index === 1 ? 'bg-gradient-to-r from-purple-400 to-pink-500' :
                          index === 2 ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                          index === 3 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                          'bg-gradient-to-r from-orange-400 to-red-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="text-sm text-slate-400 truncate flex-1">{genre.name}</div>
                      </div>
                      <div className="flex-1 bg-slate-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${rankColors[index] || 'bg-gradient-to-r from-slate-400 to-slate-500'}`}
                          style={{ width: `${genre.balanceScore}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-slate-400 w-12 text-right">{Math.round(genre.balanceScore)}%</div>
                    </div>
                  );
                });
              })()}
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
              </div>              {/* Popularity Indicator */}
              <div className="flex items-center justify-between">
                {(() => {
                  const totalItems = genre.total_count;

                  // Adjusted thresholds to be more realistic
                  if (totalItems >= 2000) {
                    return (
                      <div className="flex items-center space-x-1 text-xs text-amber-400">
                        <TrendingUp size={12} />
                        <span>🔥 Mega Popular</span>
                      </div>
                    );
                  } else if (totalItems >= 1000) {
                    return (
                      <div className="flex items-center space-x-1 text-xs text-green-400">
                        <TrendingUp size={12} />
                        <span>⭐ Very Popular</span>
                      </div>
                    );
                  } else if (totalItems >= 500) {
                    return (
                      <div className="flex items-center space-x-1 text-xs text-purple-400">
                        <TrendingUp size={12} />
                        <span>📈 Popular</span>
                      </div>
                    );
                  } else if (totalItems >= 200) {
                    return (
                      <div className="flex items-center space-x-1 text-xs text-blue-400">
                        <TrendingUp size={12} />
                        <span>📊 Growing</span>
                      </div>
                    );
                  } else if (totalItems >= 50) {
                    return (
                      <div className="flex items-center space-x-1 text-xs text-cyan-400">
                        <TrendingUp size={12} />
                        <span>🌱 Emerging</span>
                      </div>
                    );
                  } else if (totalItems >= 10) {
                    return (
                      <div className="flex items-center space-x-1 text-xs text-slate-400">
                        <TrendingUp size={12} />
                        <span>💎 Niche</span>
                      </div>
                    );
                  } else {
                    return (
                      <div className="flex items-center space-x-1 text-xs text-orange-400">
                        <TrendingUp size={12} />
                        <span>🔍 Rare</span>
                      </div>
                    );
                  }
                })()}
                {/* Content Type Indicator - positioned on the right */}
                {(() => {
                  const movieRatio = genre.movie_count / genre.total_count;

                  if (movieRatio >= 0.8) {
                    return (
                      <div className="flex items-center space-x-1 text-xs text-red-400">
                        <Film size={10} />
                        <span>🎬 Movie</span>
                      </div>
                    );
                  } else if (movieRatio <= 0.2) {
                    return (
                      <div className="flex items-center space-x-1 text-xs text-indigo-400">
                        <Tv size={10} />
                        <span>📺 TV</span>
                      </div>
                    );
                  } else if (movieRatio >= 0.4 && movieRatio <= 0.6) {
                    return (
                      <div className="flex items-center space-x-1 text-xs text-pink-400">
                        <Grid3X3 size={10} />
                        <span>⚖️ Mixed</span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>      
      
    </div>
  );
};

export default GenreExplorer;
