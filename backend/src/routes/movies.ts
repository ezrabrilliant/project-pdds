import { Router } from 'express';
import { pgPool } from '../config/database';
import { APIResponse, Movie } from '../types';

const router = Router();

// Get all movies with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      genre,
      year,
      rating,
      country,
      search,
      sort = 'date_added',
      order = 'desc'
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const validSorts = ['date_added', 'popularity', 'vote_average', 'release_year', 'title', 'rating'];
    const validOrders = ['asc', 'desc'];
    
    const sortField = validSorts.includes(sort as string) ? sort : 'date_added';
    const sortOrder = validOrders.includes(order as string) ? order : 'desc';

    // Build WHERE conditions
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(m.title ILIKE $${paramIndex} OR m.description ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (year) {
      whereConditions.push(`m.release_year = $${paramIndex}`);
      queryParams.push(Number(year));
      paramIndex++;
    }

    if (rating) {
      whereConditions.push(`m.rating = $${paramIndex}`);
      queryParams.push(rating);
      paramIndex++;
    }

    if (country) {
      whereConditions.push(`m.country ILIKE $${paramIndex}`);
      queryParams.push(`%${country}%`);
      paramIndex++;
    }

    if (genre) {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM movie_genres mg 
        JOIN genres g ON mg.genre_id = g.id 
        WHERE mg.movie_id = m.show_id AND g.name ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${genre}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Main query with genres
    const query = `
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
      ORDER BY m.${sortField} ${String(sortOrder).toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(Number(limit), offset);

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT m.show_id) as total
      FROM movies m
      LEFT JOIN movie_genres mg ON m.show_id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      ${whereClause}
    `;

    const [moviesResult, countResult] = await Promise.all([
      pgPool.query(query, queryParams),
      pgPool.query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
    ]);

    const totalMovies = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalMovies / Number(limit));

    const response: APIResponse<any> = {
      success: true,
      data: {
        movies: moviesResult.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalMovies,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        },
        filters: {
          genre: genre || null,
          year: year || null,
          rating: rating || null,
          country: country || null,
          search: search || null
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch movies',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get movie by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        m.*,
        COALESCE(
          string_agg(DISTINCT g.name, ', ' ORDER BY g.name), 
          'Unknown'
        ) as genres,
        ARRAY_AGG(DISTINCT g.name) as genre_list
      FROM movies m
      LEFT JOIN movie_genres mg ON m.show_id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      WHERE m.show_id = $1
      GROUP BY m.show_id
    `;

    const result = await pgPool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found',
        message: `Movie with ID ${id} does not exist`
      });
    }

    const response: APIResponse<Movie> = {
      success: true,
      data: result.rows[0]
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch movie',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/movies/top/rated - Get top rated movies
router.get('/top/rated', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const query = `
      SELECT 
        m.*,
        COALESCE(
          string_agg(DISTINCT g.name, ', ' ORDER BY g.name), 
          'Unknown'
        ) as genres
      FROM movies m
      LEFT JOIN movie_genres mg ON m.show_id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      WHERE m.vote_count > 100
      GROUP BY m.show_id
      ORDER BY m.vote_average DESC, m.vote_count DESC
      LIMIT $1
    `;

    const result = await pgPool.query(query, [Number(limit)]);

    const response: APIResponse<any> = {
      success: true,
      data: {
        movies: result.rows,
        type: 'top_rated',
        criteria: 'Sorted by vote_average (minimum 100 votes)'
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top rated movies',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/movies/top/popular - Get most popular movies
router.get('/top/popular', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const query = `
      SELECT 
        m.*,
        COALESCE(
          string_agg(DISTINCT g.name, ', ' ORDER BY g.name), 
          'Unknown'
        ) as genres
      FROM movies m
      LEFT JOIN movie_genres mg ON m.show_id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      GROUP BY m.show_id
      ORDER BY m.popularity DESC
      LIMIT $1
    `;

    const result = await pgPool.query(query, [Number(limit)]);

    const response: APIResponse<any> = {
      success: true,
      data: {
        movies: result.rows,
        type: 'most_popular',
        criteria: 'Sorted by popularity score'
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching popular movies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popular movies',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
