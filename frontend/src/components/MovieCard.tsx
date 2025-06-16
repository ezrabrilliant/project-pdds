import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Tv } from 'lucide-react';
import { useTMDBPoster } from '../hooks/useTMDBPoster';
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
    
    // Get TMDB poster
    const { posterUrl, isLoading } = useTMDBPoster({
        title: item.title,
        year: item.release_year,
        type: isMovie ? 'movie' : 'tv'
    });    // Size variants - untuk slider gunakan width tetap, untuk grid gunakan full width
    const sizeClasses = {
        small: 'w-40',
        medium: 'w-full max-w-sm',  // Responsive untuk grid
        large: 'w-full max-w-md'
    };

    const iconSizeClasses = {
        small: 16,
        medium: 20,
        large: 24
    };    return (
        <Link
            to={linkPath}
            className={`group bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105 flex flex-col overflow-hidden ${sizeClasses[size]} ${className}`}
        >{/* Poster */}            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center border-b border-purple-500/10 aspect-[1/1.5] relative overflow-hidden">
                {/* TMDB Poster Image */}
                {posterUrl ? (
                    <img 
                        src={posterUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="text-center text-slate-400">
                        {isLoading ? (
                            <div className="animate-pulse">
                                <div className="w-8 h-8 bg-slate-400/20 rounded mb-2 mx-auto"></div>
                                <p className={`${size === 'small' ? 'text-xs' : 'text-sm'}`}>Loading...</p>
                            </div>
                        ) : (
                            <>
                                {isMovie ? (
                                    <Star size={iconSizeClasses[size]} className="mx-auto mb-1" />
                                ) : (
                                    <Tv size={iconSizeClasses[size]} className="mx-auto mb-1" />
                                )}
                                <p className={`${size === 'small' ? 'text-xs' : 'text-sm'}`}>
                                    {isMovie ? 'Movie' : 'TV Show'} Poster
                                </p>
                            </>
                        )}
                    </div>
                )}

                {/* Rating - Pojok Kiri Atas */}
                <div className="absolute top-1 left-1 bg-black/20 backdrop-blur-md rounded px-1.5 py-0.5">
                    <span className="text-white text-xs font-semibold">
                        ⭐ {(() => {
                            const rating = (item as any).vote_average || (item as any).rating;
                            if (!rating || rating === 'N/A') return 'N/A';
                            const numRating = parseFloat(rating);
                            return isNaN(numRating) ? 'N/A' : numRating.toFixed(1);
                        })()}
                    </span>
                </div>                {/* Tahun Rilis - Pojok Kanan Atas */}
                <div className="absolute top-1 right-1 bg-black/20 backdrop-blur-md rounded px-1.5 py-0.5">
                    <span className="text-white text-xs font-semibold">{item.release_year}</span>
                </div>
            </div>

            {/* Content */}
            <div className={`flex-1 flex flex-col ${size === 'small' ? 'p-2' : 'p-4'}`}><h3 className={`font-semibold text-white group-hover:text-purple-300 transition-colors ${size === 'small' ? 'text-sm line-clamp-1 mb-1' : size === 'medium' ? 'text-lg line-clamp-2 mb-2' : 'text-xl line-clamp-2 mb-2'
                }`}>
                {item.title}
            </h3>
                <p className={`text-slate-400 ${size === 'small' ? 'text-xs line-clamp-1 mb-2' : 'text-sm line-clamp-3 flex-1 mb-3'
                    }`}>
                    {item.description}
                </p>          {/* Meta info */}
                <div className={`mt-auto ${size === 'small' ? 'space-y-1' : 'space-y-2'}`}>
                    {/* Duration hanya untuk TV Shows */}
                    {!isMovie && (
                        <div className={`flex items-center space-x-1 text-slate-500 ${size === 'small' ? 'text-xs' : 'text-sm'
                            }`}>
                            <Tv size={size === 'small' ? 12 : 14} />
                            <span>{(item as TVShow).duration}</span>
                        </div>
                    )}

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
                                    className={`bg-slate-700/50 rounded text-slate-400 ${size === 'small' ? 'px-1 py-0.5 text-xs' : 'px-2 py-1 text-xs'
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
