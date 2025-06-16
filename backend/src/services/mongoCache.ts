import { getMongoDatabase } from '../config/database';
import { Collection } from 'mongodb';

interface CachedRecommendation {
  _id?: string;
  sourceItemId: string;
  sourceItemType: 'movie' | 'tvshow';
  recommendations: any[];
  algorithm: string;
  createdAt: Date;
  expiresAt: Date;
}

interface CachedGenreRecommendation {
  _id?: string;
  preferredGenres: string[];
  contentType: 'movies' | 'tvshows' | 'both';
  recommendations: any[];
  algorithm: string;
  createdAt: Date;
  expiresAt: Date;
}

export class MongoRecommendationCache {
  private itemRecommendationsCollection: Collection<CachedRecommendation>;
  private genreRecommendationsCollection: Collection<CachedGenreRecommendation>;

  constructor() {
    const db = getMongoDatabase();
    this.itemRecommendationsCollection = db.collection('item_recommendations');
    this.genreRecommendationsCollection = db.collection('genre_recommendations');
  }

  /**
   * Initialize indexes for better performance
   */
  async initializeIndexes(): Promise<void> {
    try {
      // Item recommendations indexes
      await this.itemRecommendationsCollection.createIndex(
        { sourceItemId: 1, sourceItemType: 1 }, 
        { unique: true }
      );
      await this.itemRecommendationsCollection.createIndex(
        { expiresAt: 1 }, 
        { expireAfterSeconds: 0 }
      );

      // Genre recommendations indexes
      await this.genreRecommendationsCollection.createIndex(
        { preferredGenres: 1, contentType: 1 }, 
        { unique: true }
      );
      await this.genreRecommendationsCollection.createIndex(
        { expiresAt: 1 }, 
        { expireAfterSeconds: 0 }
      );

      console.log('✅ MongoDB recommendation cache indexes initialized');
    } catch (error) {
      console.error('❌ Error initializing MongoDB indexes:', error);
    }
  }

  /**
   * Cache item-based recommendations
   */
  async cacheItemRecommendations(
    sourceItemId: string,
    sourceItemType: 'movie' | 'tvshow',
    recommendations: any[],
    algorithm: string = 'cosine_similarity_one_hot'
  ): Promise<void> {
    try {
      const cacheData: CachedRecommendation = {
        sourceItemId,
        sourceItemType,
        recommendations,
        algorithm,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      await this.itemRecommendationsCollection.replaceOne(
        { sourceItemId, sourceItemType },
        cacheData,
        { upsert: true }
      );

      console.log(`✅ Cached recommendations for ${sourceItemType} ${sourceItemId}`);
    } catch (error) {
      console.error('❌ Error caching item recommendations:', error);
    }
  }

  /**
   * Get cached item-based recommendations
   */
  async getCachedItemRecommendations(
    sourceItemId: string,
    sourceItemType: 'movie' | 'tvshow'
  ): Promise<any[] | null> {
    try {
      const cached = await this.itemRecommendationsCollection.findOne({
        sourceItemId,
        sourceItemType,
        expiresAt: { $gt: new Date() }
      });

      if (cached) {
        console.log(`✅ Found cached recommendations for ${sourceItemType} ${sourceItemId}`);
        return cached.recommendations;
      }

      return null;
    } catch (error) {
      console.error('❌ Error getting cached item recommendations:', error);
      return null;
    }
  }

  /**
   * Cache genre-based recommendations
   */
  async cacheGenreRecommendations(
    preferredGenres: string[],
    contentType: 'movies' | 'tvshows' | 'both',
    recommendations: any[],
    algorithm: string = 'cosine_similarity_one_hot'
  ): Promise<void> {
    try {
      // Sort genres for consistent caching
      const sortedGenres = [...preferredGenres].sort();

      const cacheData: CachedGenreRecommendation = {
        preferredGenres: sortedGenres,
        contentType,
        recommendations,
        algorithm,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours (shorter for genre-based)
      };

      await this.genreRecommendationsCollection.replaceOne(
        { preferredGenres: sortedGenres, contentType },
        cacheData,
        { upsert: true }
      );

      console.log(`✅ Cached genre recommendations for ${sortedGenres.join(', ')}`);
    } catch (error) {
      console.error('❌ Error caching genre recommendations:', error);
    }
  }

  /**
   * Get cached genre-based recommendations
   */
  async getCachedGenreRecommendations(
    preferredGenres: string[],
    contentType: 'movies' | 'tvshows' | 'both'
  ): Promise<any[] | null> {
    try {
      // Sort genres for consistent lookup
      const sortedGenres = [...preferredGenres].sort();

      const cached = await this.genreRecommendationsCollection.findOne({
        preferredGenres: sortedGenres,
        contentType,
        expiresAt: { $gt: new Date() }
      });

      if (cached) {
        console.log(`✅ Found cached genre recommendations for ${sortedGenres.join(', ')}`);
        return cached.recommendations;
      }

      return null;
    } catch (error) {
      console.error('❌ Error getting cached genre recommendations:', error);
      return null;
    }
  }

  /**
   * Clear expired cache entries (manual cleanup)
   */
  async clearExpiredCache(): Promise<void> {
    try {
      const now = new Date();
      
      const itemResult = await this.itemRecommendationsCollection.deleteMany({
        expiresAt: { $lt: now }
      });
      
      const genreResult = await this.genreRecommendationsCollection.deleteMany({
        expiresAt: { $lt: now }
      });

      console.log(`✅ Cleared ${itemResult.deletedCount} expired item recommendations`);
      console.log(`✅ Cleared ${genreResult.deletedCount} expired genre recommendations`);
    } catch (error) {
      console.error('❌ Error clearing expired cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    try {
      const [itemCount, genreCount, itemExpired, genreExpired] = await Promise.all([
        this.itemRecommendationsCollection.countDocuments(),
        this.genreRecommendationsCollection.countDocuments(),
        this.itemRecommendationsCollection.countDocuments({ expiresAt: { $lt: new Date() } }),
        this.genreRecommendationsCollection.countDocuments({ expiresAt: { $lt: new Date() } })
      ]);

      return {
        itemRecommendations: {
          total: itemCount,
          active: itemCount - itemExpired,
          expired: itemExpired
        },
        genreRecommendations: {
          total: genreCount,
          active: genreCount - genreExpired,
          expired: genreExpired
        }
      };
    } catch (error) {
      console.error('❌ Error getting cache stats:', error);
      return null;
    }
  }
}

export const mongoCache = new MongoRecommendationCache();
