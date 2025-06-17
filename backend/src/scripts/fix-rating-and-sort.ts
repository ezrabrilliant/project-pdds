import { pgPool } from '../config/database';

async function fixRatingAndSort() {
  console.log('🔧 Fixing Rating Filter and Sort By...\n');

  try {    // 1. Check current rating column structure
    console.log('1. Checking current rating column structure...');
    
    // Check movies ratings
    const movieRatings = await pgPool.query(`
      SELECT 
        'movies' as table_name,
        vote_average as rating_value,
        COUNT(*) as count
      FROM movies 
      WHERE vote_average IS NOT NULL 
      GROUP BY vote_average 
      ORDER BY vote_average
      LIMIT 10
    `);
    
    // Check TV shows ratings
    const tvRatings = await pgPool.query(`
      SELECT 
        'tv_shows' as table_name,
        vote_average as rating_value,
        COUNT(*) as count
      FROM tv_shows 
      WHERE vote_average IS NOT NULL 
      GROUP BY vote_average 
      ORDER BY vote_average
      LIMIT 10
    `);
    
    console.log('Rating values found in database:');
    [...movieRatings.rows, ...tvRatings.rows].forEach(row => {
      console.log(`  ${row.table_name}: ${row.rating_value} (${row.count} items)`);
    });    // 2. Check rating distribution
    console.log('\n2. Checking rating distribution...');
    
    // Get all ratings combined
    const movieRatingDist = await pgPool.query(`
      SELECT vote_average FROM movies WHERE vote_average IS NOT NULL
    `);
    
    const tvRatingDist = await pgPool.query(`
      SELECT vote_average FROM tv_shows WHERE vote_average IS NOT NULL
    `);
      const allRatings = [...movieRatingDist.rows, ...tvRatingDist.rows];
    const ratingGroups: { [key: number]: number } = {};
    
    allRatings.forEach(row => {
      const floor = Math.floor(row.vote_average);
      ratingGroups[floor] = (ratingGroups[floor] || 0) + 1;
    });
    
    console.log('Rating distribution by floor:');
    Object.keys(ratingGroups).sort().forEach(rating => {
      const ratingNum = parseInt(rating);
      console.log(`  Rating ${ratingNum}-${ratingNum + 0.9}: ${ratingGroups[ratingNum]} items`);
    });

    // 3. Test sort functionality with different columns
    console.log('\n3. Testing sort functionality...');
    
    const sortTests = [
      { column: 'title', order: 'ASC' },
      { column: 'title', order: 'DESC' },
      { column: 'release_year', order: 'ASC' },
      { column: 'release_year', order: 'DESC' },
      { column: 'vote_average', order: 'ASC' },
      { column: 'vote_average', order: 'DESC' },
      { column: 'date_added', order: 'ASC' },
      { column: 'date_added', order: 'DESC' }
    ];

    for (const test of sortTests) {
      try {
        const result = await pgPool.query(`
          SELECT title, release_year, vote_average, date_added
          FROM movies 
          ORDER BY ${test.column} ${test.order}
          LIMIT 3
        `);
        
        console.log(`  ✅ Sort by ${test.column} ${test.order}: ${result.rows.length} results`);
        result.rows.forEach((row, index) => {
          console.log(`    ${index + 1}. ${row.title} (${row[test.column.toLowerCase()]})`);
        });      } catch (error) {
        console.log(`  ❌ Sort by ${test.column} ${test.order}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // 4. Check column names in movies and tv_shows tables
    console.log('\n4. Checking available columns...');
    const movieColumns = await pgPool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'movies'
      ORDER BY column_name
    `);
    
    console.log('Movies table columns:');
    movieColumns.rows.forEach(row => {
      console.log(`  ${row.column_name} (${row.data_type})`);
    });

    console.log('\n✅ Analysis complete!');
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
  } finally {
    await pgPool.end();
  }
}

// Run the script
fixRatingAndSort().catch(console.error);
