import React from 'react';
import { Heart, Github, Code } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900/90 backdrop-blur-sm border-t border-purple-500/20 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              🎬 CineHub
            </h3>
            <p className="text-slate-400 text-sm">
              Your personal movie and TV show recommendation engine. Discover new content
              based on advanced analytics and machine learning algorithms.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Features</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>• Smart Recommendations</li>
              <li>• Advanced Search & Filters</li>
              <li>• Genre Analytics</li>
              <li>• Content Discovery</li>
              <li>• Trending Analysis</li>
            </ul>
          </div>

          {/* Tech */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Built With</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">React</span>
              <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">TypeScript</span>
              <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">Tailwind</span>
              <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">Node.js</span>
              <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">PostgreSQL</span>
              <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">MongoDB</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <span>Made with</span>
              <Heart size={16} className="text-red-500" />
              <span>for movie lovers</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
              >
                <Github size={16} />
                <span className="text-sm">GitHub</span>
              </a>
              <div className="flex items-center space-x-2 text-slate-400">
                <Code size={16} />
                <span className="text-sm">© 2025 CineHub</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
