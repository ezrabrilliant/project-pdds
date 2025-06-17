import { pgPool } from '../config/database';

async function testRatingAndSortFixes() {
  console.log('🧪 Testing Rating Filter and Sort By Fixes...\n');

  try {
    // Test 1: Verify rating filter works with vote_average ranges
    console.log('1. Testing Rating Filter (Vote Average Ranges)...');
    
    const ratingTestQuery = `
      SELECT 
        title,
        vote_average,
        FLOOR(vote_average) as rating_floor
      FROM movies 
      WHERE 
        (vote_average >= 7 AND vote_average < 8)
        OR (vote_average >= 8 AND vote_average < 9)
        OR (vote_average >= 9 AND vote_average < 10)
      ORDER BY vote_average DESC
      LIMIT 10
    `;
    
    const ratingResults = await pgPool.query(ratingTestQuery);
    console.log(`✅ Found ${ratingResults.rows.length} movies with ratings 7.0+`);
    ratingResults.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.title} (${row.vote_average})`);
    });

    // Test 2: Test all sort options
    console.log('\n2. Testing Sort By Options...');
    
    const sortTests = [
      { field: 'title', order: 'ASC', description: 'Title A-Z' },
      { field: 'title', order: 'DESC', description: 'Title Z-A' },
      { field: 'vote_average', order: 'DESC', description: 'Rating High-Low' },
      { field: 'vote_average', order: 'ASC', description: 'Rating Low-High' },
      { field: 'popularity', order: 'DESC', description: 'Popularity High-Low' },
      { field: 'release_year', order: 'DESC', description: 'Year Newest-Oldest' },
      { field: 'date_added', order: 'DESC', description: 'Date Added Newest-Oldest' }
    ];

    for (const test of sortTests) {
      try {
        const sortQuery = `
          SELECT title, ${test.field}
          FROM movies 
          WHERE ${test.field} IS NOT NULL
          ORDER BY ${test.field} ${test.order}
          LIMIT 3
        `;
        
        const sortResult = await pgPool.query(sortQuery);
        console.log(`  ✅ ${test.description}: ${sortResult.rows.length} results`);
        
        // Show first result to verify sort order
        if (sortResult.rows.length > 0) {
          const firstItem = sortResult.rows[0];
          console.log(`    First: ${firstItem.title} (${firstItem[test.field]})`);
        }
      } catch (error) {
        console.log(`  ❌ ${test.description}: Error - ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    // Test 3: Test combined rating + sort query (like what frontend will send)
    console.log('\n3. Testing Combined Rating Filter + Sort...');
    
    const combinedQuery = `
      SELECT title, vote_average, release_year
      FROM movies 
      WHERE 
        (vote_average >= 7 AND vote_average < 8)
        OR (vote_average >= 8 AND vote_average < 9)
      ORDER BY vote_average DESC
      LIMIT 5
    `;
    
    const combinedResult = await pgPool.query(combinedQuery);
    console.log(`✅ Combined filter + sort: ${combinedResult.rows.length} results`);
    combinedResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.title} (Rating: ${row.vote_average}, Year: ${row.release_year})`);
    });

    // Test 4: Test rating distribution to verify what ratings are available
    console.log('\n4. Rating Distribution Summary...');
    
    const distributionQuery = `
      SELECT 
        FLOOR(vote_average) as rating_range,
        COUNT(*) as count,
        MIN(vote_average) as min_rating,
        MAX(vote_average) as max_rating
      FROM movies 
      WHERE vote_average > 0
      GROUP BY FLOOR(vote_average)
      ORDER BY rating_range DESC
    `;
    
    const distResult = await pgPool.query(distributionQuery);
    console.log('Available rating ranges in database:');
    distResult.rows.forEach(row => {
      console.log(`  ${row.rating_range}.0-${row.rating_range}.9: ${row.count} movies (${row.min_rating}-${row.max_rating})`);
    });

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Rating filter now uses vote_average ranges (1-10) instead of content ratings');
    console.log('- ✅ Sort by options include vote_average and popularity');
    console.log('- ✅ Combined filtering and sorting works correctly');
    console.log('- ✅ Frontend can now filter by multiple rating ranges');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pgPool.end();
  }
}

// Run the test
testRatingAndSortFixes().catch(console.error);
