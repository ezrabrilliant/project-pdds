import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { connectPostgreSQL, connectMongoDB, checkDatabaseHealth } from './config/database';

// Import routes
import moviesRouter from './routes/movies';
import tvShowsRouter from './routes/tvshows';
import genresRouter from './routes/genres';
import recommendationsRouter from './routes/recommendations';
import analyticsRouter from './routes/analytics-simple';
import searchRouter from './routes/search';

// Load environment variables
dotenv.config({ path: '../.env' });

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', async (req, res) => {
  try {
    const health = await checkDatabaseHealth();
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'Netflix Recommendation API',
      databases: health,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API routes
app.use('/api/movies', moviesRouter);
app.use('/api/tvshows', tvShowsRouter);
app.use('/api/genres', genresRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/search', searchRouter);

// Main API info
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Netflix Recommendation API v1.0',
    endpoints: {
      health: '/health',
      movies: '/api/movies',
      tvshows: '/api/tvshows',
      genres: '/api/genres',
      recommendations: '/api/recommendations',
      analytics: '/api/analytics',
      search: '/api/search'
    }
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', async () => {
  try {
    console.log('🚀 Starting Netflix Recommendation API...');
    
    // Connect to databases
    await connectPostgreSQL();
    await connectMongoDB();
    
    const isProduction = process.env.NODE_ENV === 'production';
    const host = isProduction ? '0.0.0.0' : '31.57.241.234';
    
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📊 Health check: http://${host}:${PORT}/health`);
    console.log(`🎬 Movies API: http://${host}:${PORT}/api/movies`);
    console.log(`📺 TV Shows API: http://${host}:${PORT}/api/tvshows`);
    
    if (isProduction) {
      console.log(`🌐 Server accessible from external IPs on port ${PORT}`);
    }
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
});

export default app;
