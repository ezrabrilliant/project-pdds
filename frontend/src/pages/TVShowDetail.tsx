import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Star, Globe, Users, ArrowLeft, Sparkles, Tv } from 'lucide-react';
import { apiService } from '../services/api';
import type { TVShow } from '../services/api';

const TVShowDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tvShow, setTVShow] = useState<TVShow | null>(null);
  const [recommendations, setRecommendations] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);

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
        }
          if (genreArray.length > 0) {
          const recs = await apiService.getRecommendationsByGenres(
            genreArray.slice(0, 3),
            'tvshows',
            6
          );
          
          // Ensure recs is an array and filter out current TV show
          const recsArray = Array.isArray(recs) ? recs : [];
          setRecommendations(recsArray.filter(rec => rec.show_id !== tvShowData.show_id) as TVShow[]);
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
      </Link>

      {/* TV Show Header */}
      <div className="bg-gradient-to-r from-slate-800/50 to-purple-900/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* TV Show Poster Placeholder */}
          <div className="lg:col-span-1">
            <div className="aspect-[2/3] bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl flex items-center justify-center border border-purple-500/20">
              <div className="text-center text-slate-400">
                <Tv size={48} className="mx-auto mb-2" />
                <p>TV Show Poster</p>
              </div>
            </div>
          </div>

          {/* TV Show Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{tvShow.title}</h1>
              <p className="text-xl text-slate-300">Directed by {tvShow.director}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-slate-300">
                <Calendar size={16} className="text-purple-400" />
                <span>Released: {tvShow.release_year}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Clock size={16} className="text-purple-400" />
                <span>Duration: {tvShow.duration}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Star size={16} className="text-purple-400" />
                <span>Rating: {tvShow.rating}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Globe size={16} className="text-purple-400" />
                <span>Country: {tvShow.country}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Synopsis</h3>
              <p className="text-slate-300 leading-relaxed">{tvShow.description}</p>
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
            </div>            {/* Cast */}
            {tvShow.cast_members && tvShow.cast_members.trim().length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Users size={20} className="text-purple-400" />
                  <span>Cast</span>
                </h3>
                <p className="text-slate-300">{tvShow.cast_members}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-purple-400" size={24} />
            <h2 className="text-2xl font-semibold text-white">Similar TV Shows</h2>
          </div>          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">            {recommendations.map((rec) => (
              <Link
                key={rec.show_id}
                to={`/tv-shows/${rec.show_id}`}
                className="group bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105"
              >
                {/* TV Show Poster */}
                <div className="aspect-[2/3] bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center border-b border-purple-500/20">
                  <div className="text-center text-slate-400">
                    <Tv size={32} className="mx-auto mb-2 text-purple-400" />
                    <p className="text-xs">TV Show Poster</p>
                  </div>
                </div>
                
                {/* TV Show Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors mb-2 line-clamp-2">
                    {rec.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-3 line-clamp-3">{rec.description}</p>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>{rec.release_year}</span>
                    <span>{rec.duration}</span>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(() => {
                      const genres = rec.genres as any;
                      if (typeof genres === 'string') {
                        return genres.split(',').slice(0, 2).map((genre: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400">
                            {genre.trim()}
                          </span>
                        ));
                      } else if (Array.isArray(genres)) {
                        return genres.slice(0, 2).map((genre: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400">
                            {genre}
                          </span>
                        ));
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TVShowDetail;
