import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, Database, Star, Film, Tv, Sparkles, BarChart3 } from 'lucide-react';
import { apiService } from '../services/api';

const Home: React.FC = () => {
  const [stats, setStats] = useState({
    moviesCount: 0,
    tvShowsCount: 0,
    genresCount: 0,
    totalContent: 0
  });

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
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            🎬 CineHub
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover your next cinematic adventure with our intelligent recommendation system
            powered by advanced analytics and machine learning algorithms.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link 
              to="/movies"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 flex items-center justify-center"
            >
              <Film className="mr-2" size={20} />
              Explore Movies
            </Link>
            <Link 
              to="/analytics"
              className="px-8 py-4 bg-slate-700/50 border border-purple-500/30 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:bg-slate-600/50 flex items-center justify-center"
            >
              <BarChart3 className="mr-2" size={20} />
              View Analytics
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
            <Search className="text-white" size={28} />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-white">Smart Search</h3>
          <p className="text-slate-400 leading-relaxed">
            Find movies and TV shows with advanced filtering by genre, rating, year, and more.
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
            <Sparkles className="text-white" size={28} />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-white">AI Recommendations</h3>
          <p className="text-slate-400 leading-relaxed">
            Get personalized recommendations using cosine similarity and genre-based algorithms.
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
            <TrendingUp className="text-white" size={28} />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-white">Data Analytics</h3>
          <p className="text-slate-400 leading-relaxed">
            Explore trends, ratings distribution, and comprehensive content insights.
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
            <Database className="text-white" size={28} />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-white">Quality Data</h3>
          <p className="text-slate-400 leading-relaxed">
            Comprehensive database with smart handling of missing data and quality scoring.
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-gradient-to-r from-slate-800/50 to-purple-900/30 backdrop-blur-sm rounded-2xl p-10 border border-purple-500/20">
        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Content Library
        </h2>
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {stats.moviesCount.toLocaleString()}
            </div>
            <div className="text-slate-400 font-medium">Movies Available</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {stats.tvShowsCount.toLocaleString()}
            </div>
            <div className="text-slate-400 font-medium">TV Shows Available</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {stats.genresCount}+
            </div>
            <div className="text-slate-400 font-medium">Genres Covered</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {stats.totalContent.toLocaleString()}
            </div>
            <div className="text-slate-400 font-medium">Total Content</div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          to="/tv-shows"
          className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-12 h-12 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
              <Tv className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">TV Shows</h3>
              <p className="text-slate-400 text-sm">Browse series collection</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/recommendations"
          className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-12 h-12 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
              <Star className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Get Recommendations</h3>
              <p className="text-slate-400 text-sm">AI-powered suggestions</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/genres"
          className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105 md:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-12 h-12 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
              <Database className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Explore Genres</h3>
              <p className="text-slate-400 text-sm">Discover by category</p>
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
};

export default Home;
