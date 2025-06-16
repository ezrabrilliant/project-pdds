import React from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import type { TMDBCastMember } from '../services/tmdb';

interface CastSliderProps {
  cast: TMDBCastMember[];
  title?: string;
}

const CastSlider: React.FC<CastSliderProps> = ({ cast, title = "Cast" }) => {
  const scrollLeft = () => {
    const container = document.getElementById('cast-slider-container');
    if (container) {
      container.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('cast-slider-container');
    if (container) {
      container.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  if (!cast || cast.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <User size={20} className="text-purple-400" />
          <span>{title}</span>
        </h3>
        
        <div className="flex space-x-2">
          <button
            onClick={scrollLeft}
            className="p-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 text-purple-400 hover:text-white hover:bg-purple-600/20 transition-all duration-300"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={scrollRight}
            className="p-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 text-purple-400 hover:text-white hover:bg-purple-600/20 transition-all duration-300"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        id="cast-slider-container"
        className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {cast.map((actor) => (
          <div
            key={actor.id}
            className="flex-none w-32 space-y-2"
          >
            {/* Actor Photo */}
            <div className="aspect-square rounded-full overflow-hidden bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/20">
              {actor.profile_path ? (
                <img
                  src={tmdbService.getProfileUrl(actor.profile_path, 'w185') || ''}
                  alt={actor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center ${actor.profile_path ? 'hidden' : ''}`}>
                <User size={32} className="text-slate-400" />
              </div>
            </div>

            {/* Actor Info */}
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-white truncate" title={actor.name}>
                {actor.name}
              </p>
              <p className="text-xs text-slate-400 truncate" title={actor.character}>
                {actor.character}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CastSlider;
