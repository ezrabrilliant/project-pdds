import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wifi, Server, Database } from 'lucide-react';
import ConnectionTest from '../components/ConnectionTest';

const ConnectionPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center space-x-4 mb-6">
          <Link 
            to="/"
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
        </div>
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center justify-center space-x-3">
            <Wifi size={40} className="text-purple-400" />
            <span>Connection Test</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Test and monitor the connection between frontend and backend services
          </p>
        </div>
      </div>

      {/* Connection Test Component */}
      <div className="animate-slide-up animate-stagger-1">
        <ConnectionTest />
      </div>

      {/* Additional Information */}
      <div className="grid md:grid-cols-2 gap-6 animate-slide-up animate-stagger-2">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center space-x-3 mb-4">
            <Server className="text-blue-400" size={24} />
            <h3 className="text-xl font-semibold text-white">Backend Status</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Server:</span>
              <span className="text-white font-mono">31.57.241.234:3001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Health Endpoint:</span>
              <span className="text-white font-mono">/health</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">API Base:</span>
              <span className="text-white font-mono">/api</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Environment:</span>
              <span className="text-white">{import.meta.env.VITE_NODE_ENV || 'development'}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="text-green-400" size={24} />
            <h3 className="text-xl font-semibold text-white">API Endpoints</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300">/api/movies</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300">/api/tvshows</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300">/api/search</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300">/api/recommendations</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300">/api/analytics</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300">/api/genres</span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Testing Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 animate-scale-in">
        <h3 className="text-xl font-semibold text-white mb-4">Manual Testing Commands</h3>
        <div className="space-y-3">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-sm text-slate-400 mb-1">Test backend health:</p>
            <code className="text-green-400 text-sm font-mono">curl http://31.57.241.234:3001/health</code>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-sm text-slate-400 mb-1">Test movies API:</p>
            <code className="text-green-400 text-sm font-mono">curl http://31.57.241.234:3001/api/movies?limit=5</code>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-sm text-slate-400 mb-1">Test genres API:</p>
            <code className="text-green-400 text-sm font-mono">curl http://31.57.241.234:3001/api/genres</code>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-4 justify-center animate-fade-in">
        <Link 
          to="/movies"
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
        >
          Test Movies Page
        </Link>
        <Link 
          to="/analytics"
          className="px-6 py-3 bg-slate-700/50 border border-purple-500/30 rounded-xl text-white font-semibold hover:bg-slate-600/50 transition-all"
        >
          Test Analytics Page
        </Link>
        <Link 
          to="/search"
          className="px-6 py-3 bg-slate-700/50 border border-purple-500/30 rounded-xl text-white font-semibold hover:bg-slate-600/50 transition-all"
        >
          Test Search Page
        </Link>
      </div>
    </div>
  );
};

export default ConnectionPage;
