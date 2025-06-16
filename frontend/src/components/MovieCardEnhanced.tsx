import React from 'react';
import { Link } from 'react-router-dom';
import { Tv, Film } from 'lucide-react';
import { useTMDBPoster } from '../hooks/useTMDBPoster';
import { useTMDBDetails } from '../hooks/useTMDBDetails';
import type { Movie, TVShow } from '../services/api';

interface MovieCardEnhancedProps {
    item: Movie | TVShow;
    type: 'movie' | 'tvshow';
    size?: 'small' | 'medium' | 'large';
    showFullDescription?: boolean;
    className?: string;
}

const MovieCardEnhanced: React.FC<MovieCardEnhancedProps> = ({
    item,
    type,
    size = 'medium',
    showFullDescription = false,
    className = ''
}) => {
    const isMovie = type === 'movie';
    const linkPath = isMovie ? `/movies/${item.show_id}` : `/tv-shows/${item.show_id}`;
    
    // Get TMDB poster
    const { posterUrl, isLoading } = useTMDBPoster({
        title: item.title,
        year: item.release_year,
        type: isMovie ? 'movie' : 'tv'
    });

    // Get TMDB details for runtime/episodes
    const { runtime: tmdbRuntime } = useTMDBDetails({
        title: item.title,
        year: item.release_year,
        type: isMovie ? 'movie' : 'tv'
    });    // Size variants - kembali ke ukuran asli
    const sizeClasses = {
        small: 'w-40',
        medium: 'w-64',
        large: 'w-80'
    };

    const iconSizeClasses = {
        small: 16,
        medium: 20,
        large: 24
    };    return (
        <Link
            to={linkPath}
            className={`group block bg-slate-800/30 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-600/30 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10 ${sizeClasses[size]} ${
                showFullDescription ? 'h-auto min-h-[400px]' : ''
            } ${className}`}
        >
            {/* Poster */}
            <div className={`relative ${size === 'small' ? 'aspect-[2/3]' : size === 'medium' ? 'aspect-[2/3]' : 'aspect-[2/3]'} bg-gradient-to-br from-purple-600/20 to-pink-600/20 overflow-hidden`}>
                {posterUrl && !isLoading ? (
                    <img
                        src={posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="text-center text-slate-400 h-full flex items-center justify-center">
                        {isLoading ? (
                            <div className="animate-pulse">
                                <div className="w-8 h-8 bg-slate-400/20 rounded mb-2 mx-auto"></div>
                                <p className={`${size === 'small' ? 'text-xs' : 'text-sm'}`}>Loading...</p>
                            </div>
                        ) : (
                            <>
                                {isMovie ? (
                                    <Film size={iconSizeClasses[size]} className="mx-auto mb-1" />
                                ) : (
                                    <Tv size={iconSizeClasses[size]} className="mx-auto mb-1" />
                                )}
                                <p className={`${size === 'small' ? 'text-xs' : 'text-sm'}`}>
                                    {isMovie ? 'Movie' : 'TV Show'} Poster
                                </p>
                            </>
                        )}
                    </div>
                )}                {/* Rating - Top Left */}
                <div className="absolute top-1 left-1 bg-black/70 backdrop-blur-md rounded px-2 py-1 flex items-center">
                    <span className="text-white text-xs font-semibold">
                        ⭐ {(() => {
                            const rating = (item as any).vote_average || 
                                         (item as any).rating || 
                                         (item as any).imdb_rating;
                            if (!rating || rating === 'N/A' || rating === 'Unknown') return 'N/A';
                            const numRating = parseFloat(rating);
                            return isNaN(numRating) ? 'N/A' : numRating.toFixed(1);
                        })()}
                    </span>
                </div>

                {/* Content Type - Top Right */}
                <div className="absolute top-1 right-1 bg-black/70 backdrop-blur-md rounded px-2 py-1 flex items-center">
                    <span className="text-white text-xs font-semibold flex items-center space-x-1">
                        {isMovie ? (
                            <Film size={12} className="text-yellow-400" />
                        ) : (
                            <Tv size={12} className="text-blue-400" />
                        )}
                        <span>{item.release_year}</span>
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className={`flex-1 flex flex-col ${size === 'small' ? 'p-3' : 'p-4'}`}>
                {/* Similarity Score Progress Bar - hanya jika ada similarity_score */}
                {(item as any).similarity_score && (
                    <div className="mb-3 space-y-1">
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Similarity Match</span>
                            <span>{Math.round((item as any).similarity_score * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                            <div
                                className={`bg-gradient-to-r ${(() => {
                                    const score = Math.round((item as any).similarity_score * 100);
                                    if (score >= 90) return 'from-green-500 to-emerald-500';
                                    if (score >= 75) return 'from-blue-500 to-cyan-500';
                                    if (score >= 60) return 'from-purple-500 to-pink-500';
                                    if (score >= 40) return 'from-orange-500 to-yellow-500';
                                    return 'from-red-500 to-pink-500';
                                })()} h-1.5 rounded-full transition-all duration-300`}
                                style={{ width: `${Math.round((item as any).similarity_score * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                )}
                {/* Title */}
                <h3 className={`font-semibold text-white group-hover:text-purple-300 transition-colors ${
                    size === 'small' ? 'text-sm line-clamp-1 mb-2' : 
                    size === 'medium' ? 'text-lg line-clamp-2 mb-2' : 
                    'text-xl line-clamp-2 mb-3'
                }`}>
                    {item.title}
                </h3>                {/* Description */}
                <p className={`text-slate-400 ${
                    size === 'small' ? 'text-xs line-clamp-2 mb-2' : 
                    showFullDescription ? 'text-sm line-clamp-4 flex-1 mb-3' :
                    'text-sm line-clamp-3 flex-1 mb-3'
                }`}>
                    {item.description}
                </p>

                {/* Duration/Episodes Info */}
                <div className={`flex items-center space-x-1 text-slate-500 mb-2 ${
                    size === 'small' ? 'text-xs' : 'text-sm'
                }`}>
                    {isMovie ? (
                        <Film size={size === 'small' ? 12 : 14} />
                    ) : (
                        <Tv size={size === 'small' ? 12 : 14} />
                    )}
                    <span>
                        {isMovie 
                            ? (() => {
                                const duration = tmdbRuntime || (item as any).duration_minutes;
                                if (!duration || duration === 0) return 'Unknown duration';
                                const hours = Math.floor(duration / 60);
                                const minutes = duration % 60;
                                return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                            })()
                            : (() => {
                                const seasons = (item as any).num_seasons;
                                if (seasons && seasons > 0) {
                                    return `${seasons} season${seasons > 1 ? 's' : ''}`;
                                } else {
                                    return 'TV Series';
                                }
                            })()
                        }
                    </span>
                    <span className="text-slate-600">•</span>
                    <span>{item.release_year}</span>
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
        </Link>
    );
};

export default MovieCardEnhanced;
