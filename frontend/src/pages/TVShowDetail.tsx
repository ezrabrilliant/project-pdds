import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Star, Globe, Shield, ArrowLeft, Tv } from 'lucide-react';
import { apiService } from '../services/api';
import { useTMDBPoster } from '../hooks/useTMDBPoster';
import { useTMDBDetails } from '../hooks/useTMDBDetails';
import TVShowSlider from '../components/TVShowSlider';
import CastSlider from '../components/CastSlider';
import type { TVShow } from '../services/api';

const TVShowDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tvShow, setTVShow] = useState<TVShow | null>(null);
  const [recommendations, setRecommendations] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  // Get TMDB poster for the main TV show
  const { posterUrl, isLoading: isPosterLoading } = useTMDBPoster({
    title: tvShow?.title || '',
    year: tvShow?.release_year,
    type: 'tv'
  });

  // Get TMDB details and cast
  const { 
    details: tmdbDetails, 
    cast: tmdbCast, 
    runtime: tmdbRuntime, 
    certification: tmdbCertification, 
    isLoading: isDetailsLoading 
  } = useTMDBDetails({
    title: tvShow?.title || '',
    year: tvShow?.release_year,
    type: 'tv'
  });

  useEffect(() => {
    const fetchTVShow = async () => {
      if (!id) return;
        try {
        const tvShowData = await apiService.getTVShowById(id);        setTVShow(tvShowData);

        // Get recommendations based on genres
        const genres = tvShowData.genres as any;
        let genreArray: string[] = [];
        if (typeof genres === 'string') {
          genreArray = genres.split(',').map((g: string) => g.trim());
        } else if (Array.isArray(genres)) {
          genreArray = genres;
        }        if (genreArray.length > 0) {
          const recs = await apiService.getRecommendationsByGenresLegacy(
            genreArray.slice(0, 3),
            'tvshows',
            6
          );
          
          // Filter out current TV show and ensure content type is tvshow
          const filteredRecs = recs.filter(rec => 
            rec.show_id !== tvShowData.show_id && 
            (rec as any).content_type === 'tvshow'
          ) as TVShow[];
          setRecommendations(filteredRecs);
        }
      } catch (error) {
        console.error('Failed to fetch TV show:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTVShow();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!tvShow) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-white mb-4">TV Show not found</h2>
        <Link 
          to="/tv-shows"
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold transition-all duration-300 transform hover:scale-105"
        >
          Back to TV Shows
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link 
        to="/tv-shows"
        className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to TV Shows</span>
      </Link>      {/* TV Show Header */}
      <div className="bg-gradient-to-r from-slate-800/50 to-purple-900/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
        <div className="grid lg:grid-cols-4 gap-8">          {/* TV Show Poster */}
          <div className="lg:col-span-1">
            <div className="aspect-[1/1.5] rounded-xl overflow-hidden border border-purple-500/20 bg-gradient-to-br from-purple-600/20 to-pink-600/20">
              {posterUrl && !isPosterLoading ? (
                <img
                  src={posterUrl}
                  alt={tvShow.title}
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
                      <Tv size={48} className="mx-auto mb-2" />
                      <p>TV Show Poster</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* TV Show Info */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{tvShow.title}</h1>
              <p className="text-xl text-slate-300">Directed by {tvShow.director}</p>
            </div>            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-slate-300">
                <Calendar size={16} className="text-purple-400" />
                <span>Released: {tvShow.release_year}</span>
              </div>
              {(tmdbRuntime || tvShow.duration) && (
                <div className="flex items-center space-x-2 text-slate-300">
                  <Clock size={16} className="text-purple-400" />
                  <span>Duration: {tmdbRuntime ? `${tmdbRuntime} min/episode` : tvShow.duration}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-slate-300">
                <Star size={16} className="text-purple-400" />
                <span>Rating: {tvShow.rating}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Globe size={16} className="text-purple-400" />
                <span>Country: {tvShow.country}</span>
              </div>
              {tmdbCertification && (
                <div className="flex items-center space-x-2 text-slate-300">
                  <Shield size={16} className="text-purple-400" />
                  <span>Rated: {tmdbCertification}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Synopsis</h3>
              <p className="text-slate-300 leading-relaxed text-left">{tvShow.description}</p>
            </div>

            {/* Genres */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Genres</h3>              <div className="flex flex-wrap gap-2">
                {(() => {
                  const genres = tvShow.genres as any;
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
                })()}
              </div>
            </div>            {/* Cast from TMDB */}
            {tmdbCast && tmdbCast.length > 0 && (
              <CastSlider cast={tmdbCast} title="Cast" />
            )}

            {/* Fallback to original cast if TMDB data not available */}
            {(!tmdbCast || tmdbCast.length === 0) && tvShow.cast_members && tvShow.cast_members.trim().length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Star size={20} className="text-purple-400" />
                  <span>Cast</span>
                </h3>
                <p className="text-slate-300">{tvShow.cast_members}</p>
              </div>
            )}
          </div>
        </div>
      </div>      {/* Recommendations */}
      {recommendations.length > 0 && (
        <TVShowSlider
          items={recommendations}
          title="Similar TV Shows"
        />
      )}
    </div>
  );
};

export default TVShowDetail;
