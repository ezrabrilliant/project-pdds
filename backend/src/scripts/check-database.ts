import { pgPool } from '../config/database';

async function checkDatabase() {
  try {
    console.log('🔍 Checking database status...\n');

    // Basic counts
    const [moviesResult, tvShowsResult, genresResult] = await Promise.all([
      pgPool.query('SELECT COUNT(*) FROM movies'),
      pgPool.query('SELECT COUNT(*) FROM tv_shows'),
      pgPool.query('SELECT COUNT(*) FROM genres')
    ]);

    console.log('📊 Table Counts:');
    console.log(`   🎬 Movies: ${moviesResult.rows[0].count}`);
    console.log(`   📺 TV Shows: ${tvShowsResult.rows[0].count}`);
    console.log(`   🎭 Genres: ${genresResult.rows[0].count}\n`);

    // Genre relationship counts
    const [movieGenreResult, tvGenreResult] = await Promise.all([
      pgPool.query('SELECT COUNT(*) FROM movie_genres'),
      pgPool.query('SELECT COUNT(*) FROM tvshow_genres')
    ]);

    console.log('🔗 Genre Relationships:');
    console.log(`   🎬 Movie-Genre: ${movieGenreResult.rows[0].count}`);
    console.log(`   📺 TV Show-Genre: ${tvGenreResult.rows[0].count}\n`);

    // Sample data verification
    console.log('🎯 Sample Data Verification:');
    
    // Check movie with genres
    const movieSample = await pgPool.query(`
      SELECT m.title, string_agg(g.name, ', ') as genres
      FROM movies m
      JOIN movie_genres mg ON m.show_id = mg.movie_id
      JOIN genres g ON mg.genre_id = g.id
      WHERE m.title ILIKE '%inception%'
      GROUP BY m.show_id, m.title
      LIMIT 1
    `);
    
    if (movieSample.rows.length > 0) {
      console.log(`   🎬 "${movieSample.rows[0].title}" genres: ${movieSample.rows[0].genres}`);
    }

    // Check TV show with genres
    const tvSample = await pgPool.query(`
      SELECT t.title, string_agg(g.name, ', ') as genres
      FROM tv_shows t
      JOIN tvshow_genres tg ON t.show_id = tg.tvshow_id
      JOIN genres g ON tg.genre_id = g.id
      WHERE t.title ILIKE '%running man%'
      GROUP BY t.show_id, t.title
      LIMIT 1
    `);
    
    if (tvSample.rows.length > 0) {
      console.log(`   📺 "${tvSample.rows[0].title}" genres: ${tvSample.rows[0].genres}`);
    }

    // Top genres by popularity
    console.log('\n🔥 Top 5 Genres by Content Count:');
    const topGenres = await pgPool.query(`
      SELECT g.name, 
             COUNT(DISTINCT mg.movie_id) as movie_count,
             COUNT(DISTINCT tg.tvshow_id) as tv_count,
             COUNT(DISTINCT mg.movie_id) + COUNT(DISTINCT tg.tvshow_id) as total_count
      FROM genres g
      LEFT JOIN movie_genres mg ON g.id = mg.genre_id
      LEFT JOIN tvshow_genres tg ON g.id = tg.genre_id
      GROUP BY g.id, g.name
      ORDER BY total_count DESC
      LIMIT 5
    `);

    topGenres.rows.forEach((genre, index) => {
      console.log(`   ${index + 1}. ${genre.name}: ${genre.total_count} (${genre.movie_count} movies, ${genre.tv_count} TV shows)`);
    });

    console.log('\n✅ Database check completed successfully!');

  } catch (error) {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  checkDatabase()
    .then(() => {
      console.log('🎉 All checks passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}
