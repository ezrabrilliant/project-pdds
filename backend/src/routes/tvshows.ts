import { Router } from 'express';
import { pgPool } from '../config/database';
import { APIResponse, TVShow } from '../types';

const router = Router();

// Get all TV shows with pagination and filtering
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
      whereConditions.push(`(t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (year) {
      whereConditions.push(`t.release_year = $${paramIndex}`);
      queryParams.push(Number(year));
      paramIndex++;
    }

    if (rating) {
      whereConditions.push(`t.rating = $${paramIndex}`);
      queryParams.push(rating);
      paramIndex++;
    }

    if (country) {
      whereConditions.push(`t.country ILIKE $${paramIndex}`);
      queryParams.push(`%${country}%`);
      paramIndex++;
    }

    if (genre) {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM tvshow_genres tg 
        JOIN genres g ON tg.genre_id = g.id 
        WHERE tg.tvshow_id = t.show_id AND g.name ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${genre}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Main query with genres
    const query = `
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
      ORDER BY t.${sortField} ${String(sortOrder).toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(Number(limit), offset);

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT t.show_id) as total
      FROM tv_shows t
      LEFT JOIN tvshow_genres tg ON t.show_id = tg.tvshow_id
      LEFT JOIN genres g ON tg.genre_id = g.id
      ${whereClause}
    `;

    const [tvShowsResult, countResult] = await Promise.all([
      pgPool.query(query, queryParams),
      pgPool.query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
    ]);

    const totalTVShows = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalTVShows / Number(limit));

    const response: APIResponse<any> = {
      success: true,
      data: {
        tvShows: tvShowsResult.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalTVShows,
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
    console.error('Error fetching TV shows:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch TV shows',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get TV show by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        t.*,
        COALESCE(
          string_agg(DISTINCT g.name, ', ' ORDER BY g.name), 
          'Unknown'
        ) as genres,
        ARRAY_AGG(DISTINCT g.name) as genre_list
      FROM tv_shows t
      LEFT JOIN tvshow_genres tg ON t.show_id = tg.tvshow_id
      LEFT JOIN genres g ON tg.genre_id = g.id
      WHERE t.show_id = $1
      GROUP BY t.show_id
    `;

    const result = await pgPool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'TV show not found',
        message: `TV show with ID ${id} does not exist`
      });
    }

    const response: APIResponse<TVShow> = {
      success: true,
      data: result.rows[0]
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching TV show:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch TV show',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/tvshows/top/rated - Get top rated TV shows
router.get('/top/rated', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const query = `
      SELECT 
        t.*,
        COALESCE(
          string_agg(DISTINCT g.name, ', ' ORDER BY g.name), 
          'Unknown'
        ) as genres
      FROM tv_shows t
      LEFT JOIN tvshow_genres tg ON t.show_id = tg.tvshow_id
      LEFT JOIN genres g ON tg.genre_id = g.id
      WHERE t.vote_count > 50
      GROUP BY t.show_id
      ORDER BY t.vote_average DESC, t.vote_count DESC
      LIMIT $1
    `;

    const result = await pgPool.query(query, [Number(limit)]);

    const response: APIResponse<any> = {
      success: true,
      data: {
        tvShows: result.rows,
        type: 'top_rated',
        criteria: 'Sorted by vote_average (minimum 50 votes)'
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching top rated TV shows:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top rated TV shows',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/tvshows/top/popular - Get most popular TV shows
router.get('/top/popular', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const query = `
      SELECT 
        t.*,
        COALESCE(
          string_agg(DISTINCT g.name, ', ' ORDER BY g.name), 
          'Unknown'
        ) as genres
      FROM tv_shows t
      LEFT JOIN tvshow_genres tg ON t.show_id = tg.tvshow_id
      LEFT JOIN genres g ON tg.genre_id = g.id
      GROUP BY t.show_id
      ORDER BY t.popularity DESC
      LIMIT $1
    `;

    const result = await pgPool.query(query, [Number(limit)]);

    const response: APIResponse<any> = {
      success: true,
      data: {
        tvShows: result.rows,
        type: 'most_popular',
        criteria: 'Sorted by popularity score'
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching popular TV shows:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popular TV shows',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
