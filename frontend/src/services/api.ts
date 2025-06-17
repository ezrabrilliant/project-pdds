const API_BASE_URL = 'http://localhost:3001/api';

export interface Movie {
  show_id: string;
  id?: number; // Keep for backward compatibility
  title: string;
  director: string;
  cast_members: string; // This is a string, not array
  country: string;
  date_added: string;
  release_year: number;
  rating: string;
  duration_minutes: number;
  listed_in?: string[];
  description: string;
  genres: string[] | string;
}

export interface TVShow {
  show_id: string;
  id?: number; // Keep for backward compatibility
  title: string;
  director: string;
  cast_members: string; // This is a string, not array
  country: string;
  date_added: string;
  release_year: number;
  rating: string;
  duration: string;
  listed_in?: string[];
  description: string;
  genres: string[] | string;
}

export interface Genre {
  id: number;
  name: string;
  movie_count: number;
  tvshow_count: number;
  total_count: number;
}

export interface SearchFilters {
  genre?: string;
  ratings?: number[]; // Rating ranges (1-10) based on vote_average
  releaseYear?: number;
  country?: string;
  language?: string;
  sortBy?: 'title' | 'release_year' | 'date_added' | 'vote_average' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RecommendationItem {
  show_id: string;
  title: string;
  description: string;
  genres: string[] | string;
  release_year: number;
  rating?: string;
  vote_average?: number;
  imdb_rating?: number;
  duration_minutes?: number; // for movies
  duration?: string; // for TV shows
  similarity_score: number;
  director?: string;
  cast_members?: string;
  country?: string;
  date_added?: string;
}

export interface RecommendationResponse {
  sourceMovie?: { id: string; type: string };
  sourceTVShow?: { id: string; type: string };
  recommendations: RecommendationItem[];
  algorithm: string;
  totalRecommendations: number;
  requestedGenres?: string[];
  filters?: any;
}

export interface CacheStats {
  itemRecommendationsCached: number;
  genreRecommendationsCached: number;
  totalCached: number;
}

class ApiService {  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    const jsonResponse = await response.json();
    
    // Handle wrapped response structure
    if (jsonResponse.success && jsonResponse.data) {
      return jsonResponse.data;
    }
    
    return jsonResponse;
  }
  private async postRequest<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    const jsonResponse = await response.json();
    
    // Handle wrapped response structure
    if (jsonResponse.success && jsonResponse.data) {
      return jsonResponse.data;
    }
    
    return jsonResponse;
  }
  private async deleteRequest<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    const jsonResponse = await response.json();
    
    // Handle wrapped response structure
    if (jsonResponse.success !== undefined) {
      return jsonResponse;
    }
    
    return jsonResponse;
  }

  // Movies
  async getMovies(params: PaginationParams = {}): Promise<ApiResponse<Movie>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    return this.request<ApiResponse<Movie>>(`/movies?${queryParams}`);
  }
  async getMovieById(id: string): Promise<Movie> {
    return this.request<Movie>(`/movies/${id}`);
  }

  // TV Shows
  async getTVShows(params: PaginationParams = {}): Promise<ApiResponse<TVShow>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    return this.request<ApiResponse<TVShow>>(`/tvshows?${queryParams}`);
  }
  async getTVShowById(id: string): Promise<TVShow> {
    return this.request<TVShow>(`/tvshows/${id}`);
  }  // Genres
  async getGenres(options?: { hideTVShowOnly?: boolean; includeEmpty?: boolean }): Promise<Genre[]> {
    const params = new URLSearchParams();
    if (options?.hideTVShowOnly) {
      params.append('hideTVShowOnly', 'true');
    }
    if (options?.includeEmpty) {
      params.append('includeEmpty', 'true');
    }
    
    const url = `/genres${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.request<any>(url);
    
    // Handle different response structures
    if (Array.isArray(response)) {
      return response;
    } else if (response && Array.isArray(response.genres)) {
      return response.genres;
    } else {
      console.error('Unexpected genres response structure:', response);
      return [];
    }
  }  // Search
  async searchMovies(filters: SearchFilters & PaginationParams): Promise<any> {
    const params = new URLSearchParams();
    if (filters.genre) params.append('genre', filters.genre);
    if (filters.ratings) params.append('ratings', filters.ratings.join(','));
    if (filters.releaseYear) params.append('releaseYear', filters.releaseYear.toString());
    if (filters.country) params.append('country', filters.country);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    params.append('type', 'movies');
    params.append('page', (filters.page || 1).toString());
    params.append('limit', (filters.limit || 20).toString());
    
    return this.request<any>(`/search?${params.toString()}`);
  }

  async searchTVShows(filters: SearchFilters & PaginationParams): Promise<any> {
    const params = new URLSearchParams();
    if (filters.genre) params.append('genre', filters.genre);
    if (filters.ratings) params.append('ratings', filters.ratings.join(','));
    if (filters.releaseYear) params.append('releaseYear', filters.releaseYear.toString());
    if (filters.country) params.append('country', filters.country);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    params.append('type', 'tvshows');
    params.append('page', (filters.page || 1).toString());
    params.append('limit', (filters.limit || 20).toString());
    
    return this.request<any>(`/search?${params.toString()}`);
  }
  async advancedSearch(filters: SearchFilters & PaginationParams & { type: 'movies' | 'tvshows' | 'all', q?: string }): Promise<any> {
    const requestBody: any = {
      query: filters.q || '',
      type: filters.type,
      page: filters.page || 1,
      limit: filters.limit || 20,
      sortBy: filters.sortBy || 'date_added',
      sortOrder: filters.sortOrder || 'desc'
    };    // Add filters as arrays (backend expects arrays)
    if (filters.genre) requestBody.genres = [filters.genre];
    if (filters.ratings) requestBody.ratings = filters.ratings;
    if (filters.releaseYear) requestBody.years = [filters.releaseYear];
    if (filters.country) requestBody.countries = [filters.country];
    if (filters.language) requestBody.languages = [filters.language];
    
    return this.postRequest<any>('/search/advanced', requestBody);
  }  // Recommendations - New API with Cosine Similarity
  
  // Get recommendations for a specific movie
  async getMovieRecommendations(movieId: string, limit = 10): Promise<RecommendationResponse> {
    return this.request<RecommendationResponse>(`/recommendations/movie/${movieId}?limit=${limit}`);
  }

  // Get recommendations for a specific TV show
  async getTVShowRecommendations(tvshowId: string, limit = 10): Promise<RecommendationResponse> {
    return this.request<RecommendationResponse>(`/recommendations/tvshow/${tvshowId}?limit=${limit}`);
  }

  // Get recommendations based on multiple genres (updated)
  async getRecommendationsByGenres(
    genres: string[], 
    type: 'movies' | 'tvshows' | 'all' = 'movies', 
    limit = 20,
    minRating = 0,
    minYear = 2000
  ): Promise<RecommendationResponse> {
    return this.postRequest<RecommendationResponse>('/recommendations/by-genres', {
      genres,
      type,
      limit,
      minRating,
      minYear
    });
  }

  // Get personalized recommendations
  async getPersonalizedRecommendations(
    favoriteGenres: string[],
    preferredType: 'movies' | 'tvshows' | 'all' = 'all',
    limit = 20
  ): Promise<RecommendationResponse> {
    return this.postRequest<RecommendationResponse>('/recommendations/personalized', {
      favoriteGenres,
      preferredType,
      limit
    });
  }

  // Cache management
  async getCacheStats(): Promise<{ success: boolean; data: CacheStats }> {
    return this.request<{ success: boolean; data: CacheStats }>('/recommendations/cache/stats');
  }

  async clearCache(): Promise<{ success: boolean; data: { message: string } }> {
    return this.deleteRequest<{ success: boolean; data: { message: string } }>('/recommendations/cache');
  }  // Legacy function for backward compatibility (deprecated)
  async getRecommendationsByGenresLegacy(genres: string[], type: 'movies' | 'tvshows' = 'movies', limit = 10): Promise<(Movie | TVShow)[]> {
    const response = await this.getRecommendationsByGenres(genres, type, limit);
    return (response.recommendations || []) as (Movie | TVShow)[];
  }

  // Analytics
  async getAnalytics(): Promise<any> {
    return this.request<any>('/analytics');
  }

  async getGenreDistribution(): Promise<any> {
    return this.request<any>('/analytics/genre-distribution');
  }

  async getYearDistribution(): Promise<any> {
    return this.request<any>('/analytics/year-distribution');
  }

  async getRatingDistribution(): Promise<any> {
    return this.request<any>('/analytics/rating-distribution');
  }

  async getTopDirectors(): Promise<any> {
    return this.request<any>('/analytics/top-directors');
  }

  // Content search (wrapper for advancedSearch)
  async searchContent(options: { 
    query: string; 
    type?: 'movies' | 'tvshows'; 
    limit?: number 
  }): Promise<{ movies?: Movie[]; tvShows?: TVShow[] }> {
    const response = await this.advancedSearch({
      q: options.query,
      type: options.type || 'all',
      limit: options.limit || 10
    });
    
    return {
      movies: response.movies || [],
      tvShows: response.tvShows || []
    };
  }
}

export const apiService = new ApiService();
