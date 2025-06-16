import React from 'react';
import { Search, TrendingUp, Database, Star } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
          Netflix Recommendation Hub
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Discover your next favorite movie or TV show with our intelligent recommendation system
          powered by cosine similarity and data analytics.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="btn-primary">
            <Search className="inline mr-2" size={16} />
            Explore Movies
          </button>
          <button className="btn-secondary">
            <TrendingUp className="inline mr-2" size={16} />
            View Analytics
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-white" size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Smart Search</h3>
          <p className="text-gray-400">
            Find movies and TV shows with advanced filtering by genre, rating, and year.
          </p>
        </div>

        <div className="card text-center">
          <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="text-white" size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">AI Recommendations</h3>
          <p className="text-gray-400">
            Get personalized recommendations using cosine similarity algorithms.
          </p>
        </div>

        <div className="card text-center">
          <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="text-white" size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Data Analytics</h3>
          <p className="text-gray-400">
            Explore trends, ratings distribution, and content insights.
          </p>
        </div>

        <div className="card text-center">
          <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="text-white" size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Data Quality</h3>
          <p className="text-gray-400">
            Smart handling of missing data with confidence scoring.
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-gray-800 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Quick Stats</h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-red-600 mb-2">16,000+</div>
            <div className="text-gray-400">Movies Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-600 mb-2">16,000+</div>
            <div className="text-gray-400">TV Shows Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-600 mb-2">100+</div>
            <div className="text-gray-400">Countries Covered</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
