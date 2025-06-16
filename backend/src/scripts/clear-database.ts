import { pgPool } from '../config/database';

async function clearDatabase() {
  try {
    console.log('🗑️ Clearing PostgreSQL database...');

    // Drop tables in correct order (handle foreign key dependencies)
    await pgPool.query('DROP TABLE IF EXISTS content_genres CASCADE');
    await pgPool.query('DROP TABLE IF EXISTS cast_crew CASCADE');
    await pgPool.query('DROP TABLE IF EXISTS tv_shows CASCADE');
    await pgPool.query('DROP TABLE IF EXISTS movies CASCADE');
    await pgPool.query('DROP TABLE IF EXISTS genres CASCADE');

    console.log('✅ All PostgreSQL tables dropped successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  } finally {
    await pgPool.end();
  }
}

clearDatabase();
