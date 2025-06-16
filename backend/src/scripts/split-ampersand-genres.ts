import { pgPool } from '../config/database';

async function splitAmpersandGenres() {
  try {
    console.log('=== Splitting Ampersand Genres ===\n');

    // Start transaction
    await pgPool.query('BEGIN');

    // 1. Action & Adventure -> Action + Adventure
    console.log('1. Processing "Action & Adventure"...');
    
    const actionAdvGenreQuery = 'SELECT id FROM genres WHERE name = $1';
    const actionAdvGenre = await pgPool.query(actionAdvGenreQuery, ['Action & Adventure']);
    
    if (actionAdvGenre.rows.length > 0) {
      const actionAdvGenreId = actionAdvGenre.rows[0].id;
      
      // Get existing Action and Adventure genre IDs
      const actionGenre = await pgPool.query(actionAdvGenreQuery, ['Action']);
      const adventureGenre = await pgPool.query(actionAdvGenreQuery, ['Adventure']);
      
      const actionGenreId = actionGenre.rows[0].id;
      const adventureGenreId = adventureGenre.rows[0].id;
      
      console.log(`   Action & Adventure ID: ${actionAdvGenreId}`);
      console.log(`   Action ID: ${actionGenreId}`);
      console.log(`   Adventure ID: ${adventureGenreId}`);
      
      // Get all TV shows with Action & Adventure genre
      const tvShowsQuery = 'SELECT tvshow_id FROM tvshow_genres WHERE genre_id = $1';
      const tvShows = await pgPool.query(tvShowsQuery, [actionAdvGenreId]);
      
      console.log(`   Found ${tvShows.rows.length} TV shows to redistribute`);
        // Distribute TV shows (50% to Action, 50% to Adventure)
      const half = Math.ceil(tvShows.rows.length / 2);
      
      for (let i = 0; i < tvShows.rows.length; i++) {
        const tvShowId = (tvShows.rows[i] as any).tvshow_id;
        const targetGenreId = i < half ? actionGenreId : adventureGenreId;
        const targetGenreName = i < half ? 'Action' : 'Adventure';
        
        // Check if relationship already exists
        const existingQuery = 'SELECT 1 FROM tvshow_genres WHERE tvshow_id = $1 AND genre_id = $2';
        const existing = await pgPool.query(existingQuery, [tvShowId, targetGenreId]);
        
        if (existing.rows.length === 0) {
          await pgPool.query(
            'INSERT INTO tvshow_genres (tvshow_id, genre_id) VALUES ($1, $2)',
            [tvShowId, targetGenreId]
          );
          console.log(`   Added TV show ${tvShowId} to ${targetGenreName}`);
        }
      }
      
      // Remove old relationships
      await pgPool.query('DELETE FROM tvshow_genres WHERE genre_id = $1', [actionAdvGenreId]);
      console.log(`   Removed ${tvShows.rows.length} old relationships`);
    }

    // 2. Sci-Fi & Fantasy -> Sci-Fi + Fantasy
    console.log('\n2. Processing "Sci-Fi & Fantasy"...');
    
    const sciFiFantasyGenre = await pgPool.query(actionAdvGenreQuery, ['Sci-Fi & Fantasy']);
    
    if (sciFiFantasyGenre.rows.length > 0) {
      const sciFiFantasyGenreId = sciFiFantasyGenre.rows[0].id;
      
      // Check if Sci-Fi genre exists, if not create it
      let sciFiGenre = await pgPool.query(actionAdvGenreQuery, ['Sci-Fi']);
      let sciFiGenreId;
      
      if (sciFiGenre.rows.length === 0) {
        // Create Sci-Fi genre
        const createSciFiQuery = 'INSERT INTO genres (name) VALUES ($1) RETURNING id';
        const newSciFi = await pgPool.query(createSciFiQuery, ['Sci-Fi']);
        sciFiGenreId = newSciFi.rows[0].id;
        console.log(`   Created new "Sci-Fi" genre with ID: ${sciFiGenreId}`);
      } else {
        sciFiGenreId = sciFiGenre.rows[0].id;
        console.log(`   Using existing "Sci-Fi" genre with ID: ${sciFiGenreId}`);
      }
      
      // Get Fantasy genre ID
      const fantasyGenre = await pgPool.query(actionAdvGenreQuery, ['Fantasy']);
      const fantasyGenreId = fantasyGenre.rows[0].id;
      
      console.log(`   Fantasy ID: ${fantasyGenreId}`);
        // Get all TV shows with Sci-Fi & Fantasy genre
      const tvShowsQuery = 'SELECT tvshow_id FROM tvshow_genres WHERE genre_id = $1';
      const tvShows = await pgPool.query(tvShowsQuery, [sciFiFantasyGenreId]);
      console.log(`   Found ${tvShows.rows.length} TV shows to redistribute`);
      
      // Distribute TV shows (50% to Sci-Fi, 50% to Fantasy)
      const half = Math.ceil(tvShows.rows.length / 2);
      
      for (let i = 0; i < tvShows.rows.length; i++) {
        const tvShowId = (tvShows.rows[i] as any).tvshow_id;
        const targetGenreId = i < half ? sciFiGenreId : fantasyGenreId;
        const targetGenreName = i < half ? 'Sci-Fi' : 'Fantasy';
        
        // Check if relationship already exists
        const existingQuery = 'SELECT 1 FROM tvshow_genres WHERE tvshow_id = $1 AND genre_id = $2';
        const existing = await pgPool.query(existingQuery, [tvShowId, targetGenreId]);
        
        if (existing.rows.length === 0) {
          await pgPool.query(
            'INSERT INTO tvshow_genres (tvshow_id, genre_id) VALUES ($1, $2)',
            [tvShowId, targetGenreId]
          );
          console.log(`   Added TV show ${tvShowId} to ${targetGenreName}`);
        }
      }
      
      // Remove old relationships
      await pgPool.query('DELETE FROM tvshow_genres WHERE genre_id = $1', [sciFiFantasyGenreId]);
      console.log(`   Removed ${tvShows.rows.length} old relationships`);
    }

    // 3. War & Politics -> War + Politics
    console.log('\n3. Processing "War & Politics"...');
    
    const warPoliticsGenre = await pgPool.query(actionAdvGenreQuery, ['War & Politics']);
    
    if (warPoliticsGenre.rows.length > 0) {
      const warPoliticsGenreId = warPoliticsGenre.rows[0].id;
      
      // Get War genre ID
      const warGenre = await pgPool.query(actionAdvGenreQuery, ['War']);
      const warGenreId = warGenre.rows[0].id;
      
      // Check if Politics genre exists, if not create it
      let politicsGenre = await pgPool.query(actionAdvGenreQuery, ['Politics']);
      let politicsGenreId;
      
      if (politicsGenre.rows.length === 0) {
        // Create Politics genre
        const createPoliticsQuery = 'INSERT INTO genres (name) VALUES ($1) RETURNING id';
        const newPolitics = await pgPool.query(createPoliticsQuery, ['Politics']);
        politicsGenreId = newPolitics.rows[0].id;
        console.log(`   Created new "Politics" genre with ID: ${politicsGenreId}`);
      } else {
        politicsGenreId = politicsGenre.rows[0].id;
        console.log(`   Using existing "Politics" genre with ID: ${politicsGenreId}`);
      }
      
      console.log(`   War ID: ${warGenreId}`);
        // Get all TV shows with War & Politics genre
      const tvShowsQuery2 = 'SELECT tvshow_id FROM tvshow_genres WHERE genre_id = $1';
      const tvShows = await pgPool.query(tvShowsQuery2, [warPoliticsGenreId]);
      console.log(`   Found ${tvShows.rows.length} TV shows to redistribute`);
      
      // Distribute TV shows (50% to War, 50% to Politics)
      const half = Math.ceil(tvShows.rows.length / 2);
      
      for (let i = 0; i < tvShows.rows.length; i++) {
        const tvShowId = (tvShows.rows[i] as any).tvshow_id;
        const targetGenreId = i < half ? warGenreId : politicsGenreId;
        const targetGenreName = i < half ? 'War' : 'Politics';
        
        // Check if relationship already exists
        const existingQuery = 'SELECT 1 FROM tvshow_genres WHERE tvshow_id = $1 AND genre_id = $2';
        const existing = await pgPool.query(existingQuery, [tvShowId, targetGenreId]);
        
        if (existing.rows.length === 0) {
          await pgPool.query(
            'INSERT INTO tvshow_genres (tvshow_id, genre_id) VALUES ($1, $2)',
            [tvShowId, targetGenreId]
          );
          console.log(`   Added TV show ${tvShowId} to ${targetGenreName}`);
        }
      }
      
      // Remove old relationships
      await pgPool.query('DELETE FROM tvshow_genres WHERE genre_id = $1', [warPoliticsGenreId]);
      console.log(`   Removed ${tvShows.rows.length} old relationships`);
    }

    // 4. Remove the old ampersand genres
    console.log('\n4. Removing old ampersand genres...');
    
    const oldGenres = ['Action & Adventure', 'Sci-Fi & Fantasy', 'War & Politics'];
      for (const genreName of oldGenres) {
      const deleteResult = await pgPool.query('DELETE FROM genres WHERE name = $1', [genreName]);
      if (deleteResult.rowCount && deleteResult.rowCount > 0) {
        console.log(`   Removed "${genreName}" genre`);
      }
    }

    // 5. Show final results
    console.log('\n=== Final Results ===');
    
    const finalQuery = `
      SELECT 
        g.name,
        COALESCE(movie_count, 0) as movie_count,
        COALESCE(tvshow_count, 0) as tvshow_count
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
      WHERE g.name IN ('Action', 'Adventure', 'Sci-Fi', 'Fantasy', 'War', 'Politics')
      ORDER BY g.name
    `;
    
    const finalResult = await pgPool.query(finalQuery);
    
    finalResult.rows.forEach(genre => {
      console.log(`${genre.name}: ${genre.movie_count} movies, ${genre.tvshow_count} TV shows`);
    });

    // Commit transaction
    await pgPool.query('COMMIT');
    console.log('\n✅ Successfully split ampersand genres!');

  } catch (error) {
    // Rollback on error
    await pgPool.query('ROLLBACK');
    console.error('❌ Error splitting genres:', error);
  } finally {
    await pgPool.end();
  }
}

// Run if called directly
if (require.main === module) {
  splitAmpersandGenres();
}
