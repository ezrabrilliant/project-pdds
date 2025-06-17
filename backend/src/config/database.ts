import { Pool } from 'pg';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

// PostgreSQL Configuration
export const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// MongoDB Configuration
export const mongoClient = new MongoClient(process.env.MONGODB_URI || '');

// Database connection functions
export const connectPostgreSQL = async () => {
  try {
    await pgPool.connect();
    console.log('✅ Connected to PostgreSQL (Supabase)');
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    throw error;
  }
};

export const connectMongoDB = async () => {
  try {
    await mongoClient.connect();
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

// Get MongoDB database instance
export const getMongoDatabase = () => {
  return mongoClient.db('netflix_recommendations');
};

// Health check functions
export const checkDatabaseHealth = async () => {
  const health = {
    postgresql: false,
    mongodb: false,
  };

  try {
    await pgPool.query('SELECT 1');
    health.postgresql = true;
  } catch (error) {
    console.error('PostgreSQL health check failed:', error);
  }

  try {
    await mongoClient.db('admin').command({ ping: 1 });
    health.mongodb = true;
  } catch (error) {
    console.error('MongoDB health check failed:', error);
  }

  return health;
};
