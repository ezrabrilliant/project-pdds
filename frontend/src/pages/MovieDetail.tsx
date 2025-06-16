import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Star, Globe, Shield, ArrowLeft } from 'lucide-react';
import { apiService } from '../services/api';
import { useTMDBPoster } from '../hooks/useTMDBPoster';
import { useTMDBDetails } from '../hooks/useTMDBDetails';
import MovieSlider from '../components/MovieSlider';
import CastSlider from '../components/CastSlider';
import type { Movie } from '../services/api';

const MovieDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [recommendations, setRecommendations] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    // Get TMDB poster for the main movie
    const { posterUrl, isLoading: isPosterLoading } = useTMDBPoster({
        title: movie?.title || '',
        year: movie?.release_year,
        type: 'movie'
    });

    // Get TMDB details and cast
    const {
        details: tmdbDetails,
        cast: tmdbCast,
        runtime: tmdbRuntime,
        certification: tmdbCertification,
        isLoading: isDetailsLoading
    } = useTMDBDetails({
        title: movie?.title || '',
        year: movie?.release_year,
        type: 'movie'
    });

    useEffect(() => {
        const fetchMovie = async () => {
            if (!id) return;
            try {
                const movieData = await apiService.getMovieById(id);
                setMovie(movieData);// Get recommendations based on genres
                const genres = movieData.genres as any;
                let genreArray: string[] = [];
                if (typeof genres === 'string') {
                    genreArray = genres.split(',').map((g: string) => g.trim());
                } else if (Array.isArray(genres)) {
                    genreArray = genres;
                }                if (genreArray.length > 0) {                    const recs = await apiService.getRecommendationsByGenresLegacy(
                        genreArray.slice(0, 3),
                        'movies',
                        6
                    );// Filter out current movie and ensure content type is movie
                    const filteredRecs = recs.filter(rec => 
                        rec.show_id !== movieData.show_id && 
                        (rec as any).content_type === 'movie'                    ) as Movie[];
                    setRecommendations(filteredRecs);
                }
            } catch (error) {
                console.error('Failed to fetch movie:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovie();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-semibold text-white mb-4">Movie not found</h2>
                <Link
                    to="/movies"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold transition-all duration-300 transform hover:scale-105"
                >
                    Back to Movies
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Back Button */}
            <Link
                to="/movies"
                className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={20} />
                <span>Back to Movies</span>
            </Link>            {/* Movie Header */}
            <div className="bg-gradient-to-r from-slate-800/50 to-purple-900/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
                <div className="grid lg:grid-cols-4 gap-8">          {/* Movie Poster */}
                    <div className="lg:col-span-1">
                        <div className="aspect-[1/1.5] rounded-xl overflow-hidden border border-purple-500/20 bg-gradient-to-br from-purple-600/20 to-pink-600/20">
                            {posterUrl && !isPosterLoading ? (
                                <img
                                    src={posterUrl}
                                    alt={movie.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center text-center text-slate-400 ${posterUrl && !isPosterLoading ? 'hidden' : ''}`}>
                                {isPosterLoading ? (
                                    <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                                ) : (
                                    <>
                                        <div>
                                            <Star size={48} className="mx-auto mb-2" />
                                            <p>Movie Poster</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Movie Info */}
                    <div className="lg:col-span-3 space-y-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">{movie.title}</h1>
                            <p className="text-xl text-slate-300">Directed by {movie.director}</p>
                        </div>            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-slate-300">
                    <Calendar size={16} className="text-purple-400" />
                    <span>Released: {movie.release_year}</span>
                </div>
                {(tmdbRuntime || movie.duration_minutes) && (
                    <div className="flex items-center space-x-2 text-slate-300">
                        <Clock size={16} className="text-purple-400" />
                        <span>Duration: {(() => {
                            const duration = tmdbRuntime || movie.duration_minutes;
                            if (!duration) return 'Unknown';
                            const hours = Math.floor(duration / 60);
                            const minutes = duration % 60;
                            return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                        })()}</span>
                    </div>
                )}
                <div className="flex items-center space-x-2 text-slate-300">
                    <Star size={16} className="text-purple-400" />
                    <span>Rating: {movie.rating}</span>
                </div>
                {tmdbCertification && (
                    <div className="flex items-center space-x-2 text-slate-300">
                        <Shield size={16} className="text-purple-400" />
                        <span>Certification: {tmdbCertification}</span>
                    </div>
                )}
                <div className="flex items-center space-x-2 text-slate-300">
                    <Globe size={16} className="text-purple-400" />
                    <span>Country: {movie.country}</span>
                </div>
                            <div className="flex items-center space-x-2 text-slate-300">
                                <Globe size={16} className="text-purple-400" />
                                <span>Country: {movie.country}</span>
                            </div>
                            {tmdbCertification && (
                                <div className="flex items-center space-x-2 text-slate-300">
                                    <Shield size={16} className="text-purple-400" />
                                    <span>Rated: {tmdbCertification}</span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">              <h3 className="text-lg font-semibold text-white">Synopsis</h3>
                            <p className="text-slate-300 leading-relaxed text-left">{movie.description}</p>
                        </div>

                        {/* Genres */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-white">Genres</h3>
                            <div className="flex flex-wrap gap-2">
                                {(() => {
                                    const genres = movie.genres as any;
                                    if (typeof genres === 'string') {
                                        return genres.split(',').map((genre: string, index: number) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-sm text-purple-300"
                                            >
                                                {genre.trim()}
                                            </span>
                                        ));
                                    } else if (Array.isArray(genres)) {
                                        return genres.map((genre: string, index: number) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-sm text-purple-300"
                                            >
                                                {genre}
                                            </span>
                                        ));
                                    }
                                    return null;
                                })()}              </div>
                        </div>            {/* Cast from TMDB */}
                        {tmdbCast && tmdbCast.length > 0 && (
                            <CastSlider cast={tmdbCast} title="Cast" />
                        )}

                        {/* Fallback to original cast if TMDB data not available */}
                        {(!tmdbCast || tmdbCast.length === 0) && movie.cast_members && movie.cast_members.trim().length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                                    <Star size={20} className="text-purple-400" />
                                    <span>Cast</span>
                                </h3>
                                <p className="text-slate-300">{movie.cast_members}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>            {/* Recommendations */}
            {recommendations.length > 0 && (
                <MovieSlider
                    items={recommendations}
                    title="Similar Movies"
                />
            )}
        </div>
    );
};

export default MovieDetail;
