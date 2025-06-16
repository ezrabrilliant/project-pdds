import { Router } from 'express';
import { pgPool } from '../config/database';
import { APIResponse } from '../types';

const router = Router();

// Get all genres with content counts
router.get('/', async (req, res) => {
  try {
    // Get all genres and their counts
    const query = `
      SELECT 
        g.id,
        g.name,
        COALESCE((SELECT COUNT(*) FROM movie_genres mg WHERE mg.genre_id = g.id), 0) as movie_count,
        COALESCE((SELECT COUNT(*) FROM tvshow_genres tg WHERE tg.genre_id = g.id), 0) as tvshow_count
      FROM genres g
      ORDER BY g.name ASC
    `;

    const result = await pgPool.query(query);

    // Calculate totals and filter out empty genres unless requested
    const { includeEmpty = false, hideTVShowOnly = false } = req.query;
    
    let genresWithTotals = result.rows.map(genre => ({
      id: genre.id,
      name: genre.name,
      movie_count: parseInt(genre.movie_count) || 0,
      tvshow_count: parseInt(genre.tvshow_count) || 0,
      total_count: (parseInt(genre.movie_count) || 0) + (parseInt(genre.tvshow_count) || 0)
    }));

    // Filter out empty genres unless explicitly requested
    if (!includeEmpty) {
      genresWithTotals = genresWithTotals.filter(genre => genre.total_count > 0);
    }

    // Filter out TV show only genres if requested
    if (hideTVShowOnly === 'true') {
      genresWithTotals = genresWithTotals.filter(genre => genre.movie_count > 0);
    }

    // Sort by total count descending, then by name
    genresWithTotals.sort((a, b) => {
      if (b.total_count !== a.total_count) {
        return b.total_count - a.total_count;
      }
      return a.name.localeCompare(b.name);
    });

    const response: APIResponse<any> = {
      success: true,
      data: {
        genres: genresWithTotals,
        total: genresWithTotals.length,
        stats: {
          totalGenres: result.rows.length,
          genresWithContent: genresWithTotals.length,
          emptyGenres: result.rows.length - genresWithTotals.length,
          genresWithMovies: genresWithTotals.filter(g => g.movie_count > 0).length,
          genresWithTVShowsOnly: genresWithTotals.filter(g => g.movie_count === 0 && g.tvshow_count > 0).length,
          filters: {
            includeEmpty: includeEmpty === 'true',
            hideTVShowOnly: hideTVShowOnly === 'true'
          }
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch genres',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get genre by ID with associated content
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get genre info
    const genreQuery = `
      SELECT 
        g.id,
        g.name,
        COUNT(DISTINCT mg.movie_id) as movie_count,
        COUNT(DISTINCT tg.tvshow_id) as tvshow_count
      FROM genres g
      LEFT JOIN movie_genres mg ON g.id = mg.genre_id
      LEFT JOIN tvshow_genres tg ON g.id = tg.genre_id
      WHERE g.id = $1
      GROUP BY g.id, g.name
    `;

    const genreResult = await pgPool.query(genreQuery, [id]);

    if (genreResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Genre not found',
        message: `Genre with ID ${id} does not exist`
      });
    }

    const genre = genreResult.rows[0];

    // Get sample movies for this genre
    const moviesQuery = `
      SELECT m.show_id, m.title, m.release_year, m.vote_average, m.popularity
      FROM movies m
      JOIN movie_genres mg ON m.show_id = mg.movie_id
      WHERE mg.genre_id = $1
      ORDER BY m.popularity DESC
      LIMIT 10
    `;

    // Get sample TV shows for this genre
    const tvShowsQuery = `
      SELECT t.show_id, t.title, t.release_year, t.vote_average, t.popularity
      FROM tv_shows t
      JOIN tvshow_genres tg ON t.show_id = tg.tvshow_id
      WHERE tg.genre_id = $1
      ORDER BY t.popularity DESC
      LIMIT 10
    `;

    const [moviesResult, tvShowsResult] = await Promise.all([
      pgPool.query(moviesQuery, [id]),
      pgPool.query(tvShowsQuery, [id])
    ]);

    const response: APIResponse<any> = {
      success: true,
      data: {
        genre,
        sampleMovies: moviesResult.rows,
        sampleTVShows: tvShowsResult.rows
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching genre:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch genre',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get genre by name
router.get('/name/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { limit = 20, type = 'all' } = req.query; // type: 'movies', 'tvshows', 'all'

    // Get genre info
    const genreQuery = `
      SELECT id, name FROM genres WHERE name ILIKE $1
    `;

    const genreResult = await pgPool.query(genreQuery, [`%${name}%`]);

    if (genreResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Genre not found',
        message: `Genre with name "${name}" does not exist`
      });
    }

    const genre = genreResult.rows[0];
    let content: any = {};

    if (type === 'movies' || type === 'all') {
      const moviesQuery = `
        SELECT 
          m.*,
          string_agg(DISTINCT g2.name, ', ' ORDER BY g2.name) as genres
        FROM movies m
        JOIN movie_genres mg ON m.show_id = mg.movie_id
        LEFT JOIN movie_genres mg2 ON m.show_id = mg2.movie_id
        LEFT JOIN genres g2 ON mg2.genre_id = g2.id
        WHERE mg.genre_id = $1
        GROUP BY m.show_id
        ORDER BY m.popularity DESC
        LIMIT $2
      `;

      const moviesResult = await pgPool.query(moviesQuery, [genre.id, Number(limit)]);
      content.movies = moviesResult.rows;
    }

    if (type === 'tvshows' || type === 'all') {
      const tvShowsQuery = `
        SELECT 
          t.*,
          string_agg(DISTINCT g2.name, ', ' ORDER BY g2.name) as genres
        FROM tv_shows t
        JOIN tvshow_genres tg ON t.show_id = tg.tvshow_id
        LEFT JOIN tvshow_genres tg2 ON t.show_id = tg2.tvshow_id
        LEFT JOIN genres g2 ON tg2.genre_id = g2.id
        WHERE tg.genre_id = $1
        GROUP BY t.show_id
        ORDER BY t.popularity DESC
        LIMIT $2
      `;

      const tvShowsResult = await pgPool.query(tvShowsQuery, [genre.id, Number(limit)]);
      content.tvShows = tvShowsResult.rows;
    }

    const response: APIResponse<any> = {
      success: true,
      data: {
        genre,
        content,
        filters: {
          type,
          limit: Number(limit)
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching genre by name:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch genre',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
