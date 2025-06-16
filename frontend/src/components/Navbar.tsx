import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, Tv, BarChart3, Sparkles, Search, Grid3X3 } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Film },
    { path: '/movies', label: 'Movies', icon: Film },
    { path: '/tv-shows', label: 'TV Shows', icon: Tv },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/genres', label: 'Genres', icon: Grid3X3 },
    { path: '/recommendations', label: 'Recommendations', icon: Sparkles },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav className="bg-slate-900/90 backdrop-blur-sm border-b border-purple-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🎬 CineHub
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  location.pathname === path
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
