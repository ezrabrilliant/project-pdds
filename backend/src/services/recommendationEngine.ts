import { pgPool, getMongoDatabase } from '../config/database';
import { mongoService } from './mongoService';

// Simple cosine similarity calculation without external ML libraries
export class SimpleRecommendationEngine {
  
  /**
   * Create one-hot encoding for genres
   * @param itemGenres Array of genre names for an item
   * @param allGenres Array of all possible genres
   * @returns One-hot encoded vector
   */
  private createOneHotEncoding(itemGenres: string[], allGenres: string[]): number[] {
    return allGenres.map(genre => itemGenres.includes(genre) ? 1 : 0);
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param vectorA First vector
   * @param vectorB Second vector
   * @returns Cosine similarity score (0-1)
   */
  private calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) return 0;

    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));

    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Get all unique genres from database
   */
  private async getAllGenres(): Promise<string[]> {
    const query = `
      SELECT DISTINCT name FROM genres 
      WHERE id IN (
        SELECT DISTINCT genre_id FROM movie_genres
        UNION
        SELECT DISTINCT genre_id FROM tvshow_genres
      )
      ORDER BY name
    `;
    
    const result = await pgPool.query(query);
    return result.rows.map(row => row.name);
  }

  /**
   * Get item genres
   * @param itemId Show ID
   * @param type 'movie' or 'tvshow'
   */
  private async getItemGenres(itemId: string, type: 'movie' | 'tvshow'): Promise<string[]> {
    const table = type === 'movie' ? 'movie_genres' : 'tvshow_genres';
    const idColumn = type === 'movie' ? 'movie_id' : 'tvshow_id';
    
    const query = `
      SELECT g.name
      FROM ${table} tg
      JOIN genres g ON tg.genre_id = g.id
      WHERE tg.${idColumn} = $1
    `;
    
    const result = await pgPool.query(query, [itemId]);
    return result.rows.map(row => row.name);
  }

  /**
   * Calculate similarity for a single item
   */
  public async calculateItemSimilarity(
    sourceItemId: string,
    targetItemId: string,
    sourceType: 'movie' | 'tvshow',
    targetType: 'movie' | 'tvshow'
  ): Promise<number> {
    try {
      const [allGenres, sourceGenres, targetGenres] = await Promise.all([
        this.getAllGenres(),
        this.getItemGenres(sourceItemId, sourceType),
        this.getItemGenres(targetItemId, targetType)
      ]);

      const sourceVector = this.createOneHotEncoding(sourceGenres, allGenres);
      const targetVector = this.createOneHotEncoding(targetGenres, allGenres);

      return this.calculateCosineSimilarity(sourceVector, targetVector);
    } catch (error) {
      console.error('Error calculating item similarity:', error);
      return 0;
    }
  }
  /**
   * Get recommendations for a specific item
   */
  public async getRecommendationsForItem(
    itemId: string,
    itemType: 'movie' | 'tvshow',
    limit: number = 10
  ): Promise<any[]> {
    try {
      console.log(`Getting recommendations for ${itemType} ${itemId}`);

      // Check MongoDB cache first
      const cachedRecommendations = await mongoService.getCachedRecommendations(itemId, itemType);
      if (cachedRecommendations) {
        return cachedRecommendations.slice(0, limit);
      }

      // Get source item genres
      const sourceGenres = await this.getItemGenres(itemId, itemType);
      if (sourceGenres.length === 0) {
        console.log('No genres found for source item');
        return [];
      }

      console.log(`Source genres: ${sourceGenres.join(', ')}`);

      // Get all genres for one-hot encoding
      const allGenres = await this.getAllGenres();
      const sourceVector = this.createOneHotEncoding(sourceGenres, allGenres);

      // Get candidate items (same type, different ID)
      const candidateTable = itemType === 'movie' ? 'movies' : 'tv_shows';
      const genreTable = itemType === 'movie' ? 'movie_genres' : 'tvshow_genres';
      const idColumn = itemType === 'movie' ? 'movie_id' : 'tvshow_id';

      const candidatesQuery = `
        SELECT DISTINCT 
          c.show_id,
          c.title,
          c.vote_average,
          c.popularity,
          c.release_year,
          ARRAY_AGG(DISTINCT g.name) as genres
        FROM ${candidateTable} c
        JOIN ${genreTable} cg ON c.show_id = cg.${idColumn}
        JOIN genres g ON cg.genre_id = g.id
        WHERE c.show_id != $1
          AND c.vote_average > 0
        GROUP BY c.show_id, c.title, c.vote_average, c.popularity, c.release_year
        HAVING COUNT(DISTINCT g.id) > 0
        ORDER BY c.popularity DESC
        LIMIT $2
      `;

      const candidates = await pgPool.query(candidatesQuery, [itemId, limit * 3]); // Get more candidates to filter

      // Calculate similarities
      const recommendations = [];
      for (const candidate of candidates.rows) {
        const candidateGenres = candidate.genres || [];
        const candidateVector = this.createOneHotEncoding(candidateGenres, allGenres);
        const similarity = this.calculateCosineSimilarity(sourceVector, candidateVector);

        if (similarity > 0.1) { // Minimum similarity threshold
          recommendations.push({
            ...candidate,
            similarity_score: Math.round(similarity * 1000) / 1000, // Round to 3 decimal places
            match_reasons: this.getMatchReasons(sourceGenres, candidateGenres),
            confidence_level: this.getConfidenceLevel(similarity)
          });
        }      }

      // Sort by similarity and return top results
      const finalRecommendations = recommendations
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, limit);

      // Cache the results in MongoDB
      if (finalRecommendations.length > 0) {
        await mongoService.cacheRecommendations(itemId, itemType, finalRecommendations, 24);
      }

      return finalRecommendations;

    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Get recommendations based on multiple genres
   */  public async getRecommendationsByGenres(
    preferredGenres: string[],
    contentType: 'movies' | 'tvshows' | 'both',
    limit: number = 20
  ): Promise<any[]> {
    try {
      console.log(`Getting recommendations for genres: ${preferredGenres.join(', ')}`);      // Check MongoDB cache first
      const cachedRecommendations = await mongoService.getCachedGenreRecommendations(
        preferredGenres, 
        contentType
      );
      if (cachedRecommendations) {
        return cachedRecommendations.slice(0, limit);
      }

      // Get all genres for one-hot encoding
      const allGenres = await this.getAllGenres();
      const preferredVector = this.createOneHotEncoding(preferredGenres, allGenres);

      let results: any[] = [];

      // Get movies if requested
      if (contentType === 'movies' || contentType === 'both') {
        const moviesQuery = `
          SELECT DISTINCT 
            m.show_id,
            m.title,
            m.vote_average,
            m.popularity,
            m.release_year,
            ARRAY_AGG(DISTINCT g.name) as genres
          FROM movies m
          JOIN movie_genres mg ON m.show_id = mg.movie_id
          JOIN genres g ON mg.genre_id = g.id
          WHERE g.name = ANY($1)
            AND m.vote_average > 0
          GROUP BY m.show_id, m.title, m.vote_average, m.popularity, m.release_year
          ORDER BY m.popularity DESC
          LIMIT $2
        `;

        const moviesResult = await pgPool.query(moviesQuery, [preferredGenres, limit]);
        const movies = moviesResult.rows.map(movie => ({
          ...movie,
          content_type: 'movie'
        }));
        results = results.concat(movies);
      }

      // Get TV shows if requested
      if (contentType === 'tvshows' || contentType === 'both') {
        const tvShowsQuery = `
          SELECT DISTINCT 
            t.show_id,
            t.title,
            t.vote_average,
            t.popularity,
            t.release_year,
            ARRAY_AGG(DISTINCT g.name) as genres
          FROM tv_shows t
          JOIN tvshow_genres tg ON t.show_id = tg.tvshow_id
          JOIN genres g ON tg.genre_id = g.id
          WHERE g.name = ANY($1)
            AND t.vote_average > 0
          GROUP BY t.show_id, t.title, t.vote_average, t.popularity, t.release_year
          ORDER BY t.popularity DESC
          LIMIT $2
        `;

        const tvShowsResult = await pgPool.query(tvShowsQuery, [preferredGenres, limit]);
        const tvShows = tvShowsResult.rows.map(tvShow => ({
          ...tvShow,
          content_type: 'tvshow'
        }));
        results = results.concat(tvShows);
      }

      // Calculate similarities for all results
      const recommendationsWithSimilarity = results.map(item => {
        const itemGenres = item.genres || [];
        const itemVector = this.createOneHotEncoding(itemGenres, allGenres);
        const similarity = this.calculateCosineSimilarity(preferredVector, itemVector);

        return {
          ...item,
          similarity_score: Math.round(similarity * 1000) / 1000,
          match_reasons: this.getMatchReasons(preferredGenres, itemGenres),
          confidence_level: this.getConfidenceLevel(similarity)
        };
      });      // Sort by similarity and return top results
      const finalRecommendations = recommendationsWithSimilarity
        .sort((a, b) => {
          // Primary sort by similarity
          if (b.similarity_score !== a.similarity_score) {
            return b.similarity_score - a.similarity_score;
          }
          // Secondary sort by rating
          return b.vote_average - a.vote_average;
        })
        .slice(0, limit);

      // Cache the results in MongoDB
      if (finalRecommendations.length > 0) {
        await mongoService.cacheGenreRecommendations(
          preferredGenres, 
          contentType, 
          finalRecommendations, 
          12 // 12 hours TTL for genre-based recommendations
        );
      }

      return finalRecommendations;

    } catch (error) {
      console.error('Error getting genre-based recommendations:', error);
      return [];
    }
  }

  /**
   * Get match reasons between two genre sets
   */
  private getMatchReasons(sourceGenres: string[], targetGenres: string[]): string[] {
    const commonGenres = sourceGenres.filter(genre => targetGenres.includes(genre));
    
    if (commonGenres.length === 0) return ['Similar content style'];
    if (commonGenres.length === 1) return [`Same ${commonGenres[0]} genre`];
    if (commonGenres.length === 2) return [`Same ${commonGenres.join(' and ')} genres`];
    
    return [`Multiple shared genres: ${commonGenres.slice(0, 3).join(', ')}`];
  }

  /**
   * Get confidence level based on similarity score
   */
  private getConfidenceLevel(similarity: number): 'high' | 'medium' | 'low' {
    if (similarity >= 0.7) return 'high';
    if (similarity >= 0.4) return 'medium';
    return 'low';
  }
}

export const recommendationEngine = new SimpleRecommendationEngine();
