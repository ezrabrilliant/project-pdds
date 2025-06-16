import fs from 'fs';
import path from 'path';
import { pgPool } from '../config/database';

async function executeSchema(): Promise<void> {
  try {
    console.log('📋 Executing PostgreSQL schema...');
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await pgPool.query(schemaSQL);
    
    console.log('✅ PostgreSQL schema executed successfully');
    
    // Verify tables were created
    const tablesResult = await pgPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Schema execution failed:', error);
    throw error;
  }
}

// Run schema setup if this file is executed directly
if (require.main === module) {
  executeSchema()
    .then(() => {
      console.log('✅ Schema setup script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Schema setup script failed:', error);
      process.exit(1);
    });
}

export { executeSchema };
