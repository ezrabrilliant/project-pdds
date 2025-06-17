import { connectPostgreSQL, connectMongoDB, checkDatabaseHealth } from '../config/database';
import { setupMongoDB, updateAnalyticsAfterImport } from './setup-mongodb';

async function initializeDatabase(): Promise<void> {
  try {
    console.log('🚀 Initializing Netflix Recommendation Database...');
    console.log('==========================================');
    
    // Step 1: Test database connections
    console.log('\n📡 Testing database connections...');
    await connectPostgreSQL();
    await connectMongoDB();
    
    const health = await checkDatabaseHealth();
    if (!health.postgresql || !health.mongodb) {
      throw new Error('Database health check failed');
    }
    console.log('✅ All database connections successful');
    
    // Step 2: Setup MongoDB collections and indexes
    console.log('\n🍃 Setting up MongoDB...');
    await setupMongoDB();
    
    // Step 3: Import CSV data to PostgreSQL
    console.log('\n📊 Importing Netflix data...');
    await importAllData();
    
    // Step 4: Update MongoDB analytics with imported data
    console.log('\n📈 Updating analytics data...');
    await updateAnalyticsAfterImport();
    
    console.log('\n🎉 Database initialization completed successfully!');
    console.log('==========================================');
    console.log('Ready to start the application! 🚀');
    
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    throw error;
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database initialization script failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase };
