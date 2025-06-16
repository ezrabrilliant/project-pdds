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
  movies_count: number;
  tv_shows_count: number;
  total_count: number;
}

export interface SearchFilters {
  genre?: string;
  rating?: string;
  releaseYear?: number;
  country?: string;
  sortBy?: 'title' | 'release_year' | 'date_added';
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
  }

  // Genres
  async getGenres(): Promise<Genre[]> {
    return this.request<Genre[]>('/genres');
  }
  // Search
  async searchMovies(filters: SearchFilters & PaginationParams): Promise<any> {
    const params = new URLSearchParams();
    if (filters.genre) params.append('genre', filters.genre);
    if (filters.rating) params.append('rating', filters.rating);
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
    if (filters.rating) params.append('rating', filters.rating);
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
    const params = new URLSearchParams();
    if (filters.q) params.append('q', filters.q);
    if (filters.genre) params.append('genre', filters.genre);
    if (filters.rating) params.append('rating', filters.rating);
    if (filters.releaseYear) params.append('releaseYear', filters.releaseYear.toString());
    if (filters.country) params.append('country', filters.country);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    params.append('type', filters.type);
    params.append('page', (filters.page || 1).toString());
    params.append('limit', (filters.limit || 20).toString());
    
    return this.request<any>(`/search?${params.toString()}`);
  }
  // Recommendations
  async getRecommendationsByGenres(genres: string[], type: 'movies' | 'tvshows' = 'movies', limit = 10): Promise<(Movie | TVShow)[]> {
    const response = await this.postRequest<any>('/recommendations/by-genres', {
      genres,
      type,
      limit
    });
    
    // Extract the appropriate array from the nested structure
    if (response.results) {
      if (type === 'movies') {
        return response.results.movies || [];
      } else {
        return response.results.tvShows || [];
      }
    }
    
    return [];
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
}

export const apiService = new ApiService();
