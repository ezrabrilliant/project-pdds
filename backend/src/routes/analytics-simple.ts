import { Router } from 'express';
import { pgPool } from '../config/database';
import { APIResponse } from '../types';

const router = Router();

// Root analytics endpoint - returns comprehensive analytics
router.get('/', async (req, res) => {
  try {
    // Get basic stats
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM movies) as total_movies,
        (SELECT COUNT(*) FROM tv_shows) as total_tvshows,
        (SELECT COUNT(*) FROM genres) as total_genres,
        (SELECT COUNT(DISTINCT country) FROM movies WHERE country IS NOT NULL) as total_countries_movies,
        (SELECT COUNT(DISTINCT country) FROM tv_shows WHERE country IS NOT NULL) as total_countries_tvshows
    `;

    const statsResult = await pgPool.query(statsQuery);
    const stats = statsResult.rows[0];

    const response: APIResponse<any> = {
      success: true,
      data: {
        totalMovies: parseInt(stats.total_movies),
        totalTVShows: parseInt(stats.total_tvshows),
        totalGenres: parseInt(stats.total_genres),
        totalCountries: parseInt(stats.total_countries_movies) + parseInt(stats.total_countries_tvshows),
        totalContent: parseInt(stats.total_movies) + parseInt(stats.total_tvshows)
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get basic statistics
router.get('/stats', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM movies) as total_movies,
        (SELECT COUNT(*) FROM tv_shows) as total_tvshows,
        (SELECT COUNT(*) FROM genres) as total_genres,
        (SELECT COUNT(*) FROM movie_genres) as total_movie_genres,
        (SELECT COUNT(*) FROM tvshow_genres) as total_tvshow_genres
    `;

    const statsResult = await pgPool.query(statsQuery);
    const stats = statsResult.rows[0];

    const response: APIResponse<any> = {
      success: true,
      data: {
        overview: {
          totalMovies: parseInt(stats.total_movies),
          totalTVShows: parseInt(stats.total_tvshows),
          totalGenres: parseInt(stats.total_genres),
          totalMovieGenres: parseInt(stats.total_movie_genres),
          totalTVShowGenres: parseInt(stats.total_tvshow_genres)
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get genre statistics
router.get('/genres', async (req, res) => {
  try {
    const genreStatsQuery = `
      SELECT 
        g.name as genre,
        (SELECT COUNT(*) FROM movie_genres mg WHERE mg.genre_id = g.id) as movie_count,
        (SELECT COUNT(*) FROM tvshow_genres tg WHERE tg.genre_id = g.id) as tvshow_count
      FROM genres g
      ORDER BY g.name
    `;

    const result = await pgPool.query(genreStatsQuery);

    const genresWithTotals = result.rows.map(genre => ({
      ...genre,
      total_count: parseInt(genre.movie_count) + parseInt(genre.tvshow_count)
    }));

    const response: APIResponse<any> = {
      success: true,
      data: {
        genreAnalytics: genresWithTotals,
        totalGenres: genresWithTotals.length
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching genre analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch genre analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
