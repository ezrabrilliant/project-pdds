import { Router } from 'express';
import { APIResponse } from '../types';
import { recommendationEngine } from '../services/recommendationEngine';
import { mongoService } from '../services/mongoService';

const router = Router();

// Get recommendations based on a specific movie
router.get('/movie/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    console.log(`Getting movie recommendations for ID: ${id}`);

    // Use the new recommendation engine
    const recommendations = await recommendationEngine.getRecommendationsForItem(
      id,
      'movie',
      Number(limit)
    );

    if (recommendations.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No recommendations found',
        message: 'Could not find similar movies or source movie does not exist'
      });
    }

    const response: APIResponse<any> = {
      success: true,
      data: {
        sourceMovie: {
          id: id,
          type: 'movie'
        },
        recommendations,
        algorithm: 'cosine_similarity_one_hot_encoding',
        totalRecommendations: recommendations.length
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error generating movie recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get recommendations based on a specific TV show
router.get('/tvshow/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    console.log(`Getting TV show recommendations for ID: ${id}`);

    // Use the new recommendation engine
    const recommendations = await recommendationEngine.getRecommendationsForItem(
      id,
      'tvshow',
      Number(limit)
    );

    if (recommendations.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No recommendations found',
        message: 'Could not find similar TV shows or source TV show does not exist'
      });
    }

    const response: APIResponse<any> = {
      success: true,
      data: {
        sourceTVShow: {
          id: id,
          type: 'tvshow'
        },
        recommendations,
        algorithm: 'cosine_similarity_one_hot_encoding',
        totalRecommendations: recommendations.length
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error generating TV show recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get recommendations based on multiple genres
router.post('/by-genres', async (req, res) => {
  try {
    const { 
      genres = [], 
      type = 'all', // 'movies', 'tvshows', 'all'
      limit = 20,
      minRating = 0,
      minYear = 2000
    } = req.body;

    if (!Array.isArray(genres) || genres.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Genres are required',
        message: 'Please provide at least one genre'
      });
    }

    console.log(`Getting recommendations by genres: ${genres.join(', ')}`);    // Use the new recommendation engine
    const recommendations = await recommendationEngine.getRecommendationsByGenres(
      genres,
      type === 'all' ? 'both' : type,
      Number(limit)
    );

    const response: APIResponse<any> = {
      success: true,
      data: {
        requestedGenres: genres,
        recommendations,
        filters: {
          type,
          minRating: Number(minRating),
          minYear: Number(minYear),
          limit: Number(limit)
        },
        algorithm: 'cosine_similarity_genre_based',        totalRecommendations: recommendations.length
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error generating genre-based recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get personalized recommendations (simple version)
router.post('/personalized', async (req, res) => {
  try {
    const { 
      favoriteGenres = [],
      preferredType = 'all', // 'movies', 'tvshows', 'all'
      limit = 20
    } = req.body;

    if (favoriteGenres.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Favorite genres are required',
        message: 'Please provide at least one favorite genre'
      });
    }

    console.log(`Getting personalized recommendations for genres: ${favoriteGenres.join(', ')}`);

    // Use the new recommendation engine for genre-based recommendations
    const recommendations = await recommendationEngine.getRecommendationsByGenres(
      favoriteGenres,
      preferredType === 'all' ? 'both' : preferredType,
      Number(limit)
    );

    const response: APIResponse<any> = {
      success: true,
      data: {
        recommendations,
        preferences: {
          favoriteGenres,
          preferredType
        },
        algorithm: 'cosine_similarity_personalized'
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate personalized recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get cache statistics
router.get('/cache/stats', async (req, res) => {
  try {
    const stats = await mongoService.getCacheStats();
    
    const response: APIResponse<any> = {
      success: true,
      data: stats
    };

    res.json(response);
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Clear cache
router.delete('/cache', async (req, res) => {
  try {
    await mongoService.clearAllCaches();
    
    const response: APIResponse<any> = {
      success: true,
      data: { message: 'Cache cleared successfully' }
    };

    res.json(response);
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
