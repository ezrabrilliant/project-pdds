import { Router } from 'express';
import { pgPool } from '../config/database';
import { APIResponse } from '../types';

const router = Router();

// Universal search endpoint
router.get('/', async (req, res) => {
  try {
    const {
      q, // search query
      type = 'all', // 'movies', 'tvshows', 'all'
      limit = 20,
      page = 1
    } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
        message: 'Please provide a search query using the "q" parameter'
      });
    }

    const searchTerm = q.trim();
    const offset = (Number(page) - 1) * Number(limit);
    let results: any = {};

    if (type === 'movies' || type === 'all') {
      const moviesQuery = `
        SELECT 
          m.*,
          COALESCE(
            string_agg(DISTINCT g.name, ', ' ORDER BY g.name), 
            'Unknown'
          ) as genres,
          'movie' as content_type
        FROM movies m
        LEFT JOIN movie_genres mg ON m.show_id = mg.movie_id
        LEFT JOIN genres g ON mg.genre_id = g.id
        WHERE 
          m.title ILIKE $1 
          OR m.description ILIKE $1 
          OR m.cast_members ILIKE $1 
          OR m.director ILIKE $1
          OR EXISTS (
            SELECT 1 FROM movie_genres mg2 
            JOIN genres g2 ON mg2.genre_id = g2.id 
            WHERE mg2.movie_id = m.show_id AND g2.name ILIKE $1
          )
        GROUP BY m.show_id
        ORDER BY 
          CASE 
            WHEN m.title ILIKE $1 THEN 1
            WHEN m.title ILIKE $2 THEN 2
            ELSE 3
          END,
          m.popularity DESC
        LIMIT $3 OFFSET $4
      `;

      const moviesResult = await pgPool.query(moviesQuery, [
        `%${searchTerm}%`,
        `${searchTerm}%`,
        Number(limit),
        offset
      ]);

      results.movies = moviesResult.rows;
    }

    if (type === 'tvshows' || type === 'all') {
      const tvShowsQuery = `
        SELECT 
          t.*,
          COALESCE(
            string_agg(DISTINCT g.name, ', ' ORDER BY g.name), 
            'Unknown'
          ) as genres,
          'tvshow' as content_type
        FROM tv_shows t
        LEFT JOIN tvshow_genres tg ON t.show_id = tg.tvshow_id
        LEFT JOIN genres g ON tg.genre_id = g.id
        WHERE 
          t.title ILIKE $1 
          OR t.description ILIKE $1 
          OR t.cast_members ILIKE $1 
          OR t.director ILIKE $1
          OR EXISTS (
            SELECT 1 FROM tvshow_genres tg2 
            JOIN genres g2 ON tg2.genre_id = g2.id 
            WHERE tg2.tvshow_id = t.show_id AND g2.name ILIKE $1
          )
        GROUP BY t.show_id
        ORDER BY 
          CASE 
            WHEN t.title ILIKE $1 THEN 1
            WHEN t.title ILIKE $2 THEN 2
            ELSE 3
          END,
          t.popularity DESC
        LIMIT $3 OFFSET $4
      `;

      const tvShowsResult = await pgPool.query(tvShowsQuery, [
        `%${searchTerm}%`,
        `${searchTerm}%`,
        Number(limit),
        offset
      ]);

      results.tvShows = tvShowsResult.rows;
    }

    // If type is 'all', combine and sort results
    if (type === 'all') {
      const allResults = [
        ...(results.movies || []),
        ...(results.tvShows || [])
      ].sort((a, b) => {
        // Prioritize exact title matches
        const aExact = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
        const bExact = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
        
        if (aExact !== bExact) return bExact - aExact;
        
        // Then by popularity
        return b.popularity - a.popularity;
      });

      results = {
        combined: allResults.slice(0, Number(limit)),
        movies: results.movies,
        tvShows: results.tvShows
      };
    }

    const response: APIResponse<any> = {
      success: true,
      data: {
        query: searchTerm,
        results,
        pagination: {
          page: Number(page),
          limit: Number(limit)
        },
        filters: {
          type
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Advanced search with multiple filters
router.post('/advanced', async (req, res) => {
  try {
    const {
      query = '',      genres = [],
      years = [],
      ratings = [],
      countries = [],
      languages = [],
      type = 'all',
      sortBy = 'date_added',
      sortOrder = 'desc',
      limit = 20,
      page = 1
    } = req.body;

    const offset = (Number(page) - 1) * Number(limit);
    const validSorts = ['date_added', 'popularity', 'vote_average', 'release_year', 'title', 'rating'];
    const validOrders = ['asc', 'desc'];
    
    const sortField = validSorts.includes(sortBy) ? sortBy : 'date_added';
    const order = validOrders.includes(sortOrder) ? sortOrder : 'desc';

    let results: any = {};

    if (type === 'movies' || type === 'all') {
      let whereConditions: string[] = [];
      let queryParams: any[] = [];
      let paramIndex = 1;

      if (query && query.trim()) {
        whereConditions.push(`(m.title ILIKE $${paramIndex} OR m.description ILIKE $${paramIndex})`);
        queryParams.push(`%${query.trim()}%`);
        paramIndex++;
      }

      if (genres.length > 0) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM movie_genres mg2 
          JOIN genres g2 ON mg2.genre_id = g2.id 
          WHERE mg2.movie_id = m.show_id AND g2.name = ANY($${paramIndex})
        )`);
        queryParams.push(genres);
        paramIndex++;
      }

      if (years.length > 0) {
        whereConditions.push(`m.release_year = ANY($${paramIndex})`);
        queryParams.push(years);
        paramIndex++;
      }

      if (ratings.length > 0) {
        whereConditions.push(`m.rating = ANY($${paramIndex})`);
        queryParams.push(ratings);
        paramIndex++;
      }      if (countries.length > 0) {
        const countryConditions = countries.map(() => `m.country ILIKE $${paramIndex++}`);
        whereConditions.push(`(${countryConditions.join(' OR ')})`);
        countries.forEach((country: string) => queryParams.push(`%${country}%`));
      }

      if (languages.length > 0) {
        whereConditions.push(`m.language = ANY($${paramIndex})`);
        queryParams.push(languages);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

      const moviesQuery = `
        SELECT 
          m.*,
          COALESCE(
            string_agg(DISTINCT g.name, ', ' ORDER BY g.name), 
            'Unknown'
          ) as genres
        FROM movies m
        LEFT JOIN movie_genres mg ON m.show_id = mg.movie_id
        LEFT JOIN genres g ON mg.genre_id = g.id
        ${whereClause}
        GROUP BY m.show_id
        ORDER BY m.${sortField} ${order.toUpperCase()}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;      queryParams.push(Number(limit), offset);
      const moviesResult = await pgPool.query(moviesQuery, queryParams);
      results.movies = moviesResult.rows;
    }

    // TV Shows implementation for advanced search
    if (type === 'tvshows' || type === 'all') {
      let whereConditions: string[] = [];
      let queryParams: any[] = [];
      let paramIndex = 1;

      if (query && query.trim()) {
        whereConditions.push(`(t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`);
        queryParams.push(`%${query.trim()}%`);
        paramIndex++;
      }

      if (genres.length > 0) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM tvshow_genres tg2 
          JOIN genres g2 ON tg2.genre_id = g2.id 
          WHERE tg2.tvshow_id = t.show_id AND g2.name = ANY($${paramIndex})
        )`);
        queryParams.push(genres);
        paramIndex++;
      }

      if (years.length > 0) {
        whereConditions.push(`t.release_year = ANY($${paramIndex})`);
        queryParams.push(years);
        paramIndex++;
      }

      if (ratings.length > 0) {
        whereConditions.push(`t.rating = ANY($${paramIndex})`);
        queryParams.push(ratings);
        paramIndex++;
      }

      if (countries.length > 0) {
        const countryConditions = countries.map(() => `t.country ILIKE $${paramIndex++}`);
        whereConditions.push(`(${countryConditions.join(' OR ')})`);
        countries.forEach((country: string) => queryParams.push(`%${country}%`));
      }

      if (languages.length > 0) {
        whereConditions.push(`t.language = ANY($${paramIndex})`);
        queryParams.push(languages);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

      const tvShowsQuery = `
        SELECT 
          t.*,
          COALESCE(
            string_agg(DISTINCT g.name, ', ' ORDER BY g.name), 
            'Unknown'
          ) as genres
        FROM tv_shows t
        LEFT JOIN tvshow_genres tg ON t.show_id = tg.tvshow_id
        LEFT JOIN genres g ON tg.genre_id = g.id
        ${whereClause}
        GROUP BY t.show_id
        ORDER BY t.${sortField} ${order.toUpperCase()}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(Number(limit), offset);
      const tvShowsResult = await pgPool.query(tvShowsQuery, queryParams);
      results.tvShows = tvShowsResult.rows;
    }

    // Combined results for 'all' type
    if (type === 'all') {
      const combinedResults = [...(results.movies || []), ...(results.tvShows || [])];
      // Sort combined results by the specified field
      combinedResults.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (order === 'desc') {
          return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
      
      results.combined = combinedResults.slice(0, Number(limit));
    }

    const response: APIResponse<any> = {
      success: true,
      data: {
        results,        filters: {
          query,
          genres,
          years,
          ratings,
          countries,
          languages,
          type,
          sortBy: sortField,
          sortOrder: order
        },
        pagination: {
          page: Number(page),
          limit: Number(limit)
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error performing advanced search:', error);
    res.status(500).json({
      success: false,
      error: 'Advanced search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Search suggestions/autocomplete
router.get('/suggestions', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    const searchTerm = q.trim();

    const suggestionsQuery = `
      (
        SELECT DISTINCT title as suggestion, 'movie' as type, popularity
        FROM movies 
        WHERE title ILIKE $1 
        ORDER BY popularity DESC
        LIMIT $2
      )
      UNION ALL
      (
        SELECT DISTINCT title as suggestion, 'tvshow' as type, popularity
        FROM tv_shows 
        WHERE title ILIKE $1 
        ORDER BY popularity DESC
        LIMIT $2
      )
      ORDER BY popularity DESC
      LIMIT $2
    `;

    const result = await pgPool.query(suggestionsQuery, [
      `${searchTerm}%`,
      Math.floor(Number(limit) / 2)
    ]);

    const response: APIResponse<any> = {
      success: true,
      data: {
        query: searchTerm,
        suggestions: result.rows
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suggestions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
