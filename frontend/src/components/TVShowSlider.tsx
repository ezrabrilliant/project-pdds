import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCardEnhanced from './MovieCardEnhanced';
import type { TVShow } from '../services/api';

interface TVShowSliderProps {
  items: TVShow[];
  title: string;
  className?: string;
}

const TVShowSlider: React.FC<TVShowSliderProps> = ({
  items,
  title,
  className = ''
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 176; // width of small card (w-40 = 160px) + gap (16px)
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
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >          {items.map((item) => (
            <div key={item.show_id} className="flex-none">
              <MovieCardEnhanced
                item={item}
                type="tvshow"
                size="small"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TVShowSlider;
