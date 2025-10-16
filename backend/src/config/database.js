const { Pool } = require('pg');

// Parse DATABASE_URL or use individual config
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
  }
  
  // Fallback to individual environment variables
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'netflixdb',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'mrmarco64',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
};

const pool = new Pool(getDatabaseConfig());

// Ensure schema migrations that are safe to run at startup
const initializeDatabase = async () => {
  try {
    // Test connection first
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    
    // add name column if it doesn't exist (safe to run repeatedly)
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;");
    console.log('✅ Ensured users.name column exists');
  } catch (err) {
    console.error('❌ Error with database:', err.message);
    console.error('💡 Please check your database connection and credentials');
  }
};

module.exports = { pool, initializeDatabase };