import { getMongoDatabase } from '../config/database';
import { Collection } from 'mongodb';

interface CachedRecommendation {
  itemId: string;
  itemType: 'movie' | 'tvshow';
  recommendations: any[];
  timestamp: Date;
  expiresAt: Date;
}

interface CachedGenreRecommendation {
  genres: string[];
  contentType: 'movies' | 'tvshows' | 'both';
  recommendations: any[];
  timestamp: Date;
  expiresAt: Date;
}

export class MongoService {
  private static instance: MongoService;
  private recommendationCache: Collection<CachedRecommendation> | null = null;
  private genreRecommendationCache: Collection<CachedGenreRecommendation> | null = null;

  private constructor() {
    this.initializeCollections();
  }

  public static getInstance(): MongoService {
    if (!MongoService.instance) {
      MongoService.instance = new MongoService();
    }
    return MongoService.instance;
  }

  private async initializeCollections() {
    try {
      const db = getMongoDatabase();
      this.recommendationCache = db.collection<CachedRecommendation>('recommendation_cache');
      this.genreRecommendationCache = db.collection<CachedGenreRecommendation>('genre_recommendation_cache');

      // Create indexes for better performance
      await this.recommendationCache.createIndex({ itemId: 1, itemType: 1 });
      await this.recommendationCache.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      
      await this.genreRecommendationCache.createIndex({ genres: 1, contentType: 1 });
      await this.genreRecommendationCache.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

      console.log('✅ MongoDB collections initialized for caching');
    } catch (error) {
      console.error('❌ Error initializing MongoDB collections:', error);
    }
  }

  /**
   * Get cached recommendations for a specific item
   */
  async getCachedRecommendations(
    itemId: string, 
    itemType: 'movie' | 'tvshow'
  ): Promise<any[] | null> {
    try {
      if (!this.recommendationCache) {
        await this.initializeCollections();
      }

      const cached = await this.recommendationCache!.findOne({
        itemId,
        itemType,
        expiresAt: { $gt: new Date() }
      });

      if (cached) {
        console.log(`📦 Cache HIT for ${itemType} ${itemId}`);
        return cached.recommendations;
      }

      console.log(`🔍 Cache MISS for ${itemType} ${itemId}`);
      return null;
    } catch (error) {
      console.error('Error getting cached recommendations:', error);
      return null;
    }
  }

  /**
   * Cache recommendations for a specific item
   */
  async cacheRecommendations(
    itemId: string,
    itemType: 'movie' | 'tvshow',
    recommendations: any[],
    ttlHours: number = 24
  ): Promise<void> {
    try {
      if (!this.recommendationCache) {
        await this.initializeCollections();
      }

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + ttlHours);

      await this.recommendationCache!.replaceOne(
        { itemId, itemType },
        {
          itemId,
          itemType,
          recommendations,
          timestamp: new Date(),
          expiresAt
        },
        { upsert: true }
      );

      console.log(`💾 Cached recommendations for ${itemType} ${itemId} (${recommendations.length} items)`);
    } catch (error) {
      console.error('Error caching recommendations:', error);
    }
  }

  /**
   * Get cached genre-based recommendations
   */
  async getCachedGenreRecommendations(
    genres: string[],
    contentType: 'movies' | 'tvshows' | 'both'
  ): Promise<any[] | null> {
    try {
      if (!this.genreRecommendationCache) {
        await this.initializeCollections();
      }

      // Sort genres for consistent cache keys
      const sortedGenres = [...genres].sort();

      const cached = await this.genreRecommendationCache!.findOne({
        genres: { $all: sortedGenres, $size: sortedGenres.length },
        contentType,
        expiresAt: { $gt: new Date() }
      });

      if (cached) {
        console.log(`📦 Cache HIT for genres [${genres.join(', ')}] ${contentType}`);
        return cached.recommendations;
      }

      console.log(`🔍 Cache MISS for genres [${genres.join(', ')}] ${contentType}`);
      return null;
    } catch (error) {
      console.error('Error getting cached genre recommendations:', error);
      return null;
    }
  }

  /**
   * Cache genre-based recommendations
   */
  async cacheGenreRecommendations(
    genres: string[],
    contentType: 'movies' | 'tvshows' | 'both',
    recommendations: any[],
    ttlHours: number = 12
  ): Promise<void> {
    try {
      if (!this.genreRecommendationCache) {
        await this.initializeCollections();
      }

      // Sort genres for consistent cache keys
      const sortedGenres = [...genres].sort();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + ttlHours);

      await this.genreRecommendationCache!.replaceOne(
        { genres: { $all: sortedGenres, $size: sortedGenres.length }, contentType },
        {
          genres: sortedGenres,
          contentType,
          recommendations,
          timestamp: new Date(),
          expiresAt
        },
        { upsert: true }
      );

      console.log(`💾 Cached genre recommendations [${genres.join(', ')}] ${contentType} (${recommendations.length} items)`);
    } catch (error) {
      console.error('Error caching genre recommendations:', error);
    }
  }

  /**
   * Clear all caches (for maintenance)
   */
  async clearAllCaches(): Promise<void> {
    try {
      if (!this.recommendationCache || !this.genreRecommendationCache) {
        await this.initializeCollections();
      }

      await Promise.all([
        this.recommendationCache!.deleteMany({}),
        this.genreRecommendationCache!.deleteMany({})
      ]);

      console.log('🗑️ All recommendation caches cleared');
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    try {
      if (!this.recommendationCache || !this.genreRecommendationCache) {
        await this.initializeCollections();
      }

      const [itemCacheCount, genreCacheCount] = await Promise.all([
        this.recommendationCache!.countDocuments({ expiresAt: { $gt: new Date() } }),
        this.genreRecommendationCache!.countDocuments({ expiresAt: { $gt: new Date() } })
      ]);

      return {
        itemRecommendationsCached: itemCacheCount,
        genreRecommendationsCached: genreCacheCount,
        totalCached: itemCacheCount + genreCacheCount
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        itemRecommendationsCached: 0,
        genreRecommendationsCached: 0,
        totalCached: 0
      };
    }
  }
}

export const mongoService = MongoService.getInstance();
