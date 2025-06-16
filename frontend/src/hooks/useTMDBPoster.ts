import { useState, useEffect } from 'react';
import { tmdbService, type TMDBSearchResult } from '../services/tmdb';

interface UseTMDBPosterProps {
  title: string;
  year?: number;
  type?: 'movie' | 'tv';
}

export const useTMDBPoster = ({ title, year, type }: UseTMDBPosterProps) => {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tmdbData, setTmdbData] = useState<TMDBSearchResult | null>(null);

  useEffect(() => {
    if (!title || title.trim() === '') return;

    const fetchPoster = async () => {
      setIsLoading(true);
      try {
        const result = await tmdbService.findBestMatch(title, year, type);
        if (result) {
          setTmdbData(result);
          const url = tmdbService.getPosterUrl(result.poster_path || null, 'medium');
          setPosterUrl(url);
        } else {
          setPosterUrl(null);
          setTmdbData(null);
        }
      } catch (error) {
        console.error('Error fetching TMDB poster:', error);
        setPosterUrl(null);
        setTmdbData(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Add small delay to avoid too many API calls
    const timeoutId = setTimeout(fetchPoster, 300);
    
    return () => clearTimeout(timeoutId);
  }, [title, year, type]);

  return {
    posterUrl,
    isLoading,
    tmdbData
  };
};
