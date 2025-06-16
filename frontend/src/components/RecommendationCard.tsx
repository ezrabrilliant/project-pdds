import React from 'react';
import { Link } from 'react-router-dom';
import { Tv, Film } from 'lucide-react';
import { useTMDBPoster } from '../hooks/useTMDBPoster';
import type { RecommendationItem } from '../services/api';

interface RecommendationCardProps {
    item: RecommendationItem;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
    item,
    size = 'medium',
    className = ''
}) => {    // Determine if it's a movie or TV show
    const isMovie = (() => {
        // First check for content_type property from backend
        if ((item as any).content_type) {
            return (item as any).content_type === 'movie';
        }
        // Fallback to duration_minutes check
        return 'duration_minutes' in item;
    })();
    const linkPath = isMovie ? `/movies/${item.show_id}` : `/tv-shows/${item.show_id}`;
    
    // Get TMDB poster
    const { posterUrl, isLoading } = useTMDBPoster({
        title: item.title,
        year: item.release_year,
        type: isMovie ? 'movie' : 'tv'
    });

    // Size variants
    const sizeClasses = {
        small: 'w-40',
        medium: 'w-full max-w-sm',
        large: 'w-full max-w-md'
    };

    const iconSizeClasses = {
        small: 16,
        medium: 20,
        large: 24
    };

    // Get similarity percentage
    const similarityPercentage = item.similarity_score ? Math.round(item.similarity_score * 100) : 0;

    // Get similarity level
    const getSimilarityLevel = (score: number) => {
        if (score >= 90) return { label: 'Perfect Match', color: 'from-green-500 to-emerald-500' };
        if (score >= 75) return { label: 'Excellent Match', color: 'from-blue-500 to-cyan-500' };
        if (score >= 60) return { label: 'Good Match', color: 'from-purple-500 to-pink-500' };
        if (score >= 40) return { label: 'Fair Match', color: 'from-orange-500 to-yellow-500' };
        return { label: 'Similar', color: 'from-gray-500 to-slate-500' };
    };

    const similarityLevel = getSimilarityLevel(similarityPercentage);

    return (
        <Link
            to={linkPath}
            className={`group bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105 flex flex-col overflow-hidden ${sizeClasses[size]} ${className}`}
        >
            {/* Poster */}
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center border-b border-purple-500/10 aspect-[1/1.5] relative overflow-hidden">
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
                                    <Film size={iconSizeClasses[size]} className="mx-auto mb-1" />
                                ) : (
                                    <Tv size={iconSizeClasses[size]} className="mx-auto mb-1" />
                                )}
                                <p className={`${size === 'small' ? 'text-xs' : 'text-sm'}`}>
                                    {isMovie ? 'Movie' : 'TV Show'} Poster
                                </p>
                            </>
                        )}
                    </div>                )}

                {/* Content Type Indicator - Top Right */}
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md rounded-full p-1.5">
                    {isMovie ? (
                        <Film size={14} className="text-yellow-400" />
                    ) : (
                        <Tv size={14} className="text-blue-400" />
                    )}
                </div>

                {/* Rating - Bottom Right */}
                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md rounded px-2 py-1">
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
            </div>            {/* Content */}
            <div className={`flex-1 flex flex-col ${size === 'small' ? 'p-3' : 'p-4'}`}>
                {/* Similarity Score Progress Bar */}
                <div className="mb-3 space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Similarity Match</span>
                        <span>{similarityPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div
                            className={`bg-gradient-to-r ${similarityLevel.color} h-1.5 rounded-full transition-all duration-300`}
                            style={{ width: `${similarityPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Title */}
                <h3 className={`font-semibold text-white group-hover:text-purple-300 transition-colors ${
                    size === 'small' ? 'text-sm line-clamp-1 mb-2' : 
                    size === 'medium' ? 'text-lg line-clamp-2 mb-2' : 
                    'text-xl line-clamp-2 mb-3'
                }`}>
                    {item.title}
                </h3>{/* Description */}
                <p className={`text-slate-400 ${
                    size === 'small' ? 'text-xs line-clamp-2 mb-2' : 'text-sm line-clamp-3 flex-1 mb-3'
                }`}>
                    {item.description}
                </p>

                {/* Meta info */}
                <div className={`mt-auto ${size === 'small' ? 'space-y-1' : 'space-y-2'}`}>
                    {/* Duration */}
                    <div className={`flex items-center space-x-1 text-slate-500 ${
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
                                    const duration = (item as any).duration_minutes;
                                    if (!duration || duration === 0) return 'Unknown duration';
                                    const hours = Math.floor(duration / 60);
                                    const minutes = duration % 60;
                                    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                                })()
                                : (item as any).duration || 'Unknown duration'
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
            </div>
        </Link>
    );
};

export default RecommendationCard;
