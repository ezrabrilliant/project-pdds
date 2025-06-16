import { pgPool } from '../config/database';

async function queryAllGenresWithCounts() {
  try {
    console.log('=== Complete Genre Analysis ===\n');

    // Query comprehensive genre data
    const query = `
      SELECT 
        g.id,
        g.name,
        COALESCE(movie_stats.movie_count, 0) as movie_count,
        COALESCE(tvshow_stats.tvshow_count, 0) as tvshow_count,
        COALESCE(movie_stats.movie_count, 0) + COALESCE(tvshow_stats.tvshow_count, 0) as total_count
      FROM genres g
      LEFT JOIN (
        SELECT 
          mg.genre_id,
          COUNT(*) as movie_count
        FROM movie_genres mg
        GROUP BY mg.genre_id
      ) movie_stats ON g.id = movie_stats.genre_id
      LEFT JOIN (
        SELECT 
          tg.genre_id,
          COUNT(*) as tvshow_count
        FROM tvshow_genres tg
        GROUP BY tg.genre_id
      ) tvshow_stats ON g.id = tvshow_stats.genre_id
      ORDER BY 
        (COALESCE(movie_stats.movie_count, 0) + COALESCE(tvshow_stats.tvshow_count, 0)) DESC,
        g.name ASC
    `;

    const result = await pgPool.query(query);

    console.log('All Genres with Content Counts:');
    console.log('='.repeat(80));
    console.log('ID | Genre Name                    | Movies | TV Shows | Total');
    console.log('='.repeat(80));

    let totalMovies = 0;
    let totalTVShows = 0;
    let genresWithMovies = 0;
    let genresWithTVShows = 0;
    let genresWithBoth = 0;
    let emptyGenres = 0;

    result.rows.forEach(genre => {
      const movieCount = parseInt(genre.movie_count) || 0;
      const tvshowCount = parseInt(genre.tvshow_count) || 0;
      const totalCount = parseInt(genre.total_count) || 0;

      // Format for display
      const id = genre.id.toString().padStart(2, ' ');
      const name = genre.name.padEnd(30, ' ').substring(0, 30);
      const movies = movieCount.toString().padStart(6, ' ');
      const tvshows = tvshowCount.toString().padStart(8, ' ');
      const total = totalCount.toString().padStart(5, ' ');

      console.log(`${id} | ${name} | ${movies} | ${tvshows} | ${total}`);

      // Statistics
      totalMovies += movieCount;
      totalTVShows += tvshowCount;

      if (movieCount > 0) genresWithMovies++;
      if (tvshowCount > 0) genresWithTVShows++;
      if (movieCount > 0 && tvshowCount > 0) genresWithBoth++;
      if (totalCount === 0) emptyGenres++;
    });

    console.log('='.repeat(80));
    console.log('\n=== Summary Statistics ===');
    console.log(`Total Genres: ${result.rows.length}`);
    console.log(`Total Movie Entries: ${totalMovies}`);
    console.log(`Total TV Show Entries: ${totalTVShows}`);
    console.log(`Genres with Movies: ${genresWithMovies}`);
    console.log(`Genres with TV Shows: ${genresWithTVShows}`);
    console.log(`Genres with Both: ${genresWithBoth}`);
    console.log(`Empty Genres: ${emptyGenres}`);

    console.log('\n=== Top 10 Genres by Total Content ===');
    const top10 = result.rows
      .filter(genre => parseInt(genre.total_count) > 0)
      .slice(0, 10);

    top10.forEach((genre, index) => {
      console.log(`${index + 1}. ${genre.name}: ${genre.total_count} total (${genre.movie_count} movies, ${genre.tvshow_count} TV shows)`);
    });

    console.log('\n=== Movie-Only Genres ===');
    const movieOnly = result.rows.filter(genre => 
      parseInt(genre.movie_count) > 0 && parseInt(genre.tvshow_count) === 0
    );
    movieOnly.forEach(genre => {
      console.log(`- ${genre.name}: ${genre.movie_count} movies`);
    });

    console.log('\n=== TV Show-Only Genres ===');
    const tvShowOnly = result.rows.filter(genre => 
      parseInt(genre.movie_count) === 0 && parseInt(genre.tvshow_count) > 0
    );
    tvShowOnly.forEach(genre => {
      console.log(`- ${genre.name}: ${genre.tvshow_count} TV shows`);
    });

    console.log('\n=== Genres with Both Movies and TV Shows ===');
    const bothGenres = result.rows.filter(genre => 
      parseInt(genre.movie_count) > 0 && parseInt(genre.tvshow_count) > 0
    );
    bothGenres.forEach(genre => {
      console.log(`- ${genre.name}: ${genre.movie_count} movies, ${genre.tvshow_count} TV shows`);
    });

    if (emptyGenres > 0) {
      console.log('\n=== Empty Genres ===');
      const empty = result.rows.filter(genre => parseInt(genre.total_count) === 0);
      empty.forEach(genre => {
        console.log(`- ${genre.name} (ID: ${genre.id})`);
      });
    }

    // Test API response format
    console.log('\n=== API Response Format Sample ===');
    const sampleResponse = {
      success: true,
      data: {
        genres: result.rows.slice(0, 3).map(genre => ({
          id: genre.id,
          name: genre.name,
          movie_count: parseInt(genre.movie_count) || 0,
          tvshow_count: parseInt(genre.tvshow_count) || 0,
          total_count: parseInt(genre.total_count) || 0
        })),
        total: result.rows.length,
        stats: {
          totalGenres: result.rows.length,
          genresWithContent: result.rows.length - emptyGenres,
          emptyGenres: emptyGenres,
          totalMovieEntries: totalMovies,
          totalTVShowEntries: totalTVShows
        }
      }
    };

    console.log(JSON.stringify(sampleResponse, null, 2));

  } catch (error) {
    console.error('Error querying genres:', error);
  } finally {
    await pgPool.end();
  }
}

// Run if called directly
if (require.main === module) {
  queryAllGenresWithCounts();
}
