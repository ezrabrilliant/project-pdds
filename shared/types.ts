// Shared Types for Netflix Recommendation System

export interface NetflixContent {
  show_id: string;
  type: 'Movie' | 'TV Show';
  title: string;
  director?: string;
  cast?: string;
  country?: string;
  date_added?: string;
  release_year: number;
  rating: string;
  duration?: string;
  genres: string;
  language: string;
  description?: string;
  popularity: number;
  vote_count: number;
  vote_average: number;
}

export interface Movie extends NetflixContent {
  type: 'Movie';
  budget?: number;
  revenue?: number;
}

export interface TVShow extends NetflixContent {
  type: 'TV Show';
  seasons?: number;
}

export interface Genre {
  id: string;
  name: string;
}

export interface CastMember {
  id: string;
  name: string;
  role: 'actor' | 'director' | 'producer';
}

export interface RecommendationRequest {
  contentId: string;
  contentType: 'movie' | 'tvshow';
  limit?: number;
}

export interface RecommendationResult {
  content: NetflixContent;
  similarity_score: number;
  match_reasons: string[];
  confidence_level: 'high' | 'medium' | 'low';
}

export interface DataQuality {
  completeness_score: number;
  missing_fields: string[];
  data_confidence: 'high' | 'medium' | 'low';
}

export interface AnalyticsData {
  total_movies: number;
  total_tvshows: number;
  genre_distribution: { [genre: string]: number };
  rating_distribution: { [rating: string]: number };
  country_distribution: { [country: string]: number };
  data_quality_overview: {
    movies: DataQuality;
    tvshows: DataQuality;
  };
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
