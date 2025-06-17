import React, { useState, useEffect } from 'react';
import { BarChart3, Star, Film, Tv, Globe } from 'lucide-react';
import { apiService } from '../services/api';

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await apiService.getAnalytics();
        console.log('Analytics response:', response); // Debug log
        setAnalytics(response.data || response); // Handle both wrapped and unwrapped responses
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center justify-center space-x-3">
          <BarChart3 size={40} className="text-purple-400" />
          <span>Analytics Dashboard</span>
        </h1>
        <p className="text-slate-300 text-lg">
          Comprehensive insights into our content library and trends
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/20 animate-slide-up animate-stagger-1">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-12 h-12 rounded-lg flex items-center justify-center">
              <Film className="text-white" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {analytics?.totalMovies?.toLocaleString() || '0'}
              </p>
              <p className="text-slate-400">Total Movies</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/20 animate-slide-up animate-stagger-2">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center">
              <Tv className="text-white" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {analytics?.totalTVShows?.toLocaleString() || '0'}
              </p>
              <p className="text-slate-400">Total TV Shows</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-6 border border-green-500/20 animate-slide-up animate-stagger-3">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 w-12 h-12 rounded-lg flex items-center justify-center">
              <Globe className="text-white" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {analytics?.totalCountries || '0'}
              </p>
              <p className="text-slate-400">Countries</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl p-6 border border-yellow-500/20 animate-slide-up animate-stagger-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 w-12 h-12 rounded-lg flex items-center justify-center">
              <Star className="text-white" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {analytics?.totalGenres || '0'}
              </p>
              <p className="text-slate-400">Genres</p>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Analytics Display */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 animate-scale-in">
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Content Overview
        </h3>
        
        <div className="text-center py-16 text-slate-400">
          <BarChart3 size={48} className="mx-auto mb-4 text-purple-400 animate-pulse-subtle" />
          <h4 className="text-xl font-semibold text-white mb-2">Analytics Dashboard</h4>
          <p>Detailed analytics and charts will be displayed here</p>
          <p className="text-sm mt-2">Connected to real-time data from {analytics?.totalMovies || 0} movies and {analytics?.totalTVShows || 0} TV shows</p>
        </div>

        
      </div>
    </div>
  );
};

export default Analytics;
