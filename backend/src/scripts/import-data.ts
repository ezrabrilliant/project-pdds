import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { pgPool } from '../config/database';

interface RawContent {
  show_id: string;
  type: 'Movie' | 'TV Show';
  title: string;
  director?: string;
  cast?: string;
  country?: string;
  date_added?: string;
  release_year: string;
  rating: string;
  duration?: string;
  genres: string;
  language: string;
  description?: string;
  popularity: string;
  vote_count: string;
  vote_average: string;
  budget?: string;
  revenue?: string;
}

const BATCH_SIZE = 500; // Smaller batch size for stability

// Helper functions with proper null handling based on your data analysis
function parseNumber(value: string | undefined, defaultValue: number = 0): number {
  if (!value || value.trim() === '' || value === '0' || value.toLowerCase() === 'null') return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

function parseDurationToMinutes(duration: string | undefined): number | null {
  if (!duration || duration.trim() === '' || duration.toLowerCase() === 'null') return null;
  
  // Parse duration like "90 min" or "120 min" to integer minutes
  const match = duration.match(/(\d+)\s*min/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  return null;
}

function cleanString(value: string | undefined): string | null {
  if (!value || value.trim() === '' || value.toLowerCase() === 'null' || value.trim() === '0') return null;
  return value.trim();
}

// Read CSV and process data
async function readAndProcessCSV(filePath: string, isMovie: boolean): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: RawContent) => {
        try {          const processed: any = {
            show_id: row.show_id,
            title: cleanString(row.title) || 'Unknown Title',
            director: cleanString(row.director), // 68.5% null for TV shows is OK
            cast_members: cleanString(row.cast),
            country: cleanString(row.country),
            date_added: cleanString(row.date_added),
            release_year: parseNumber(row.release_year, 2000),
            rating: cleanString(row.rating) || 'Not Rated',
            language: cleanString(row.language) || 'en',
            description: cleanString(row.description), // 20% null for TV shows is OK
            popularity: parseNumber(row.popularity, 0),
            vote_count: parseNumber(row.vote_count, 0), // 23% zero for TV shows is OK
            vote_average: parseNumber(row.vote_average, 0), // 23% zero for TV shows is OK
            genres: cleanString(row.genres) || 'Unknown',
          };

          // Handle duration differently for movies vs TV shows
          if (isMovie) {
            processed.duration_minutes = parseDurationToMinutes(row.duration);
          } else {
            processed.duration = cleanString(row.duration); // "3 Seasons" format for TV shows
          }

          // Add budget/revenue only for movies (69.7% and 64.7% missing is expected)
          if (isMovie) {
            processed.budget = parseNumber(row.budget, 0);
            processed.revenue = parseNumber(row.revenue, 0);
          }
          
          results.push(processed);
        } catch (error) {
          console.log(`⚠️ Skipping invalid row: ${error}`);
        }
      })
      .on('end', () => {
        console.log(`📖 Read ${results.length} records from ${path.basename(filePath)}`);
        resolve(results);
      })
      .on('error', reject);
  });
}

// Simple bulk insert with proper error handling
async function bulkInsert(data: any[], tableName: string, isMovie: boolean): Promise<void> {
  if (data.length === 0) return;  const baseMovieColumns = ['show_id', 'title', 'director', 'cast_members', 'country', 'date_added', 'release_year', 'rating', 'duration_minutes', 'language', 'description', 'popularity', 'vote_count', 'vote_average'];
  const baseTVColumns = ['show_id', 'title', 'director', 'cast_members', 'country', 'date_added', 'release_year', 'rating', 'duration', 'language', 'description', 'popularity', 'vote_count', 'vote_average'];
  
  const movieColumns = [...baseMovieColumns, 'budget', 'revenue'];
  const columns = isMovie ? movieColumns : baseTVColumns;

  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    
    try {
      // Build values string with proper parameter indexing
      const valueStrings = batch.map((_, rowIndex) => {
        const params = columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`);
        return `(${params.join(', ')})`;
      });

      // Flatten all values
      const flatValues = batch.flatMap(row => 
        columns.map(col => row[col] === undefined ? null : row[col])
      );      const query = `
        INSERT INTO ${tableName} (${columns.join(', ')})
        VALUES ${valueStrings.join(', ')}
        ON CONFLICT (show_id) DO NOTHING
      `;

      await pgPool.query(query, flatValues);
      console.log(`✅ Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} for ${tableName} (${batch.length} records)`);
      
    } catch (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1} for ${tableName}:`, error);
      throw error;
    }
  }
}

// Extract and insert genres
async function insertGenres(allData: any[]): Promise<void> {
  const genreSet = new Set<string>();
  
  allData.forEach(item => {
    if (item.genres && item.genres !== 'Unknown') {
      item.genres.split(',').forEach((genre: string) => {
        const cleaned = genre.trim();
        if (cleaned) genreSet.add(cleaned);
      });
    }
  });

  const uniqueGenres = Array.from(genreSet);
  if (uniqueGenres.length === 0) return;

  try {
    const valueStrings = uniqueGenres.map((_, index) => `($${index + 1})`);
    const query = `
      INSERT INTO genres (name)
      VALUES ${valueStrings.join(', ')}
      ON CONFLICT (name) DO NOTHING
    `;
    
    await pgPool.query(query, uniqueGenres);
    console.log(`✅ Inserted ${uniqueGenres.length} unique genres`);
  } catch (error) {
    console.error('❌ Error inserting genres:', error);
    throw error;
  }
}

// Insert genre relationships
async function insertGenreRelationships(data: any[], isMovie: boolean): Promise<void> {
  const tableName = isMovie ? 'movie_genres' : 'tvshow_genres';
  const idColumn = isMovie ? 'movie_id' : 'tvshow_id';
  
  const relationships: { contentId: string; genreId: number }[] = [];
  
  // Get genre IDs first
  const genreResult = await pgPool.query('SELECT id, name FROM genres');
  const genreMap = new Map<string, number>();
  genreResult.rows.forEach(row => {
    genreMap.set(row.name, row.id);
  });
  
  // Build relationships
  data.forEach(item => {
    if (item.genres && item.genres !== 'Unknown') {
      const genreNames = item.genres.split(',').map((g: string) => g.trim());
      genreNames.forEach((genreName: string) => {
        const genreId = genreMap.get(genreName);
        if (genreId) {
          relationships.push({
            contentId: item.show_id,
            genreId: genreId
          });
        }
      });
    }
  });
  
  if (relationships.length === 0) return;
  
  // Insert relationships in batches
  for (let i = 0; i < relationships.length; i += BATCH_SIZE) {
    const batch = relationships.slice(i, i + BATCH_SIZE);
    
    try {
      const valueStrings = batch.map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`);
      const flatValues = batch.flatMap(rel => [rel.contentId, rel.genreId]);
      
      const query = `
        INSERT INTO ${tableName} (${idColumn}, genre_id)
        VALUES ${valueStrings.join(', ')}
        ON CONFLICT (${idColumn}, genre_id) DO NOTHING
      `;
      
      await pgPool.query(query, flatValues);
      console.log(`✅ Inserted genre relationships batch ${Math.floor(i / BATCH_SIZE) + 1} for ${tableName}`);
      
    } catch (error) {
      console.error(`❌ Error inserting genre relationships for ${tableName}:`, error);
      throw error;
    }
  }
  
  console.log(`✅ Completed ${relationships.length} genre relationships for ${tableName}`);
}

async function main() {
  try {
    console.log('🚀 Starting Netflix data import (optimized for data quality)...');

    const csvDir = path.join(__dirname, '../../../');
    const moviesFile = path.join(csvDir, 'netflix_movies_detailed_up_to_2025.csv');
    const tvShowsFile = path.join(csvDir, 'netflix_tv_shows_detailed_up_to_2025.csv');

    // Read data
    console.log('📖 Reading CSV files...');
    const [movies, tvShows] = await Promise.all([
      readAndProcessCSV(moviesFile, true),
      readAndProcessCSV(tvShowsFile, false)
    ]);

    // Insert genres first
    console.log('🎭 Processing genres...');
    await insertGenres([...movies, ...tvShows]);    // Insert movies
    console.log('🎬 Importing movies...');
    await bulkInsert(movies, 'movies', true);

    // Insert TV shows
    console.log('📺 Importing TV shows...');
    await bulkInsert(tvShows, 'tv_shows', false);

    // Insert genre relationships
    console.log('🔗 Creating movie-genre relationships...');
    await insertGenreRelationships(movies, true);
    
    console.log('🔗 Creating TV show-genre relationships...');
    await insertGenreRelationships(tvShows, false);

    // Insert genre relationships
    console.log('🔗 Importing genre relationships for movies...');
    await insertGenreRelationships(movies, true);

    console.log('🔗 Importing genre relationships for TV shows...');
    await insertGenreRelationships(tvShows, false);

    // Final counts
    const [movieCount, tvShowCount, genreCount] = await Promise.all([
      pgPool.query('SELECT COUNT(*) FROM movies'),
      pgPool.query('SELECT COUNT(*) FROM tv_shows'),
      pgPool.query('SELECT COUNT(*) FROM genres')
    ]);

    console.log('\n🎉 Import completed successfully!');
    console.log(`📊 Final counts:`);
    console.log(`   🎬 Movies: ${movieCount.rows[0].count}`);
    console.log(`   📺 TV Shows: ${tvShowCount.rows[0].count}`);
    console.log(`   🎭 Genres: ${genreCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}
