import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, Database, Star, Film, Tv, Sparkles, BarChart3, Wifi } from 'lucide-react';
import { apiService } from '../services/api';

const Home: React.FC = () => {
  const [stats, setStats] = useState({
    moviesCount: 0,
    tvShowsCount: 0,
    genresCount: 0,
    totalContent: 0
  });

  const handleSearchClick = () => {
    // Focus pada search input di navbar
    const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [moviesResponse, tvShowsResponse, genresResponse] = await Promise.all([
          apiService.getMovies({ limit: 1 }),
          apiService.getTVShows({ limit: 1 }),          apiService.getGenres()
        ]);

        console.log('Movies response:', moviesResponse);
        console.log('TVShows response:', tvShowsResponse);
        console.log('Genres response:', genresResponse);
        
        // Handle wrapped response structure
        const moviesData = (moviesResponse as any).data || moviesResponse;
        const tvShowsData = (tvShowsResponse as any).data || tvShowsResponse;
        const genresData = (genresResponse as any).data || genresResponse;

        setStats({
          moviesCount: moviesData.pagination?.total || 0,
          tvShowsCount: tvShowsData.pagination?.total || 0,
          genresCount: Array.isArray(genresData) ? genresData.length : 0,
          totalContent: (moviesData.pagination?.total || 0) + (tvShowsData.pagination?.total || 0)
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Set dummy data for demo
        setStats({
          moviesCount: 8807,
          tvShowsCount: 2676,
          genresCount: 42,
          totalContent: 11483
        });
      }
    };

    fetchStats();
  }, []);  return (
    <div className="space-y-8 sm:space-y-12 lg:space-y-16">
      {/* Connection Test Section */}

      {/* Hero Section */}
      <section className="text-center py-12 sm:py-16 lg:py-20 relative animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-3xl animate-pulse-slow"></div>
        <div className="relative z-10 px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
            🎬 CineHub
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-slate-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 animate-slide-up-delayed">
            Discover your next cinematic adventure with our intelligent recommendation system
            powered by advanced analytics and machine learning algorithms.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 px-4 animate-slide-up-delayed-2">
            <Link 
              to="/movies"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 flex items-center justify-center text-sm sm:text-base"
            >
              <Film className="mr-2" size={20} />
              Explore Movies
            </Link>
            <Link 
              to="/analytics"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-slate-700/50 border border-purple-500/30 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:bg-slate-600/50 flex items-center justify-center text-sm sm:text-base"
            >
              <BarChart3 className="mr-2" size={20} />
              View Analytics
            </Link>
          </div>
        </div>
      </section>      {/* Features Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 px-4 animate-stagger-in">
        <button 
          onClick={handleSearchClick}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 md:p-5 text-center border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105 animate-fade-in-up group cursor-pointer"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg shadow-purple-500/25 animate-bounce-subtle group-hover:shadow-purple-500/40 transition-all">
            <Search className="text-white" size={18} />
          </div>
          <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 text-white group-hover:text-purple-300 transition-colors">Search</h3>
          <p className="text-slate-400 leading-relaxed text-xs sm:text-sm group-hover:text-slate-300 transition-colors">
            Focus on search bar to find content quickly.
          </p>
        </button>

        <Link 
          to="/recommendations"
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 md:p-5 text-center border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all">
            <Sparkles className="text-white" size={18} />
          </div>
          <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 text-white group-hover:text-purple-300 transition-colors">Recommendations</h3>
          <p className="text-slate-400 leading-relaxed text-xs sm:text-sm group-hover:text-slate-300 transition-colors">
            Get personalized recommendations based on your favorite genres.
          </p>
        </Link>

        <Link 
          to="/analytics"
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 md:p-5 text-center border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all">
            <TrendingUp className="text-white" size={18} />
          </div>
          <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 text-white group-hover:text-purple-300 transition-colors">Analytics</h3>
          <p className="text-slate-400 leading-relaxed text-xs sm:text-sm group-hover:text-slate-300 transition-colors">
            Explore trends and content insights.
          </p>
        </Link>

        <Link 
          to="/genres"
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 md:p-5 text-center border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all">
            <Database className="text-white" size={18} />
          </div>
          <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 text-white group-hover:text-purple-300 transition-colors">Genre Explorer</h3>
          <p className="text-slate-400 leading-relaxed text-xs sm:text-sm group-hover:text-slate-300 transition-colors">
            Explore content by genre categories.
          </p>
        </Link>
      </section>

      {/* Quick Stats */}
      <section className="bg-gradient-to-r from-slate-800/50 to-purple-900/30 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-10 border border-purple-500/20 mx-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Content Library
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
          <div className="space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {stats.moviesCount.toLocaleString()}
            </div>
            <div className="text-slate-400 font-medium text-sm sm:text-base">Movies Available</div>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {stats.tvShowsCount.toLocaleString()}
            </div>
            <div className="text-slate-400 font-medium text-sm sm:text-base">TV Shows Available</div>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {stats.genresCount}+
            </div>
            <div className="text-slate-400 font-medium text-sm sm:text-base">Genres Covered</div>
          </div>
          <div className="space-y-1 sm:space-y-2">            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {stats.totalContent.toLocaleString()}
            </div>
            <div className="text-slate-400 font-medium text-sm sm:text-base">Total Content</div>
          </div>
        </div>
      </section>

      {/* Connection Test Link */}
      <section className="text-center animate-fade-in">
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-sm mb-3">Need to test backend connection?</p>
          <Link 
            to="/connection"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 hover:text-white hover:bg-slate-600/50 transition-all text-sm"
          >
            <Wifi size={16} />
            <span>Connection Test</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
