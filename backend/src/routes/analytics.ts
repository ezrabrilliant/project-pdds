import { Router } from 'express';
import { pgPool } from '../config/database';
import { APIResponse } from '../types';

const router = Router();

// Get overall statistics
router.get('/stats', async (req, res) => {
  try {    // Basic counts only
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

    // Most popular countries
    const countriesQuery = `
      SELECT 
        TRIM(country) as country,
        COUNT(*) as content_count,
        COUNT(CASE WHEN release_year >= 2020 THEN 1 END) as recent_count
      FROM (
        SELECT country FROM movies WHERE country IS NOT NULL
        UNION ALL
        SELECT country FROM tv_shows WHERE country IS NOT NULL
      ) combined
      WHERE TRIM(country) != ''
      GROUP BY TRIM(country)
      ORDER BY content_count DESC
      LIMIT 10
    `;

    const countriesResult = await pgPool.query(countriesQuery);    // Content by year distribution
    const yearDistributionQuery = `
      SELECT 
        release_year,
        COUNT(CASE WHEN content_type = 'movie' THEN 1 END) as movies,
        COUNT(CASE WHEN content_type = 'tvshow' THEN 1 END) as tvshows,
        COUNT(*) as total
      FROM (
        SELECT release_year, 'movie' as content_type FROM movies WHERE release_year IS NOT NULL
        UNION ALL
        SELECT release_year, 'tvshow' as content_type FROM tv_shows WHERE release_year IS NOT NULL
      ) as combined
      WHERE release_year >= 2010
      GROUP BY release_year
      ORDER BY release_year DESC
      LIMIT 15
    `;

    const yearDistributionResult = await pgPool.query(yearDistributionQuery);    const response: APIResponse<any> = {
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

// Get genre analytics
router.get('/genres', async (req, res) => {
  try {
    const genreAnalyticsQuery = `
      SELECT 
        g.name as genre,
        COUNT(DISTINCT mg.movie_id) as movie_count,
        COUNT(DISTINCT tg.tvshow_id) as tvshow_count,
        COUNT(DISTINCT mg.movie_id) + COUNT(DISTINCT tg.tvshow_id) as total_count,
        ROUND(AVG(CASE WHEN m.vote_average > 0 THEN m.vote_average END), 2) as avg_movie_rating,
        ROUND(AVG(CASE WHEN t.vote_average > 0 THEN t.vote_average END), 2) as avg_tvshow_rating,
        ROUND(AVG(CASE WHEN m.popularity > 0 THEN m.popularity END), 2) as avg_movie_popularity,
        ROUND(AVG(CASE WHEN t.popularity > 0 THEN t.popularity END), 2) as avg_tvshow_popularity
      FROM genres g
      LEFT JOIN movie_genres mg ON g.id = mg.genre_id
      LEFT JOIN tvshow_genres tg ON g.id = tg.genre_id
      LEFT JOIN movies m ON mg.movie_id = m.show_id
      LEFT JOIN tv_shows t ON tg.tvshow_id = t.show_id
      GROUP BY g.id, g.name
      HAVING COUNT(DISTINCT mg.movie_id) + COUNT(DISTINCT tg.tvshow_id) > 0
      ORDER BY total_count DESC
    `;

    const result = await pgPool.query(genreAnalyticsQuery);

    const response: APIResponse<any> = {
      success: true,
      data: {
        genreAnalytics: result.rows,
        totalGenres: result.rows.length
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

// Get rating distribution analytics
router.get('/ratings', async (req, res) => {
  try {
    const ratingsQuery = `
      SELECT 
        rating,
        COUNT(CASE WHEN content_type = 'movie' THEN 1 END) as movies,
        COUNT(CASE WHEN content_type = 'tvshow' THEN 1 END) as tvshows,
        COUNT(*) as total,
        ROUND(AVG(vote_average), 2) as avg_score,
        ROUND(AVG(popularity), 2) as avg_popularity
      FROM (
        SELECT rating, vote_average, popularity, 'movie' as content_type 
        FROM movies WHERE rating IS NOT NULL
        UNION ALL
        SELECT rating, vote_average, popularity, 'tvshow' as content_type 
        FROM tv_shows WHERE rating IS NOT NULL
      ) combined
      GROUP BY rating
      ORDER BY total DESC
    `;

    const result = await pgPool.query(ratingsQuery);

    const response: APIResponse<any> = {
      success: true,
      data: {
        ratingDistribution: result.rows
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching rating analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rating analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get top performers (highest rated, most popular)
router.get('/top-performers', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Top rated movies
    const topRatedMoviesQuery = `
      SELECT 
        m.show_id, m.title, m.vote_average, m.vote_count, m.popularity, m.release_year,
        string_agg(DISTINCT g.name, ', ') as genres
      FROM movies m
      LEFT JOIN movie_genres mg ON m.show_id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      WHERE m.vote_count >= 100
      GROUP BY m.show_id
      ORDER BY m.vote_average DESC, m.vote_count DESC
      LIMIT $1
    `;

    // Top rated TV shows
    const topRatedTVShowsQuery = `
      SELECT 
        t.show_id, t.title, t.vote_average, t.vote_count, t.popularity, t.release_year,
        string_agg(DISTINCT g.name, ', ') as genres
      FROM tv_shows t
      LEFT JOIN tvshow_genres tg ON t.show_id = tg.tvshow_id
      LEFT JOIN genres g ON tg.genre_id = g.id
      WHERE t.vote_count >= 50
      GROUP BY t.show_id
      ORDER BY t.vote_average DESC, t.vote_count DESC
      LIMIT $1
    `;

    // Most popular movies
    const mostPopularMoviesQuery = `
      SELECT 
        m.show_id, m.title, m.popularity, m.vote_average, m.vote_count, m.release_year,
        string_agg(DISTINCT g.name, ', ') as genres
      FROM movies m
      LEFT JOIN movie_genres mg ON m.show_id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      GROUP BY m.show_id
      ORDER BY m.popularity DESC
      LIMIT $1
    `;

    // Most popular TV shows
    const mostPopularTVShowsQuery = `
      SELECT 
        t.show_id, t.title, t.popularity, t.vote_average, t.vote_count, t.release_year,
        string_agg(DISTINCT g.name, ', ') as genres
      FROM tv_shows t
      LEFT JOIN tvshow_genres tg ON t.show_id = tg.tvshow_id
      LEFT JOIN genres g ON tg.genre_id = g.id
      GROUP BY t.show_id
      ORDER BY t.popularity DESC
      LIMIT $1
    `;

    const [topRatedMovies, topRatedTVShows, mostPopularMovies, mostPopularTVShows] = await Promise.all([
      pgPool.query(topRatedMoviesQuery, [Number(limit)]),
      pgPool.query(topRatedTVShowsQuery, [Number(limit)]),
      pgPool.query(mostPopularMoviesQuery, [Number(limit)]),
      pgPool.query(mostPopularTVShowsQuery, [Number(limit)])
    ]);

    const response: APIResponse<any> = {
      success: true,
      data: {
        topRated: {
          movies: topRatedMovies.rows,
          tvShows: topRatedTVShows.rows
        },
        mostPopular: {
          movies: mostPopularMovies.rows,
          tvShows: mostPopularTVShows.rows
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching top performers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top performers',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get trending content (recent high-rated content)
router.get('/trending', async (req, res) => {
  try {
    const { limit = 20, years = 3 } = req.query;
    const cutoffYear = new Date().getFullYear() - Number(years);

    const trendingQuery = `
      SELECT 
        title, content_type, vote_average, popularity, release_year, show_id,
        genres,
        CASE 
          WHEN vote_average >= 8.0 AND popularity >= 50 THEN 'hot'
          WHEN vote_average >= 7.0 AND popularity >= 30 THEN 'trending'
          ELSE 'rising'
        END as trend_status
      FROM (
        SELECT 
          m.title, 'movie' as content_type, m.vote_average, m.popularity, 
          m.release_year, m.show_id,
          string_agg(DISTINCT g.name, ', ') as genres
        FROM movies m
        LEFT JOIN movie_genres mg ON m.show_id = mg.movie_id
        LEFT JOIN genres g ON mg.genre_id = g.id
        WHERE m.release_year >= $2 AND m.vote_count >= 20
        GROUP BY m.show_id
        
        UNION ALL
        
        SELECT 
          t.title, 'tvshow' as content_type, t.vote_average, t.popularity,
          t.release_year, t.show_id,
          string_agg(DISTINCT g.name, ', ') as genres
        FROM tv_shows t
        LEFT JOIN tvshow_genres tg ON t.show_id = tg.tvshow_id
        LEFT JOIN genres g ON tg.genre_id = g.id
        WHERE t.release_year >= $2 AND t.vote_count >= 10
        GROUP BY t.show_id
      ) combined
      ORDER BY 
        CASE trend_status 
          WHEN 'hot' THEN 1 
          WHEN 'trending' THEN 2 
          ELSE 3 
        END,
        popularity DESC
      LIMIT $1
    `;

    const result = await pgPool.query(trendingQuery, [Number(limit), cutoffYear]);

    const response: APIResponse<any> = {
      success: true,
      data: {
        trending: result.rows,
        filters: {
          yearsBack: Number(years),
          cutoffYear,
          limit: Number(limit)
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching trending content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending content',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
