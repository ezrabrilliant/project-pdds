import { pgPool } from '../config/database';

async function debugGenres() {
  try {
    console.log('=== Debugging Genres API ===\n');

    // 1. Check total genres
    const genresQuery = 'SELECT COUNT(*) as total FROM genres';
    const genresResult = await pgPool.query(genresQuery);
    console.log('1. Total genres:', genresResult.rows[0].total);

    // 2. Check movies and tv_shows tables
    const moviesCountQuery = 'SELECT COUNT(*) as total FROM movies';
    const tvShowsCountQuery = 'SELECT COUNT(*) as total FROM tv_shows';
    
    const [moviesCount, tvShowsCount] = await Promise.all([
      pgPool.query(moviesCountQuery),
      pgPool.query(tvShowsCountQuery)
    ]);

    console.log('2. Total movies:', moviesCount.rows[0].total);
    console.log('3. Total TV shows:', tvShowsCount.rows[0].total);

    // 3. Check junction tables
    const movieGenresCountQuery = 'SELECT COUNT(*) as total FROM movie_genres';
    const tvShowGenresCountQuery = 'SELECT COUNT(*) as total FROM tvshow_genres';
    
    const [movieGenresCount, tvShowGenresCount] = await Promise.all([
      pgPool.query(movieGenresCountQuery),
      pgPool.query(tvShowGenresCountQuery)
    ]);

    console.log('4. Total movie_genres relationships:', movieGenresCount.rows[0].total);
    console.log('5. Total tvshow_genres relationships:', tvShowGenresCount.rows[0].total);

    // 4. Sample data from tvshow_genres
    console.log('\n=== Sample data from tvshow_genres ===');
    const sampleTvShowGenresQuery = `
      SELECT tg.*, g.name as genre_name, t.title as tvshow_title
      FROM tvshow_genres tg
      LEFT JOIN genres g ON tg.genre_id = g.id
      LEFT JOIN tv_shows t ON tg.tvshow_id = t.show_id
      LIMIT 5
    `;
    
    const sampleTvShowGenres = await pgPool.query(sampleTvShowGenresQuery);
    console.log('Sample tvshow_genres data:');
    sampleTvShowGenres.rows.forEach((row, index) => {
      console.log(`${index + 1}. Genre ID: ${row.genre_id}, TV Show ID: ${row.tvshow_id}`);
      console.log(`   Genre Name: ${row.genre_name}, TV Show Title: ${row.tvshow_title}`);
    });

    // 5. Test the problematic query from genres API
    console.log('\n=== Testing API Query ===');
    const apiQuery = `
      SELECT 
        g.id,
        g.name,
        (SELECT COUNT(*) FROM movie_genres mg WHERE mg.genre_id = g.id) as movie_count,
        (SELECT COUNT(*) FROM tvshow_genres tg WHERE tg.genre_id = g.id) as tvshow_count
      FROM genres g
      ORDER BY g.name ASC
      LIMIT 5
    `;
    
    const apiResult = await pgPool.query(apiQuery);
    console.log('API Query Results (first 5 genres):');
    apiResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name} (ID: ${row.id})`);
      console.log(`   Movie Count: ${row.movie_count}, TV Show Count: ${row.tvshow_count}`);
    });

    // 6. Check specific genre with known TV shows
    console.log('\n=== Checking specific genre (Action) ===');
    const actionGenreQuery = `
      SELECT id FROM genres WHERE name = 'Action'
    `;
    const actionGenreResult = await pgPool.query(actionGenreQuery);
    
    if (actionGenreResult.rows.length > 0) {
      const actionGenreId = actionGenreResult.rows[0].id;
      console.log('Action genre ID:', actionGenreId);

      // Count TV shows for Action genre
      const actionTvShowsQuery = `
        SELECT COUNT(*) as count FROM tvshow_genres WHERE genre_id = $1
      `;
      const actionTvShowsResult = await pgPool.query(actionTvShowsQuery, [actionGenreId]);
      console.log('TV shows with Action genre:', actionTvShowsResult.rows[0].count);

      // Sample TV shows for Action genre
      const sampleActionTvShowsQuery = `
        SELECT t.title, t.show_id
        FROM tv_shows t
        JOIN tvshow_genres tg ON t.show_id = tg.tvshow_id
        WHERE tg.genre_id = $1
        LIMIT 3
      `;
      const sampleActionTvShows = await pgPool.query(sampleActionTvShowsQuery, [actionGenreId]);
      console.log('Sample Action TV shows:');
      sampleActionTvShows.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.title} (ID: ${row.show_id})`);
      });
    }

    // 7. Check data types and structure
    console.log('\n=== Checking data types ===');
    const columnsQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('tvshow_genres', 'genres', 'tv_shows')
      ORDER BY table_name, column_name
    `;
    const columnsResult = await pgPool.query(columnsQuery);
    console.log('Table columns and types:');
    columnsResult.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type}`);
    });

  } catch (error) {
    console.error('Error debugging genres:', error);
  } finally {
    await pgPool.end();
  }
}

// Run if called directly
if (require.main === module) {
  debugGenres();
}
