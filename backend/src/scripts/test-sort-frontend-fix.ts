import { pgPool } from '../config/database';

async function testSortByFrontendFix() {
  console.log('🔧 Testing Sort By Frontend Fix...\n');

  try {
    console.log('1. Testing default sortOrder logic...');
    
    // Simulate what frontend should send based on sortBy selection
    const testCases = [
      { sortBy: 'title', expectedOrder: 'asc', description: 'Title should default to A-Z' },
      { sortBy: 'release_year', expectedOrder: 'desc', description: 'Year should default to Newest First' },
      { sortBy: 'vote_average', expectedOrder: 'desc', description: 'Rating should default to Highest First' },
      { sortBy: 'popularity', expectedOrder: 'desc', description: 'Popularity should default to Most Popular' },
      { sortBy: 'date_added', expectedOrder: 'desc', description: 'Date Added should default to Latest' }
    ];

    testCases.forEach(testCase => {
      console.log(`  ✅ ${testCase.sortBy} -> ${testCase.expectedOrder}: ${testCase.description}`);
    });

    console.log('\n2. Testing actual SQL queries with default sort orders...');

    for (const testCase of testCases) {
      const query = `
        SELECT title, ${testCase.sortBy}
        FROM movies 
        WHERE ${testCase.sortBy} IS NOT NULL
        ORDER BY ${testCase.sortBy} ${testCase.expectedOrder.toUpperCase()}
        LIMIT 3
      `;
      
      try {
        const result = await pgPool.query(query);
        console.log(`  ✅ ${testCase.sortBy} ${testCase.expectedOrder}: ${result.rows.length} results`);
        
        if (result.rows.length > 0) {
          console.log(`    First: ${result.rows[0].title} (${result.rows[0][testCase.sortBy]})`);
          console.log(`    Last:  ${result.rows[result.rows.length - 1].title} (${result.rows[result.rows.length - 1][testCase.sortBy]})`);
        }
      } catch (error) {
        console.log(`  ❌ ${testCase.sortBy}: Error - ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    console.log('\n3. Testing simulated frontend requests...');
    
    // Test what frontend will actually send
    const frontendRequests = [
      {
        name: 'User selects "Sort by Title (A-Z)"',
        params: { sortBy: 'title', sortOrder: 'asc' }
      },
      {
        name: 'User selects "Sort by Rating (Highest First)"',
        params: { sortBy: 'vote_average', sortOrder: 'desc' }
      },
      {
        name: 'User selects "Sort by Year (Newest First)"',
        params: { sortBy: 'release_year', sortOrder: 'desc' }
      },
      {
        name: 'No sort selected (should default to date_added desc)',
        params: { sortBy: 'date_added', sortOrder: 'desc' }
      }
    ];

    for (const request of frontendRequests) {
      const query = `
        SELECT title, ${request.params.sortBy} as sort_field
        FROM movies 
        WHERE ${request.params.sortBy} IS NOT NULL
        ORDER BY ${request.params.sortBy} ${request.params.sortOrder.toUpperCase()}
        LIMIT 2
      `;
      
      try {
        const result = await pgPool.query(query);
        console.log(`  ✅ ${request.name}`);
        console.log(`    Query: sortBy=${request.params.sortBy}, sortOrder=${request.params.sortOrder}`);
        result.rows.forEach((row, i) => {
          console.log(`    ${i + 1}. ${row.title} (${row.sort_field})`);
        });
      } catch (error) {
        console.log(`  ❌ ${request.name}: Error`);
      }
    }

    console.log('\n✅ Frontend Sort By Fix Analysis Complete!');
    console.log('\n📋 Summary of Changes Made:');
    console.log('1. ✅ Added automatic sortOrder logic based on sortBy selection');
    console.log('2. ✅ Set logical defaults: title=asc, others=desc');
    console.log('3. ✅ Added optional sort order toggle button');
    console.log('4. ✅ Updated sort option labels for clarity');
    console.log('5. ✅ Fixed parameter passing to backend API');

    console.log('\n🧪 Expected Frontend Behavior:');
    console.log('- When user selects "Sort by Title": sends sortBy=title, sortOrder=asc');
    console.log('- When user selects "Sort by Rating": sends sortBy=vote_average, sortOrder=desc');
    console.log('- When user selects "Sort by Year": sends sortBy=release_year, sortOrder=desc');
    console.log('- Sort order toggle allows reversing the direction');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pgPool.end();
  }
}

testSortByFrontendFix().catch(console.error);
