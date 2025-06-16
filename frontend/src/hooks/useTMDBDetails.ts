import { useState, useEffect } from 'react';
import { tmdbService } from '../services/tmdb';
import type { TMDBMovieDetails, TMDBTVDetails, TMDBCastMember } from '../services/tmdb';

interface UseTMDBDetailsProps {
  title: string;
  year?: number;
  type: 'movie' | 'tv';
}

interface TMDBDetailsResult {
  details: TMDBMovieDetails | TMDBTVDetails | null;
  cast: TMDBCastMember[];
  runtime?: number;
  certification?: string;
  isLoading: boolean;
  error: string | null;
}

export const useTMDBDetails = ({ title, year, type }: UseTMDBDetailsProps): TMDBDetailsResult => {
  const [details, setDetails] = useState<TMDBMovieDetails | TMDBTVDetails | null>(null);
  const [cast, setCast] = useState<TMDBCastMember[]>([]);
  const [runtime, setRuntime] = useState<number | undefined>();
  const [certification, setCertification] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTMDBData = async () => {
      if (!title.trim()) return;

      setIsLoading(true);
      setError(null);

      try {
        // Find the best match
        const match = await tmdbService.findBestMatch(title, year, type);
        if (!match) {
          setError('No match found on TMDB');
          return;
        }

        // Get details and credits in parallel
        const [detailsData, creditsData] = await Promise.all([
          type === 'movie' 
            ? tmdbService.getMovieDetails(match.id)
            : tmdbService.getTVDetails(match.id),
          tmdbService.getCredits(match.id, type)
        ]);

        if (detailsData) {
          setDetails(detailsData);

          // Extract runtime
          if (type === 'movie') {
            const movieDetails = detailsData as TMDBMovieDetails;
            setRuntime(movieDetails.runtime);

            // Extract US certification (rating)
            const usRelease = movieDetails.release_dates?.results.find(
              result => result.iso_3166_1 === 'US'
            );
            const cert = usRelease?.release_dates.find(
              release => release.certification && release.certification.trim() !== ''
            )?.certification;
            setCertification(cert);
          } else {
            const tvDetails = detailsData as TMDBTVDetails;
            // Use average runtime for TV shows
            const avgRuntime = tvDetails.episode_run_time.length > 0
              ? Math.round(tvDetails.episode_run_time.reduce((a, b) => a + b, 0) / tvDetails.episode_run_time.length)
              : undefined;
            setRuntime(avgRuntime);

            // Extract US content rating
            const usRating = tvDetails.content_ratings?.results.find(
              result => result.iso_3166_1 === 'US'
            );
            setCertification(usRating?.rating);
          }
        }

        if (creditsData && creditsData.cast) {
          // Take top 10 cast members
          setCast(creditsData.cast.slice(0, 10));
        }

      } catch (err) {
        console.error('Error fetching TMDB data:', err);
        setError('Failed to fetch data from TMDB');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTMDBData();
  }, [title, year, type]);

  return {
    details,
    cast,
    runtime,
    certification,
    isLoading,
    error
  };
};
