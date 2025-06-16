import { pgPool } from '../config/database';

async function analyzeAndSplitAmpersandGenres() {
  try {
    console.log('=== Analyzing Genres with Ampersand (&) ===\n');

    // 1. Find all genres with "&" in their names
    const ampersandGenresQuery = `
      SELECT id, name FROM genres WHERE name LIKE '%&%' ORDER BY name
    `;
    
    const ampersandGenres = await pgPool.query(ampersandGenresQuery);
    
    console.log('Genres containing "&":');
    ampersandGenres.rows.forEach(genre => {
      console.log(`- ${genre.name} (ID: ${genre.id})`);
    });

    // 2. For each ampersand genre, show current usage
    console.log('\n=== Current Usage of Ampersand Genres ===');
    
    for (const genre of ampersandGenres.rows) {
      const usageQuery = `
        SELECT 
          'Movies' as type,
          COUNT(*) as count
        FROM movie_genres mg 
        WHERE mg.genre_id = $1
        
        UNION ALL
        
        SELECT 
          'TV Shows' as type,
          COUNT(*) as count
        FROM tvshow_genres tg 
        WHERE tg.genre_id = $1
      `;
      
      const usage = await pgPool.query(usageQuery, [genre.id]);
      
      console.log(`\n${genre.name} (ID: ${genre.id}):`);
      usage.rows.forEach(row => {
        console.log(`  ${row.type}: ${row.count}`);
      });
        // Show what it would split into
      const parts = genre.name.split(' & ').map((part: string) => part.trim());
      console.log(`  Would split into: ${parts.join(' + ')}`);
    }

    // 3. Check if the individual parts already exist as separate genres
    console.log('\n=== Checking if Split Parts Already Exist ===');
    
    for (const genre of ampersandGenres.rows) {
      const parts = genre.name.split(' & ').map((part: string) => part.trim());
      console.log(`\n${genre.name} splits into:`);
      
      for (const part of parts) {
        const existingQuery = `
          SELECT id, name FROM genres WHERE name ILIKE $1
        `;
        const existing = await pgPool.query(existingQuery, [part]);
        
        if (existing.rows.length > 0) {
          console.log(`  ✓ "${part}" already exists as genre ID ${existing.rows[0].id}`);
          
          // Show usage of existing genre
          const existingUsageQuery = `
            SELECT 
              COALESCE((SELECT COUNT(*) FROM movie_genres WHERE genre_id = $1), 0) as movies,
              COALESCE((SELECT COUNT(*) FROM tvshow_genres WHERE genre_id = $1), 0) as tvshows
          `;
          const existingUsage = await pgPool.query(existingUsageQuery, [existing.rows[0].id]);
          console.log(`    Usage: ${existingUsage.rows[0].movies} movies, ${existingUsage.rows[0].tvshows} TV shows`);
        } else {
          console.log(`  ✗ "${part}" does not exist as separate genre`);
        }
      }
    }

    // 4. Proposed solution strategy
    console.log('\n=== Proposed Solution Strategy ===');    
    for (const genre of ampersandGenres.rows) {
      const parts = genre.name.split(' & ').map((part: string) => part.trim());
      console.log(`\n${genre.name}:`);
      
      // Get current TV show relationships
      const currentTVShowsQuery = `
        SELECT tvshow_id FROM tvshow_genres WHERE genre_id = $1
      `;
      const currentTVShows = await pgPool.query(currentTVShowsQuery, [genre.id]);
      
      console.log(`  Current TV shows: ${currentTVShows.rows.length}`);
      console.log(`  Strategy:`);
      
      for (const part of parts) {
        const existingQuery = `SELECT id FROM genres WHERE name ILIKE $1`;
        const existing = await pgPool.query(existingQuery, [part]);
        
        if (existing.rows.length > 0) {
          console.log(`    - Merge with existing "${part}" genre (ID: ${existing.rows[0].id})`);
        } else {
          console.log(`    - Create new "${part}" genre`);
        }
      }
      
      console.log(`    - Distribute ${currentTVShows.rows.length} TV shows between both genres`);
      console.log(`    - Remove original "${genre.name}" genre`);
    }

    // 5. Show what the final genre list would look like
    console.log('\n=== Impact Analysis ===');
    
    const currentGenreCountQuery = `SELECT COUNT(*) as count FROM genres`;
    const currentGenreCount = await pgPool.query(currentGenreCountQuery);
    
    const genresWithAmpersand = ampersandGenres.rows.length;
    const newGenresNeeded = ampersandGenres.rows.reduce((acc, genre) => {
      const parts = genre.name.split(' & ').map((part: string) => part.trim());
      let newGenres = 0;
      
      parts.forEach((part: string) => {
        // This is simplified - would need actual check
        if (!['Action', 'Adventure', 'Sci-Fi', 'Fantasy', 'War', 'Politics'].includes(part)) {
          newGenres++;
        }
      });
      
      return acc + newGenres;
    }, 0);
    
    console.log(`Current total genres: ${currentGenreCount.rows[0].count}`);
    console.log(`Genres with "&": ${genresWithAmpersand}`);
    console.log(`Estimated new genres needed: ${newGenresNeeded}`);
    console.log(`Estimated final genre count: ${parseInt(currentGenreCount.rows[0].count) - genresWithAmpersand + (genresWithAmpersand * 2) - newGenresNeeded}`);

  } catch (error) {
    console.error('Error analyzing ampersand genres:', error);
  } finally {
    await pgPool.end();
  }
}

// Run if called directly
if (require.main === module) {
  analyzeAndSplitAmpersandGenres();
}
