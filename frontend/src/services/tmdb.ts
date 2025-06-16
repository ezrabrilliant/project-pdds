const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Image sizes available from TMDB
export const TMDB_POSTER_SIZES = {
  small: 'w185',
  medium: 'w342',
  large: 'w500',
  original: 'original'
};

export interface TMDBSearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  media_type?: 'movie' | 'tv';
}

export interface TMDBMovieDetails {
  id: number;
  title: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date: string;
  vote_average: number;
  overview: string;
  runtime?: number;
  genres: { id: number; name: string }[];
  release_dates?: {
    results: {
      iso_3166_1: string;
      release_dates: {
        certification: string;
        type: number;
      }[];
    }[];
  };
}

export interface TMDBTVDetails {
  id: number;
  name: string;
  poster_path?: string;
  backdrop_path?: string;
  first_air_date: string;
  vote_average: number;
  overview: string;
  episode_run_time: number[];
  genres: { id: number; name: string }[];
  content_ratings?: {
    results: {
      iso_3166_1: string;
      rating: string;
    }[];
  };
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
  order: number;
}

export interface TMDBCreditsResponse {
  cast: TMDBCastMember[];
  crew: any[];
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBSearchResult[];
  total_pages: number;
  total_results: number;
}

class TMDBService {
  private headers = {
    'Authorization': `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmNGE2OGQ4NDc3NDg1YzA2NTQ4ZWU4MTlkNTVjZjFiOCIsIm5iZiI6MTc1MDA3MjUyMi4yMjUsInN1YiI6IjY4NGZmY2NhZWY1NDZjOTVjNTI5NTQyMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.rWEoqUxBXIHTWGpmO7jAZrZ7REyMEqivczHk6bB_snM`,
    'Content-Type': 'application/json'
  };

  // Search for movies
  async searchMovie(title: string, year?: number): Promise<TMDBSearchResult[]> {
    try {
      const params = new URLSearchParams({
        query: title,
        include_adult: 'false',
        language: 'en-US',
        page: '1'
      });
      
      if (year) {
        params.append('year', year.toString());
      }

      const response = await fetch(`${TMDB_BASE_URL}/search/movie?${params}`, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data: TMDBSearchResponse = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error searching movie in TMDB:', error);
      return [];
    }
  }

  // Search for TV shows
  async searchTVShow(title: string, year?: number): Promise<TMDBSearchResult[]> {
    try {
      const params = new URLSearchParams({
        query: title,
        include_adult: 'false',
        language: 'en-US',
        page: '1'
      });
      
      if (year) {
        params.append('first_air_date_year', year.toString());
      }

      const response = await fetch(`${TMDB_BASE_URL}/search/tv?${params}`, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data: TMDBSearchResponse = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error searching TV show in TMDB:', error);
      return [];
    }
  }

  // Multi search (movies and TV shows)
  async multiSearch(title: string): Promise<TMDBSearchResult[]> {
    try {
      const params = new URLSearchParams({
        query: title,
        include_adult: 'false',
        language: 'en-US',
        page: '1'
      });

      const response = await fetch(`${TMDB_BASE_URL}/search/multi?${params}`, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data: TMDBSearchResponse = await response.json();
      return data.results.filter(result => 
        result.media_type === 'movie' || result.media_type === 'tv'
      );
    } catch (error) {
      console.error('Error in TMDB multi search:', error);
      return [];
    }
  }

  // Get movie details
  async getMovieDetails(movieId: number): Promise<TMDBMovieDetails | null> {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?append_to_response=release_dates`, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching movie details:', error);
      return null;
    }
  }

  // Get TV show details
  async getTVDetails(tvId: number): Promise<TMDBTVDetails | null> {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/tv/${tvId}?append_to_response=content_ratings`, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching TV details:', error);
      return null;
    }
  }

  // Get movie/TV credits (cast & crew)
  async getCredits(id: number, type: 'movie' | 'tv'): Promise<TMDBCreditsResponse | null> {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}/credits`, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching credits:', error);
      return null;
    }
  }

  // Get profile image URL
  getProfileUrl(profilePath: string | null, size: string = 'w185'): string | null {
    if (!profilePath) return null;
    return `${TMDB_IMAGE_BASE_URL}/${size}${profilePath}`;
  }
  getPosterUrl(posterPath: string | null, size: keyof typeof TMDB_POSTER_SIZES = 'medium'): string | null {
    if (!posterPath) return null;
    return `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZES[size]}${posterPath}`;
  }

  // Get backdrop URL
  getBackdropUrl(backdropPath: string | null, size: string = 'w1280'): string | null {
    if (!backdropPath) return null;
    return `${TMDB_IMAGE_BASE_URL}/${size}${backdropPath}`;
  }

  // Find best match for a movie/TV show
  async findBestMatch(title: string, year?: number, type?: 'movie' | 'tv'): Promise<TMDBSearchResult | null> {
    try {
      let results: TMDBSearchResult[] = [];

      if (type === 'movie') {
        results = await this.searchMovie(title, year);
      } else if (type === 'tv') {
        results = await this.searchTVShow(title, year);
      } else {
        results = await this.multiSearch(title);
      }

      if (results.length === 0) return null;

      // Clean title for better matching
      const cleanTitle = title.toLowerCase().trim();
      
      // Find exact title match first
      const exactMatch = results.find(result => {
        const resultTitle = (result.title || result.name || '').toLowerCase().trim();
        return resultTitle === cleanTitle;
      });

      if (exactMatch) return exactMatch;

      // If no exact match, return the first result (highest relevance)
      return results[0];
    } catch (error) {
      console.error('Error finding best match:', error);
      return null;
    }
  }
}

export const tmdbService = new TMDBService();
