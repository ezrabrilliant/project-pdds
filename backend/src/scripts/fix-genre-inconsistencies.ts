import { pgPool } from '../config/database';

interface GenreMapping {
  original: string;
  normalized: string;
}

// Mapping untuk normalisasi genre
const GENRE_MAPPINGS: GenreMapping[] = [
  // Sci-Fi variations
  { original: 'Sci-Fi', normalized: 'Science Fiction' },
  { original: 'Science Fiction', normalized: 'Science Fiction' },
  { original: 'Sci-fi', normalized: 'Science Fiction' },
  
  // Action & Adventure combinations
  { original: 'Action & Adventure', normalized: 'Action' }, // Will be split later
  { original: 'Adventure & Action', normalized: 'Action' }, // Will be split later
  
  // Other common variations
  { original: 'Comedy', normalized: 'Comedy' },
  { original: 'Drama', normalized: 'Drama' },
  { original: 'Horror', normalized: 'Horror' },
  { original: 'Thriller', normalized: 'Thriller' },
  { original: 'Romance', normalized: 'Romance' },
  { original: 'Crime', normalized: 'Crime' },
  { original: 'Mystery', normalized: 'Mystery' },
  { original: 'Fantasy', normalized: 'Fantasy' },
  { original: 'Animation', normalized: 'Animation' },
  { original: 'Family', normalized: 'Family' },
  { original: 'Documentary', normalized: 'Documentary' },
  { original: 'War', normalized: 'War' },
  { original: 'Western', normalized: 'Western' },
  { original: 'Music', normalized: 'Music' },
  { original: 'Musical', normalized: 'Music' },
  { original: 'Biography', normalized: 'Biography' },
  { original: 'History', normalized: 'History' },
  { original: 'Sport', normalized: 'Sports' },
  { original: 'Sports', normalized: 'Sports' },
];

async function analyzeGenreProblems() {
  console.log('🔍 Analyzing genre inconsistencies...\n');
  
  try {
    // Get all unique genres from movies
    const movieGenresQuery = `
      SELECT DISTINCT g.name as genre_name, 'movie' as source
      FROM genres g
      JOIN movie_genres mg ON g.id = mg.genre_id
      ORDER BY g.name
    `;
    
    // Get all unique genres from TV shows
    const tvGenresQuery = `
      SELECT DISTINCT g.name as genre_name, 'tv' as source
      FROM genres g
      JOIN tvshow_genres tg ON g.id = tg.genre_id
      ORDER BY g.name
    `;
    
    const [movieGenres, tvGenres] = await Promise.all([
      pgPool.query(movieGenresQuery),
      pgPool.query(tvGenresQuery)
    ]);
    
    console.log('📊 Genre Analysis:');
    console.log(`Movies have ${movieGenres.rows.length} unique genres`);
    console.log(`TV Shows have ${tvGenres.rows.length} unique genres\n`);
    
    // Find genres with ampersands
    const ampersandGenres = await pgPool.query(`
      SELECT DISTINCT name FROM genres WHERE name LIKE '%&%' ORDER BY name
    `);
    
    console.log('🔗 Genres with ampersands:');
    ampersandGenres.rows.forEach(row => {
      console.log(`  - "${row.name}"`);
    });
    console.log();
    
    // Find Sci-Fi variations
    const sciFiGenres = await pgPool.query(`
      SELECT DISTINCT name FROM genres 
      WHERE name ILIKE '%sci%' OR name ILIKE '%science%'
      ORDER BY name
    `);
    
    console.log('🚀 Science Fiction variations:');
    sciFiGenres.rows.forEach(row => {
      console.log(`  - "${row.name}"`);
    });
    console.log();
    
    // Find potential duplicates (case insensitive, with variations)
    const allGenres = await pgPool.query(`
      SELECT DISTINCT name FROM genres ORDER BY name
    `);
    
    console.log('📝 All unique genres:');
    allGenres.rows.forEach(row => {
      console.log(`  - "${row.name}"`);
    });
    
    return {
      movieGenres: movieGenres.rows,
      tvGenres: tvGenres.rows,
      ampersandGenres: ampersandGenres.rows,
      sciFiGenres: sciFiGenres.rows,
      allGenres: allGenres.rows
    };
    
  } catch (error) {
    console.error('❌ Error analyzing genres:', error);
    throw error;
  }
}

async function normalizeGenres() {
  console.log('\n🔧 Starting genre normalization...\n');
  
  try {
    // First, handle ampersand genres by splitting them
    const ampersandGenres = await pgPool.query(`
      SELECT id, name FROM genres WHERE name LIKE '%&%'
    `);
    
    for (const genre of ampersandGenres.rows) {
      console.log(`Processing: "${genre.name}"`);
        // Split by & and clean up
      const splitGenres = genre.name
        .split('&')
        .map((g: string) => g.trim())
        .filter((g: string) => g.length > 0);
      
      console.log(`  Split into: ${splitGenres.join(', ')}`);
      
      // For each split genre, ensure it exists in genres table
      for (const splitGenre of splitGenres) {
        // Check if genre already exists
        const existingGenre = await pgPool.query(
          'SELECT id FROM genres WHERE name = $1',
          [splitGenre]
        );
        
        let genreId;
        if (existingGenre.rows.length === 0) {
          // Create new genre
          const newGenre = await pgPool.query(
            'INSERT INTO genres (name) VALUES ($1) RETURNING id',
            [splitGenre]
          );
          genreId = newGenre.rows[0].id;
          console.log(`    Created new genre: "${splitGenre}" (ID: ${genreId})`);
        } else {
          genreId = existingGenre.rows[0].id;
          console.log(`    Using existing genre: "${splitGenre}" (ID: ${genreId})`);
        }
        
        // Copy movie relationships
        await pgPool.query(`
          INSERT INTO movie_genres (movie_id, genre_id)
          SELECT movie_id, $1
          FROM movie_genres 
          WHERE genre_id = $2
          ON CONFLICT (movie_id, genre_id) DO NOTHING
        `, [genreId, genre.id]);
        
        // Copy TV show relationships
        await pgPool.query(`
          INSERT INTO tvshow_genres (tvshow_id, genre_id)
          SELECT tvshow_id, $1
          FROM tvshow_genres 
          WHERE genre_id = $2
          ON CONFLICT (tvshow_id, genre_id) DO NOTHING
        `, [genreId, genre.id]);
      }
      
      // Remove original ampersand genre relationships
      await pgPool.query('DELETE FROM movie_genres WHERE genre_id = $1', [genre.id]);
      await pgPool.query('DELETE FROM tvshow_genres WHERE genre_id = $1', [genre.id]);
      
      // Remove original ampersand genre
      await pgPool.query('DELETE FROM genres WHERE id = $1', [genre.id]);
      
      console.log(`  ✅ Completed processing "${genre.name}"\n`);
    }
    
    // Handle Sci-Fi to Science Fiction normalization
    console.log('🚀 Normalizing Sci-Fi variations...');
    
    const sciFiVariations = await pgPool.query(`
      SELECT id, name FROM genres 
      WHERE name ILIKE '%sci-fi%' OR name = 'Sci-fi'
    `);
    
    // Ensure Science Fiction genre exists
    let scienceFictionId;
    const scienceFictionGenre = await pgPool.query(
      'SELECT id FROM genres WHERE name = $1',
      ['Science Fiction']
    );
    
    if (scienceFictionGenre.rows.length === 0) {
      const newGenre = await pgPool.query(
        'INSERT INTO genres (name) VALUES ($1) RETURNING id',
        ['Science Fiction']
      );
      scienceFictionId = newGenre.rows[0].id;
      console.log('  Created "Science Fiction" genre');
    } else {
      scienceFictionId = scienceFictionGenre.rows[0].id;
      console.log('  Using existing "Science Fiction" genre');
    }
    
    for (const variation of sciFiVariations.rows) {
      if (variation.name !== 'Science Fiction') {        console.log(`  Converting "${variation.name}" to "Science Fiction"`);
        
        // Move movie relationships
        await pgPool.query(`
          INSERT INTO movie_genres (movie_id, genre_id)
          SELECT movie_id, $1
          FROM movie_genres 
          WHERE genre_id = $2
          ON CONFLICT (movie_id, genre_id) DO NOTHING
        `, [scienceFictionId, variation.id]);
        
        // Move TV show relationships
        await pgPool.query(`
          INSERT INTO tvshow_genres (tvshow_id, genre_id)
          SELECT tvshow_id, $1
          FROM tvshow_genres 
          WHERE genre_id = $2
          ON CONFLICT (tvshow_id, genre_id) DO NOTHING
        `, [scienceFictionId, variation.id]);
        
        // Remove old genre relationships that might conflict
        await pgPool.query('DELETE FROM movie_genres WHERE genre_id = $1', [variation.id]);
        await pgPool.query('DELETE FROM tvshow_genres WHERE genre_id = $1', [variation.id]);
        
        // Remove old genre
        await pgPool.query('DELETE FROM genres WHERE id = $1', [variation.id]);
      }
    }
    
    console.log('\n✅ Genre normalization completed!');
    
  } catch (error) {
    console.error('❌ Error normalizing genres:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🎬 Genre Normalization Tool\n');
    
    // Analyze current state
    await analyzeGenreProblems();
    
    // Ask for confirmation (in a real scenario, you might want user input)
    console.log('\n⚠️  This will modify the database. Proceeding with normalization...\n');
    
    // Normalize genres
    await normalizeGenres();
    
    console.log('\n🎉 All done! Run the analysis again to see the results.');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}
