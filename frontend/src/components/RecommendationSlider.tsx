import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import type { Movie, TVShow } from '../services/api';

interface RecommendationSliderProps {
  items: (Movie | TVShow)[];
  type: 'movie' | 'tvshow';
  title: string;
  className?: string;
}

const RecommendationSlider: React.FC<RecommendationSliderProps> = ({
  items,
  type,
  title,
  className = ''
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200; // width of small card + gap
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with title and navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 bg-slate-800/50 hover:bg-slate-700/50 border border-purple-500/20 hover:border-purple-500/40 rounded-lg transition-all duration-300"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} className="text-purple-400" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 bg-slate-800/50 hover:bg-slate-700/50 border border-purple-500/20 hover:border-purple-500/40 rounded-lg transition-all duration-300"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} className="text-purple-400" />
          </button>
        </div>
      </div>

      {/* Scrollable container */}
      <div className="relative">        <div
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {items.map((item) => (
            <div key={item.show_id} className="flex-none">
              <MovieCard
                item={item}
                type={type}
                size="small"
                className="w-48 h-72"
              />
            </div>
          ))}
        </div>
        
        {/* Fade gradient on the right */}
        <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-slate-900 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default RecommendationSlider;
