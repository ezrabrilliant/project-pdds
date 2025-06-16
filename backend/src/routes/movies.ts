import { Router } from 'express';
import { pgPool } from '../config/database';
import { APIResponse, Movie } from '../types';

const router = Router();

// Get all movies with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const genre = req.query.genre as string;
    const country = req.query.country as string;
    const search = req.query.search as string;
    
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT * FROM movies 
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (genre) {
      query += ` AND genres ILIKE $${paramIndex}`;
      params.push(`%${genre}%`);
      paramIndex++;
    }

    if (country) {
      query += ` AND country ILIKE $${paramIndex}`;
      params.push(`%${country}%`);
      paramIndex++;
    }

    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await pgPool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY popularity DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pgPool.query(query, params);
    
    const response: APIResponse<Movie[]> = {
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch movies'
    });
  }
});

// Get movie by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pgPool.query(
      'SELECT * FROM movies WHERE show_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
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
      error: 'Failed to fetch movie'
    });
  }
});

export default router;
