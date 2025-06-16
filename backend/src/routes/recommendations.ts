import { Router } from 'express';
import { pgPool } from '../config/database';
import { APIResponse } from '../types';

const router = Router();

// Get recommendations based on a specific movie
router.get('/movie/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    // First, get the source movie and its genres
    const sourceMovieQuery = `
      SELECT 
        m.*,
        ARRAY_AGG(DISTINCT g.name) as genres,
        ARRAY_AGG(DISTINCT g.id) as genre_ids
      FROM movies m
      LEFT JOIN movie_genres mg ON m.show_id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      WHERE m.show_id = $1
      GROUP BY m.show_id
    `;

    const sourceResult = await pgPool.query(sourceMovieQuery, [id]);

    if (sourceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found',
        message: `Movie with ID ${id} does not exist`
      });
    }

    const sourceMovie = sourceResult.rows[0];
    const sourceGenreIds = sourceMovie.genre_ids || [];

    if (sourceGenreIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No genres found',
        message: 'Cannot generate recommendations for movie without genres'
      });
    }

    // Find similar movies using genre-based similarity
    const recommendationsQuery = `
      WITH source_genres AS (
        SELECT UNNEST($1::int[]) as genre_id
      ),
      movie_similarities AS (
        SELECT 
          m.show_id,
          m.title,
          m.vote_average,
          m.popularity,
          m.release_year,
          string_agg(DISTINCT g.name, ', ') as genres,
          COUNT(DISTINCT sg.genre_id) as shared_genres,
          COUNT(DISTINCT mg.genre_id) as total_genres,
          ROUND(
            COUNT(DISTINCT sg.genre_id)::decimal / 
            GREATEST(COUNT(DISTINCT mg.genre_id), 1), 
            3
          ) as similarity_score
        FROM movies m
        JOIN movie_genres mg ON m.show_id = mg.movie_id
        LEFT JOIN source_genres sg ON mg.genre_id = sg.genre_id
        LEFT JOIN genres g ON mg.genre_id = g.id
        WHERE m.show_id != $2
        GROUP BY m.show_id, m.title, m.vote_average, m.popularity, m.release_year
        HAVING COUNT(DISTINCT sg.genre_id) > 0
      )
      SELECT 
        *,
        CASE 
          WHEN similarity_score >= 0.8 THEN 'very_similar'
          WHEN similarity_score >= 0.6 THEN 'similar'
          WHEN similarity_score >= 0.4 THEN 'somewhat_similar'
          ELSE 'related'
        END as similarity_level
      FROM movie_similarities
      ORDER BY 
        similarity_score DESC,
        vote_average DESC,
        popularity DESC
      LIMIT $3
    `;

    const recommendationsResult = await pgPool.query(recommendationsQuery, [
      sourceGenreIds,
      id,
      Number(limit)
    ]);

    const response: APIResponse<any> = {
      success: true,
      data: {
        sourceMovie: {
          id: sourceMovie.show_id,
          title: sourceMovie.title,
          genres: sourceMovie.genres
        },
        recommendations: recommendationsResult.rows,
        algorithm: 'genre_based_cosine_similarity',
        totalRecommendations: recommendationsResult.rows.length
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

    // First, get the source TV show and its genres
    const sourceTVShowQuery = `
      SELECT 
        t.*,
        ARRAY_AGG(DISTINCT g.name) as genres,
        ARRAY_AGG(DISTINCT g.id) as genre_ids
      FROM tv_shows t
      LEFT JOIN tvshow_genres tg ON t.show_id = tg.tvshow_id
      LEFT JOIN genres g ON tg.genre_id = g.id
      WHERE t.show_id = $1
      GROUP BY t.show_id
    `;

    const sourceResult = await pgPool.query(sourceTVShowQuery, [id]);

    if (sourceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'TV show not found',
        message: `TV show with ID ${id} does not exist`
      });
    }

    const sourceTVShow = sourceResult.rows[0];
    const sourceGenreIds = sourceTVShow.genre_ids || [];

    if (sourceGenreIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No genres found',
        message: 'Cannot generate recommendations for TV show without genres'
      });
    }

    // Find similar TV shows using genre-based similarity
    const recommendationsQuery = `
      WITH source_genres AS (
        SELECT UNNEST($1::int[]) as genre_id
      ),
      tvshow_similarities AS (
        SELECT 
          t.show_id,
          t.title,
          t.vote_average,
          t.popularity,
          t.release_year,
          string_agg(DISTINCT g.name, ', ') as genres,
          COUNT(DISTINCT sg.genre_id) as shared_genres,
          COUNT(DISTINCT tg.genre_id) as total_genres,
          ROUND(
            COUNT(DISTINCT sg.genre_id)::decimal / 
            GREATEST(COUNT(DISTINCT tg.genre_id), 1), 
            3
          ) as similarity_score
        FROM tv_shows t
        JOIN tvshow_genres tg ON t.show_id = tg.tvshow_id
        LEFT JOIN source_genres sg ON tg.genre_id = sg.genre_id
        LEFT JOIN genres g ON tg.genre_id = g.id
        WHERE t.show_id != $2
        GROUP BY t.show_id, t.title, t.vote_average, t.popularity, t.release_year
        HAVING COUNT(DISTINCT sg.genre_id) > 0
      )
      SELECT 
        *,
        CASE 
          WHEN similarity_score >= 0.8 THEN 'very_similar'
          WHEN similarity_score >= 0.6 THEN 'similar'
          WHEN similarity_score >= 0.4 THEN 'somewhat_similar'
          ELSE 'related'
        END as similarity_level
      FROM tvshow_similarities
      ORDER BY 
        similarity_score DESC,
        vote_average DESC,
        popularity DESC
      LIMIT $3
    `;

    const recommendationsResult = await pgPool.query(recommendationsQuery, [
      sourceGenreIds,
      id,
      Number(limit)
    ]);

    const response: APIResponse<any> = {
      success: true,
      data: {
        sourceTVShow: {
          id: sourceTVShow.show_id,
          title: sourceTVShow.title,
          genres: sourceTVShow.genres
        },
        recommendations: recommendationsResult.rows,
        algorithm: 'genre_based_cosine_similarity',
        totalRecommendations: recommendationsResult.rows.length
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

    let results: any = {};

    if (type === 'movies' || type === 'all') {
      const moviesQuery = `
        WITH genre_matches AS (
          SELECT 
            m.show_id,
            m.title,
            m.vote_average,
            m.popularity,
            m.release_year,
            string_agg(DISTINCT g.name, ', ') as genres,
            COUNT(DISTINCT CASE WHEN g.name = ANY($1) THEN g.id END) as matched_genres,
            COUNT(DISTINCT g.id) as total_genres
          FROM movies m
          JOIN movie_genres mg ON m.show_id = mg.movie_id
          JOIN genres g ON mg.genre_id = g.id
          WHERE m.vote_average >= $2 AND m.release_year >= $3
          GROUP BY m.show_id, m.title, m.vote_average, m.popularity, m.release_year
          HAVING COUNT(DISTINCT CASE WHEN g.name = ANY($1) THEN g.id END) > 0
        )
        SELECT 
          *,
          ROUND(matched_genres::decimal / total_genres, 3) as genre_match_ratio,
          CASE 
            WHEN matched_genres = $4 THEN 'perfect_match'
            WHEN matched_genres >= ($4 * 0.7) THEN 'good_match'
            ELSE 'partial_match'
          END as match_quality
        FROM genre_matches
        ORDER BY 
          matched_genres DESC,
          genre_match_ratio DESC,
          vote_average DESC,
          popularity DESC
        LIMIT $5
      `;

      const moviesResult = await pgPool.query(moviesQuery, [
        genres,
        Number(minRating),
        Number(minYear),
        genres.length,
        Number(limit)
      ]);

      results.movies = moviesResult.rows;
    }

    if (type === 'tvshows' || type === 'all') {
      const tvShowsQuery = `
        WITH genre_matches AS (
          SELECT 
            t.show_id,
            t.title,
            t.vote_average,
            t.popularity,
            t.release_year,
            string_agg(DISTINCT g.name, ', ') as genres,
            COUNT(DISTINCT CASE WHEN g.name = ANY($1) THEN g.id END) as matched_genres,
            COUNT(DISTINCT g.id) as total_genres
          FROM tv_shows t
          JOIN tvshow_genres tg ON t.show_id = tg.tvshow_id
          JOIN genres g ON tg.genre_id = g.id
          WHERE t.vote_average >= $2 AND t.release_year >= $3
          GROUP BY t.show_id, t.title, t.vote_average, t.popularity, t.release_year
          HAVING COUNT(DISTINCT CASE WHEN g.name = ANY($1) THEN g.id END) > 0
        )
        SELECT 
          *,
          ROUND(matched_genres::decimal / total_genres, 3) as genre_match_ratio,
          CASE 
            WHEN matched_genres = $4 THEN 'perfect_match'
            WHEN matched_genres >= ($4 * 0.7) THEN 'good_match'
            ELSE 'partial_match'
          END as match_quality
        FROM genre_matches
        ORDER BY 
          matched_genres DESC,
          genre_match_ratio DESC,
          vote_average DESC,
          popularity DESC
        LIMIT $5
      `;

      const tvShowsResult = await pgPool.query(tvShowsQuery, [
        genres,
        Number(minRating),
        Number(minYear),
        genres.length,
        Number(limit)
      ]);

      results.tvShows = tvShowsResult.rows;
    }

    const response: APIResponse<any> = {
      success: true,
      data: {
        requestedGenres: genres,
        results,
        filters: {
          type,
          minRating: Number(minRating),
          minYear: Number(minYear),
          limit: Number(limit)
        },
        algorithm: 'multi_genre_matching'
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
      watchedItems = [], // array of show_ids that user has watched
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

    // Exclude already watched items
    const excludeClause = watchedItems.length > 0 
      ? `AND show_id != ALL($${watchedItems.length + 2})` 
      : '';

    let results: any = {};

    if (preferredType === 'movies' || preferredType === 'all') {
      const moviesQuery = `
        SELECT 
          m.*,
          string_agg(DISTINCT g.name, ', ') as genres,
          COUNT(DISTINCT CASE WHEN g.name = ANY($1) THEN g.id END) as favorite_genre_matches,
          ROUND(
            (COUNT(DISTINCT CASE WHEN g.name = ANY($1) THEN g.id END)::decimal / $2) * 0.6 +
            (m.vote_average / 10.0) * 0.3 +
            (LEAST(m.popularity / 500.0, 1.0)) * 0.1,
            3
          ) as recommendation_score
        FROM movies m
        JOIN movie_genres mg ON m.show_id = mg.movie_id
        JOIN genres g ON mg.genre_id = g.id
        WHERE 1=1 ${excludeClause}
        GROUP BY m.show_id
        HAVING COUNT(DISTINCT CASE WHEN g.name = ANY($1) THEN g.id END) > 0
        ORDER BY recommendation_score DESC, m.vote_average DESC
        LIMIT $${excludeClause ? '3' : '2'}
      `;

      const params = [favoriteGenres, favoriteGenres.length];
      if (excludeClause) params.push(watchedItems);
      params.push(Number(limit));

      const moviesResult = await pgPool.query(moviesQuery, params);
      results.movies = moviesResult.rows;
    }

    // Similar logic for TV shows...
    if (preferredType === 'tvshows' || preferredType === 'all') {
      // Implementation similar to movies...
      results.tvShows = []; // Placeholder for now
    }

    const response: APIResponse<any> = {
      success: true,
      data: {
        results,
        preferences: {
          favoriteGenres,
          excludedItems: watchedItems.length,
          preferredType
        },
        algorithm: 'personalized_weighted_scoring'
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

export default router;
