import { pgPool } from '../config/database';

async function verifyGenreNormalization() {
  console.log('🔍 Verifying Genre Normalization Results\n');
  
  try {
    // Get all unique genres
    const allGenres = await pgPool.query(`
      SELECT DISTINCT name FROM genres ORDER BY name
    `);
    
    console.log('📊 Current Genres in Database:');
    allGenres.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. "${row.name}"`);
    });
    console.log(`\nTotal: ${allGenres.rows.length} unique genres\n`);
    
    // Check for remaining ampersand genres
    const ampersandGenres = await pgPool.query(`
      SELECT DISTINCT name FROM genres WHERE name LIKE '%&%' ORDER BY name
    `);
    
    if (ampersandGenres.rows.length > 0) {
      console.log('⚠️  Remaining genres with ampersands:');
      ampersandGenres.rows.forEach(row => {
        console.log(`  - "${row.name}"`);
      });
    } else {
      console.log('✅ No genres with ampersands found!');
    }
    console.log();
    
    // Check for Sci-Fi variations
    const sciFiGenres = await pgPool.query(`
      SELECT DISTINCT name FROM genres 
      WHERE name ILIKE '%sci%' OR name ILIKE '%science%'
      ORDER BY name
    `);
    
    console.log('🚀 Science Fiction related genres:');
    sciFiGenres.rows.forEach(row => {
      console.log(`  - "${row.name}"`);
    });
    
    if (sciFiGenres.rows.length === 1 && sciFiGenres.rows[0].name === 'Science Fiction') {
      console.log('✅ Sci-Fi normalization successful!');
    }
    console.log();
    
    // Check genre usage statistics
    const genreStats = await pgPool.query(`
      SELECT 
        g.name,
        COUNT(DISTINCT mg.movie_id) as movie_count,
        COUNT(DISTINCT tg.tvshow_id) as tvshow_count,
        COUNT(DISTINCT mg.movie_id) + COUNT(DISTINCT tg.tvshow_id) as total_usage
      FROM genres g
      LEFT JOIN movie_genres mg ON g.id = mg.genre_id
      LEFT JOIN tvshow_genres tg ON g.id = tg.genre_id
      GROUP BY g.id, g.name
      HAVING COUNT(DISTINCT mg.movie_id) + COUNT(DISTINCT tg.tvshow_id) > 0
      ORDER BY total_usage DESC, g.name
    `);
    
    console.log('📈 Genre Usage Statistics:');
    console.log('Genre'.padEnd(20) + 'Movies'.padEnd(8) + 'TV Shows'.padEnd(10) + 'Total');
    console.log('-'.repeat(50));
    
    genreStats.rows.forEach(row => {
      console.log(
        `${row.name.padEnd(20)}${row.movie_count.toString().padEnd(8)}${row.tvshow_count.toString().padEnd(10)}${row.total_usage}`
      );
    });
    
    console.log('\n✅ Genre normalization verification completed!');
    
  } catch (error) {
    console.error('❌ Error verifying genres:', error);
  } finally {
    process.exit(0);
  }
}

if (require.main === module) {
  verifyGenreNormalization();
}
