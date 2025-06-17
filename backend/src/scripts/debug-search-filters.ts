import { pgPool } from '../config/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' });

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

interface SampleData {
  show_id: string;
  title: string;
  rating: string;
  release_year: number;
  vote_average?: number;
}

async function debugSearchFilters() {
  try {
    console.log('🔍 DEBUG: Search Filters Analysis');
    console.log('=' .repeat(50));

    // 1. Check table structures
    console.log('\n1. 📋 CHECKING TABLE STRUCTURES:');
    
    // Check movies table structure
    console.log('\n🎬 Movies table structure:');
    const moviesColumns = await pgPool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'movies' 
      ORDER BY ordinal_position
    `);
    
    moviesColumns.rows.forEach((col: ColumnInfo) => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Check tv_shows table structure
    console.log('\n📺 TV Shows table structure:');
    const tvShowsColumns = await pgPool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'tv_shows' 
      ORDER BY ordinal_position
    `);
    
    tvShowsColumns.rows.forEach((col: ColumnInfo) => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // 2. Sample data analysis
    console.log('\n\n2. 📊 SAMPLE DATA ANALYSIS:');
      // Check movies rating values
    console.log('\n🎬 Movies rating samples:');
    const moviesSample = await pgPool.query(`
      SELECT show_id, title, rating, release_year, vote_average
      FROM movies 
      ORDER BY RANDOM() 
      LIMIT 10
    `);
    
    moviesSample.rows.forEach((movie: SampleData) => {
      console.log(`  - ${movie.title} (${movie.release_year})`);
      console.log(`    Rating: "${movie.rating}"`);
      console.log(`    Vote Average: ${movie.vote_average || 'NULL'}`);
    });

    // Check TV shows rating values
    console.log('\n📺 TV Shows rating samples:');
    const tvShowsSample = await pgPool.query(`
      SELECT show_id, title, rating, release_year, vote_average
      FROM tv_shows 
      ORDER BY RANDOM() 
      LIMIT 10
    `);
    
    tvShowsSample.rows.forEach((show: SampleData) => {
      console.log(`  - ${show.title} (${show.release_year})`);
      console.log(`    Rating: "${show.rating}"`);
      console.log(`    Vote Average: ${show.vote_average || 'NULL'}`);
    });

    // 3. Rating distribution analysis
    console.log('\n\n3. 📈 RATING DISTRIBUTION ANALYSIS:');
    
    console.log('\n🎬 Movies rating distribution:');
    const moviesRatingDist = await pgPool.query(`
      SELECT rating, COUNT(*) as count
      FROM movies 
      WHERE rating IS NOT NULL AND rating != ''
      GROUP BY rating 
      ORDER BY count DESC
    `);
    
    moviesRatingDist.rows.forEach((row: any) => {
      console.log(`  - "${row.rating}": ${row.count} movies`);
    });

    console.log('\n📺 TV Shows rating distribution:');
    const tvShowsRatingDist = await pgPool.query(`
      SELECT rating, COUNT(*) as count
      FROM tv_shows 
      WHERE rating IS NOT NULL AND rating != ''
      GROUP BY rating 
      ORDER BY count DESC
    `);
    
    tvShowsRatingDist.rows.forEach((row: any) => {
      console.log(`  - "${row.rating}": ${row.count} TV shows`);
    });

    // 4. Sorting capabilities analysis
    console.log('\n\n4. 🔀 SORTING CAPABILITIES ANALYSIS:');
    
    console.log('\n🎬 Movies sortable columns test:');
    try {
      const moviesSortTest = await pgPool.query(`
        SELECT title, release_year, rating, vote_average, date_added
        FROM movies 
        WHERE title IS NOT NULL
        ORDER BY title ASC
        LIMIT 5
      `);
      console.log('  ✅ Sort by title: WORKING');
      
      const moviesSortTest2 = await pgPool.query(`
        SELECT title, release_year, rating, vote_average, date_added
        FROM movies 
        WHERE release_year IS NOT NULL
        ORDER BY release_year DESC
        LIMIT 5
      `);
      console.log('  ✅ Sort by release_year: WORKING');
      
      const moviesSortTest3 = await pgPool.query(`
        SELECT title, release_year, rating, vote_average, date_added
        FROM movies 
        WHERE date_added IS NOT NULL
        ORDER BY date_added DESC
        LIMIT 5
      `);
      console.log('  ✅ Sort by date_added: WORKING');
      
      const moviesSortTest4 = await pgPool.query(`
        SELECT title, release_year, rating, vote_average, date_added
        FROM movies 
        WHERE vote_average IS NOT NULL
        ORDER BY vote_average DESC
        LIMIT 5
      `);
      console.log('  ✅ Sort by vote_average: WORKING');
      
    } catch (error) {
      console.log('  ❌ Sorting test failed:', error);
    }

    // 5. Check current search route implementation
    console.log('\n\n5. 🔍 SEARCH QUERY ANALYSIS:');
    
    // Test current filter logic
    console.log('\n🧪 Testing filter scenarios:');
    
    // Test rating filter with common values
    const commonRatings = ['PG', 'PG-13', 'R', 'G', 'TV-MA', 'TV-14', 'TV-PG'];
    
    for (const ratingValue of commonRatings) {
      try {
        const ratingTest = await pgPool.query(`
          SELECT COUNT(*) as count
          FROM movies 
          WHERE rating = $1
        `, [ratingValue]);
        
        console.log(`  - Rating "${ratingValue}": ${ratingTest.rows[0].count} movies`);
      } catch (error) {
        console.log(`  ❌ Rating "${ratingValue}" test failed:`, error);
      }
    }

    // 6. Current search implementation analysis
    console.log('\n\n6. 🛠️ RECOMMENDATIONS FOR FIXES:');
    console.log('\n📝 Issues identified and solutions:');
    
    console.log('\n🔧 RATING FILTER ISSUES:');
    console.log('  - Problem: Rating filter tidak berfungsi karena nilai di database berbeda dengan ekspektasi');
    console.log('  - Solution: Perlu mapping rating values atau normalisasi');
    
    console.log('\n🔧 SORT BY ISSUES:');
    console.log('  - Problem: Sort by kemungkinan tidak ter-handle dengan benar di backend');
    console.log('  - Solution: Perlu perbaikan query builder untuk sorting');
    
    console.log('\n✅ NEXT STEPS:');
    console.log('  1. Fix rating filter mapping');
    console.log('  2. Fix sort by query implementation'); 
    console.log('  3. Add proper error handling');
    console.log('  4. Test with different combinations');

    console.log('\n' + '='.repeat(50));
    console.log('🎯 Analysis completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
  } finally {
    await pgPool.end();
  }
}

// Run the analysis
debugSearchFilters().catch(console.error);
