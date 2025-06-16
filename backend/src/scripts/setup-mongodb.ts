import { MongoClient, Db } from 'mongodb';
import { getMongoDatabase } from '../config/database';

// Collection schemas
interface UserPreferences {
  _id?: string;
  userId: string;
  preferredGenres: string[];
  favoriteMovies: string[];
  favoriteTVShows: string[];
  watchHistory: {
    contentId: string;
    contentType: 'movie' | 'tvshow';
    watchedAt: Date;
    rating?: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface RecommendationCache {
  _id?: string;
  contentId: string;
  contentType: 'movie' | 'tvshow';
  recommendations: {
    contentId: string;
    contentType: 'movie' | 'tvshow';
    similarity_score: number;
    match_reasons: string[];
    confidence_level: 'high' | 'medium' | 'low';
  }[];
  generatedAt: Date;
  expiresAt: Date;
}

interface AnalyticsData {
  _id?: string;
  type: 'daily' | 'weekly' | 'monthly';
  date: Date;
  metrics: {
    totalMovies: number;
    totalTVShows: number;
    totalGenres: number;
    popularGenres: { genre: string; count: number }[];
    topRatedContent: { contentId: string; rating: number; type: string }[];
    countryDistribution: { country: string; count: number }[];
    yearDistribution: { year: number; count: number }[];
    dataQualityMetrics: {
      moviesCompleteness: number;
      tvShowsCompleteness: number;
      averageFieldsComplete: number;
    };
  };
  createdAt: Date;
}

interface SearchLogs {
  _id?: string;
  sessionId: string;
  searchQuery?: string;
  filters: {
    genre?: string;
    country?: string;
    year?: number;
    rating?: string;
    contentType?: 'movie' | 'tvshow';
  };
  results: {
    totalFound: number;
    clickedContent?: string[];
  };
  searchedAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export async function setupMongoDB(): Promise<void> {
  try {
    console.log('🍃 Setting up MongoDB collections...');
    
    const db = getMongoDatabase();
    
    // Create collections if they don't exist
    const collections = ['user_preferences', 'recommendation_cache', 'analytics_data', 'search_logs'];
    
    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } catch (error: any) {
        if (error.code === 48) {
          console.log(`📝 Collection already exists: ${collectionName}`);
        } else {
          throw error;
        }
      }
    }
    
    // Create indexes for better performance
    await createIndexes(db);
    
    // Insert sample analytics data
    await insertSampleData(db);
    
    console.log('🎉 MongoDB setup completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB setup failed:', error);
    throw error;
  }
}

async function createIndexes(db: Db): Promise<void> {
  console.log('📊 Creating MongoDB indexes...');
  
  // User preferences indexes
  await db.collection('user_preferences').createIndexes([
    { key: { userId: 1 }, unique: true },
    { key: { preferredGenres: 1 } },
    { key: { updatedAt: 1 } }
  ]);
  
  // Recommendation cache indexes
  await db.collection('recommendation_cache').createIndexes([
    { key: { contentId: 1, contentType: 1 }, unique: true },
    { key: { expiresAt: 1 }, expireAfterSeconds: 0 }, // TTL index
    { key: { generatedAt: 1 } }
  ]);
  
  // Analytics data indexes
  await db.collection('analytics_data').createIndexes([
    { key: { type: 1, date: 1 }, unique: true },
    { key: { date: 1 } },
    { key: { type: 1 } }
  ]);
  
  // Search logs indexes
  await db.collection('search_logs').createIndexes([
    { key: { sessionId: 1 } },
    { key: { searchedAt: 1 } },
    { key: { 'filters.genre': 1 } },
    { key: { 'filters.contentType': 1 } }
  ]);
  
  console.log('✅ MongoDB indexes created');
}

async function insertSampleData(db: Db): Promise<void> {
  console.log('📝 Inserting sample MongoDB data...');
  
  // Sample user preferences
  const sampleUserPrefs: UserPreferences = {
    userId: 'sample_user_1',
    preferredGenres: ['Action', 'Sci-Fi', 'Thriller'],
    favoriteMovies: ['10192', '27205'], // Shrek, Inception
    favoriteTVShows: ['1402'], // Walking Dead
    watchHistory: [
      {
        contentId: '27205',
        contentType: 'movie',
        watchedAt: new Date(),
        rating: 9
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };
    await db.collection('user_preferences').insertOne(sampleUserPrefs as any);
  
  // Sample analytics data
  const sampleAnalytics: AnalyticsData = {
    type: 'daily',
    date: new Date(),
    metrics: {
      totalMovies: 0, // Will be updated after import
      totalTVShows: 0, // Will be updated after import
      totalGenres: 0, // Will be updated after import
      popularGenres: [],
      topRatedContent: [],
      countryDistribution: [],
      yearDistribution: [],
      dataQualityMetrics: {
        moviesCompleteness: 0.75,
        tvShowsCompleteness: 0.68,
        averageFieldsComplete: 0.72
      }
    },
    createdAt: new Date()
  };
  
  await db.collection('analytics_data').insertOne(sampleAnalytics as any);
  
  console.log('✅ Sample MongoDB data inserted');
}

// Helper function to update analytics after PostgreSQL import
export async function updateAnalyticsAfterImport(): Promise<void> {
  try {
    console.log('📊 Updating analytics data after import...');
    
    const db = getMongoDatabase();
    
    // This would typically fetch data from PostgreSQL and update MongoDB
    // For now, we'll create a placeholder
    const analyticsUpdate = {
      type: 'daily',
      date: new Date(),
      metrics: {
        totalMovies: 16000, // Placeholder - will be real data after import
        totalTVShows: 16000, // Placeholder - will be real data after import
        totalGenres: 50, // Placeholder - will be real data after import
        popularGenres: [
          { genre: 'Drama', count: 3500 },
          { genre: 'Comedy', count: 2800 },
          { genre: 'Action', count: 2200 },
          { genre: 'Thriller', count: 1900 },
          { genre: 'Romance', count: 1600 }
        ],
        topRatedContent: [],
        countryDistribution: [
          { country: 'United States', count: 8000 },
          { country: 'India', count: 2500 },
          { country: 'United Kingdom', count: 1800 },
          { country: 'Canada', count: 1200 },
          { country: 'France', count: 1000 }
        ],
        yearDistribution: [],
        dataQualityMetrics: {
          moviesCompleteness: 0.75,
          tvShowsCompleteness: 0.68,
          averageFieldsComplete: 0.72
        }
      },
      createdAt: new Date()
    };
    
    await db.collection('analytics_data').replaceOne(
      { type: 'daily', date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      analyticsUpdate,
      { upsert: true }
    );
    
    console.log('✅ Analytics data updated');
    
  } catch (error) {
    console.error('❌ Failed to update analytics:', error);
    throw error;
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupMongoDB()
    .then(() => {
      console.log('✅ MongoDB setup script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ MongoDB setup script failed:', error);
      process.exit(1);
    });
}
