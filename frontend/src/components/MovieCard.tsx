import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, Clock, Tv } from 'lucide-react';
import type { Movie, TVShow } from '../services/api';

interface MovieCardProps {
  item: Movie | TVShow;
  type: 'movie' | 'tvshow';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ 
  item, 
  type, 
  size = 'medium',
  className = '' 
}) => {
  const isMovie = type === 'movie';
  const linkPath = isMovie ? `/movies/${item.show_id}` : `/tv-shows/${item.show_id}`;
  
  // Size variants
  const sizeClasses = {
    small: 'w-48 h-72',
    medium: 'w-64 h-96', 
    large: 'w-72 h-[28rem]'
  };
  
  const posterSizeClasses = {
    small: 'h-32',
    medium: 'h-48',
    large: 'h-56'
  };
  
  const iconSizeClasses = {
    small: 16,
    medium: 20,
    large: 24
  };

  return (
    <Link
      to={linkPath}
      className={`group bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105 flex flex-col overflow-hidden ${sizeClasses[size]} ${className}`}
    >
      {/* Poster */}
      <div className={`bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center border-b border-purple-500/10 ${posterSizeClasses[size]}`}>
        <div className="text-center text-slate-400">
          {isMovie ? (
            <Star size={iconSizeClasses[size]} className="mx-auto mb-1" />
          ) : (
            <Tv size={iconSizeClasses[size]} className="mx-auto mb-1" />
          )}
          <p className={`${size === 'small' ? 'text-xs' : 'text-sm'}`}>
            {isMovie ? 'Movie' : 'TV Show'} Poster
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className={`font-semibold text-white group-hover:text-purple-300 transition-colors mb-2 line-clamp-2 ${
          size === 'small' ? 'text-sm' : size === 'medium' ? 'text-lg' : 'text-xl'
        }`}>
          {item.title}
        </h3>
        
        <p className={`text-slate-400 mb-3 line-clamp-3 flex-1 ${
          size === 'small' ? 'text-xs' : 'text-sm'
        }`}>
          {item.description}
        </p>
        
        {/* Meta info */}
        <div className="space-y-2 mt-auto">
          <div className={`flex justify-between items-center text-slate-500 ${
            size === 'small' ? 'text-xs' : 'text-sm'
          }`}>
            <div className="flex items-center space-x-1">
              <Calendar size={size === 'small' ? 12 : 14} />
              <span>{item.release_year}</span>
            </div>
            <div className="flex items-center space-x-1">
              {isMovie ? (
                <>
                  <Clock size={size === 'small' ? 12 : 14} />
                  <span>{(item as Movie).duration_minutes} min</span>
                </>
              ) : (
                <>
                  <Tv size={size === 'small' ? 12 : 14} />
                  <span>{(item as TVShow).duration}</span>
                </>
              )}
            </div>
          </div>
          
          {/* Genres */}
          <div className="flex flex-wrap gap-1">
            {(() => {
              const genres = item.genres as any;
              let genreArray: string[] = [];
              
              if (typeof genres === 'string') {
                genreArray = genres.split(',').map((g: string) => g.trim());
              } else if (Array.isArray(genres)) {
                genreArray = genres;
              }
              
              return genreArray.slice(0, size === 'small' ? 2 : 3).map((genre: string, index: number) => (
                <span 
                  key={index} 
                  className={`bg-slate-700/50 rounded text-slate-400 ${
                    size === 'small' ? 'px-1 py-0.5 text-xs' : 'px-2 py-1 text-xs'
                  }`}
                >
                  {genre}
                </span>
              ));
            })()}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
