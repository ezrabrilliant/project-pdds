import { pgPool } from '../config/database';

async function analyzeGenreDifferences() {
  try {
    console.log('=== Analyzing Genre Differences Between Movies and TV Shows ===\n');

    // 1. Get all genres that have movies
    const movieGenresQuery = `
      SELECT DISTINCT g.id, g.name, COUNT(*) as count
      FROM genres g
      JOIN movie_genres mg ON g.id = mg.genre_id
      GROUP BY g.id, g.name
      ORDER BY g.name
    `;
    
    const movieGenres = await pgPool.query(movieGenresQuery);
    console.log('Genres with movies:');
    movieGenres.rows.forEach(row => {
      console.log(`- ${row.name} (ID: ${row.id}, Count: ${row.count})`);
    });

    console.log('\n=== Genres with TV Shows ===');

    // 2. Get all genres that have TV shows
    const tvGenresQuery = `
      SELECT DISTINCT g.id, g.name, COUNT(*) as count
      FROM genres g
      JOIN tvshow_genres tg ON g.id = tg.genre_id
      GROUP BY g.id, g.name
      ORDER BY g.name
    `;
    
    const tvGenres = await pgPool.query(tvGenresQuery);
    console.log('Genres with TV shows:');
    tvGenres.rows.forEach(row => {
      console.log(`- ${row.name} (ID: ${row.id}, Count: ${row.count})`);
    });

    console.log('\n=== Comparison ===');
    
    const movieGenreNames = new Set(movieGenres.rows.map(row => row.name));
    const tvGenreNames = new Set(tvGenres.rows.map(row => row.name));

    console.log('Genres only in movies:');
    movieGenreNames.forEach(name => {
      if (!tvGenreNames.has(name)) {
        console.log(`- ${name}`);
      }
    });

    console.log('\nGenres only in TV shows:');
    tvGenreNames.forEach(name => {
      if (!movieGenreNames.has(name)) {
        console.log(`- ${name}`);
      }
    });

    console.log('\nGenres in both:');
    movieGenreNames.forEach(name => {
      if (tvGenreNames.has(name)) {
        console.log(`- ${name}`);
      }
    });

    // 3. Check if there are empty genres
    console.log('\n=== Empty Genres ===');
    const allGenresQuery = 'SELECT id, name FROM genres ORDER BY name';
    const allGenres = await pgPool.query(allGenresQuery);
    
    const usedGenreIds = new Set([
      ...movieGenres.rows.map(row => row.id),
      ...tvGenres.rows.map(row => row.id)
    ]);

    console.log('Genres with no content:');
    allGenres.rows.forEach(genre => {
      if (!usedGenreIds.has(genre.id)) {
        console.log(`- ${genre.name} (ID: ${genre.id})`);
      }
    });

    // 4. Sample issue diagnosis
    console.log('\n=== Diagnosis ===');
    
    // Check why Action genre has no TV shows but Action & Adventure does
    const actionDiagnosisQuery = `
      SELECT 
        'Movies' as type,
        g.name,
        COUNT(*) as count
      FROM genres g
      JOIN movie_genres mg ON g.id = mg.genre_id
      WHERE g.name IN ('Action', 'Action & Adventure')
      GROUP BY g.name
      
      UNION ALL
      
      SELECT 
        'TV Shows' as type,
        g.name,
        COUNT(*) as count
      FROM genres g
      JOIN tvshow_genres tg ON g.id = tg.genre_id
      WHERE g.name IN ('Action', 'Action & Adventure')
      GROUP BY g.name
      
      ORDER BY name, type
    `;

    const diagnosisResult = await pgPool.query(actionDiagnosisQuery);
    console.log('Action vs Action & Adventure breakdown:');
    diagnosisResult.rows.forEach(row => {
      console.log(`${row.type}: ${row.name} = ${row.count}`);
    });

  } catch (error) {
    console.error('Error analyzing genres:', error);
  } finally {
    await pgPool.end();
  }
}

// Run if called directly
if (require.main === module) {
  analyzeGenreDifferences();
}
