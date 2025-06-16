import { pgPool } from '../config/database';

async function checkTvShowGenres() {
  try {
    // Check total count of tvshow_genres
    const countResult = await pgPool.query('SELECT COUNT(*) as count FROM tvshow_genres');
    console.log('Total tvshow_genres records:', countResult.rows[0].count);
    
    // Check some sample data
    const sampleResult = await pgPool.query(`
      SELECT 
        tg.tvshow_id, 
        t.title, 
        g.name as genre_name 
      FROM tvshow_genres tg
      JOIN tv_shows t ON tg.tvshow_id = t.show_id
      JOIN genres g ON tg.genre_id = g.id
      LIMIT 10
    `);
    
    console.log('Sample tvshow_genres data:');
    sampleResult.rows.forEach(row => {
      console.log(`${row.title} -> ${row.genre_name}`);
    });
    
    // Check genres with their counts
    const genreCountResult = await pgPool.query(`
      SELECT 
        g.name,
        (SELECT COUNT(*) FROM movie_genres mg WHERE mg.genre_id = g.id) as movie_count,
        (SELECT COUNT(*) FROM tvshow_genres tg WHERE tg.genre_id = g.id) as tvshow_count
      FROM genres g
      WHERE (SELECT COUNT(*) FROM tvshow_genres tg WHERE tg.genre_id = g.id) > 0
      ORDER BY tvshow_count DESC
      LIMIT 10
    `);
    
    console.log('\nGenres with TV shows:');
    genreCountResult.rows.forEach(row => {
      console.log(`${row.name}: ${row.movie_count} movies, ${row.tvshow_count} TV shows`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pgPool.end();
  }
}

checkTvShowGenres();
