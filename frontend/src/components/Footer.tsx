import React from 'react';
import { Heart, Github, Code } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900/90 backdrop-blur-sm border-t border-purple-500/20 mt-12 sm:mt-16">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              🎬 CineHub
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              Your personal movie and TV show recommendation engine. Discover new content
              based on advanced analytics and machine learning algorithms.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-semibold text-white">Features</h4>
            <ul className="space-y-1 sm:space-y-2 text-slate-400 text-xs sm:text-sm">
              <li>• Smart Recommendations</li>
              <li>• Advanced Search & Filters</li>
              <li>• Genre Analytics</li>
              <li>• Content Discovery</li>
              <li>• Trending Analysis</li>
            </ul>
          </div>

          {/* Tech */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left sm:col-span-2 lg:col-span-1">
            <h4 className="text-base sm:text-lg font-semibold text-white">Built With</h4>
            <div className="flex flex-wrap gap-1 sm:gap-2 justify-center sm:justify-start">
              <span className="px-2 sm:px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">React</span>
              <span className="px-2 sm:px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">TypeScript</span>
              <span className="px-2 sm:px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">Tailwind</span>
              <span className="px-2 sm:px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">Node.js</span>
              <span className="px-2 sm:px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">PostgreSQL</span>
              <span className="px-2 sm:px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">MongoDB</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-6 sm:mt-8 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2 text-slate-400 text-xs sm:text-sm">
              <span>Kelompok PDDS Group D</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <a
                href="https://github.com"
                className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
              >
                <Github size={14} />
                <span className="text-xs sm:text-sm">GitHub</span>
              </a>
              <div className="flex items-center space-x-2 text-slate-400">
                <Code size={14} />
                <span className="text-xs sm:text-sm">© 2025 CineHub</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
