import { pgPool } from '../config/database';

async function mergeSciFiGenres() {
  try {
    console.log('=== Merging Sci-Fi with Science Fiction ===\n');

    // Start transaction
    await pgPool.query('BEGIN');

    // 1. Get genre IDs
    const sciFiQuery = 'SELECT id FROM genres WHERE name = $1';
    const sciFiResult = await pgPool.query(sciFiQuery, ['Sci-Fi']);
    const scienceFictionResult = await pgPool.query(sciFiQuery, ['Science Fiction']);

    if (sciFiResult.rows.length === 0) {
      console.log('Sci-Fi genre not found');
      await pgPool.query('ROLLBACK');
      return;
    }

    if (scienceFictionResult.rows.length === 0) {
      console.log('Science Fiction genre not found');
      await pgPool.query('ROLLBACK');
      return;
    }

    const sciFiId = sciFiResult.rows[0].id;
    const scienceFictionId = scienceFictionResult.rows[0].id;

    console.log(`Sci-Fi ID: ${sciFiId}`);
    console.log(`Science Fiction ID: ${scienceFictionId}`);

    // 2. Get current counts
    const currentCountsQuery = `
      SELECT 
        'Sci-Fi' as genre,
        COALESCE((SELECT COUNT(*) FROM movie_genres WHERE genre_id = $1), 0) as movies,
        COALESCE((SELECT COUNT(*) FROM tvshow_genres WHERE genre_id = $1), 0) as tvshows
      UNION ALL
      SELECT 
        'Science Fiction' as genre,
        COALESCE((SELECT COUNT(*) FROM movie_genres WHERE genre_id = $2), 0) as movies,
        COALESCE((SELECT COUNT(*) FROM tvshow_genres WHERE genre_id = $2), 0) as tvshows
    `;

    const currentCounts = await pgPool.query(currentCountsQuery, [sciFiId, scienceFictionId]);
    
    console.log('\nCurrent counts:');
    currentCounts.rows.forEach(row => {
      console.log(`${row.genre}: ${row.movies} movies, ${row.tvshows} TV shows`);
    });

    // 3. Move all Sci-Fi TV shows to Science Fiction
    const moveQuery = `
      UPDATE tvshow_genres 
      SET genre_id = $1 
      WHERE genre_id = $2
      AND NOT EXISTS (
        SELECT 1 FROM tvshow_genres tg2 
        WHERE tg2.tvshow_id = tvshow_genres.tvshow_id 
        AND tg2.genre_id = $1
      )
    `;

    const moveResult = await pgPool.query(moveQuery, [scienceFictionId, sciFiId]);
    console.log(`\nMoved ${moveResult.rowCount} TV shows from Sci-Fi to Science Fiction`);

    // 4. Delete any remaining Sci-Fi relationships (duplicates)
    const deleteQuery = 'DELETE FROM tvshow_genres WHERE genre_id = $1';
    const deleteResult = await pgPool.query(deleteQuery, [sciFiId]);
    console.log(`Deleted ${deleteResult.rowCount} remaining Sci-Fi TV show relationships`);

    // 5. Remove Sci-Fi genre
    const removeGenreQuery = 'DELETE FROM genres WHERE id = $1';
    const removeResult = await pgPool.query(removeGenreQuery, [sciFiId]);
    
    if (removeResult.rowCount && removeResult.rowCount > 0) {
      console.log('Removed Sci-Fi genre');
    }

    // 6. Show final results
    console.log('\n=== Final Results ===');
    
    const finalQuery = `
      SELECT 
        g.name,
        COALESCE(movie_count, 0) as movie_count,
        COALESCE(tvshow_count, 0) as tvshow_count,
        COALESCE(movie_count, 0) + COALESCE(tvshow_count, 0) as total_count
      FROM genres g
      LEFT JOIN (
        SELECT genre_id, COUNT(*) as movie_count
        FROM movie_genres
        GROUP BY genre_id
      ) m ON g.id = m.genre_id
      LEFT JOIN (
        SELECT genre_id, COUNT(*) as tvshow_count
        FROM tvshow_genres
        GROUP BY genre_id
      ) t ON g.id = t.genre_id
      WHERE g.name = 'Science Fiction'
    `;
    
    const finalResult = await pgPool.query(finalQuery);
    
    if (finalResult.rows.length > 0) {
      const genre = finalResult.rows[0];
      console.log(`${genre.name}: ${genre.movie_count} movies, ${genre.tvshow_count} TV shows (Total: ${genre.total_count})`);
    }

    // Commit transaction
    await pgPool.query('COMMIT');
    console.log('\n✅ Successfully merged Sci-Fi with Science Fiction!');

  } catch (error) {
    // Rollback on error
    await pgPool.query('ROLLBACK');
    console.error('❌ Error merging genres:', error);
  } finally {
    await pgPool.end();
  }
}

// Run if called directly
if (require.main === module) {
  mergeSciFiGenres();
}
