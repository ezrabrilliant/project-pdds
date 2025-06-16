import fetch from 'node-fetch';

async function testGenresAPI() {
  try {
    console.log('=== Testing Updated Genres API ===\n');

    const response = await fetch('http://localhost:3001/api/genres');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('API Response Status:', data.success);
    console.log('Total genres returned:', data.data.total);
    
    if (data.data.stats) {
      console.log('Stats:', data.data.stats);
    }

    console.log('\nFirst 10 genres:');
    data.data.genres.slice(0, 10).forEach((genre, index) => {
      console.log(`${index + 1}. ${genre.name} (ID: ${genre.id})`);
      console.log(`   Movies: ${genre.movie_count}, TV Shows: ${genre.tvshow_count}, Total: ${genre.total_count}`);
    });

    console.log('\nGenres with TV shows (first 5):');
    const genresWithTVShows = data.data.genres.filter(genre => genre.tvshow_count > 0);
    genresWithTVShows.slice(0, 5).forEach((genre, index) => {
      console.log(`${index + 1}. ${genre.name}: ${genre.tvshow_count} TV shows`);
    });

    console.log(`\nTotal genres with TV shows: ${genresWithTVShows.length}`);
    console.log(`Total genres with movies: ${data.data.genres.filter(genre => genre.movie_count > 0).length}`);

  } catch (error) {
    console.error('Error testing API:', error);
  }
}

// Run if called directly
if (require.main === module) {
  testGenresAPI();
}
