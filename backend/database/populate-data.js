const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const raw = process.env.DATABASE_URL;
if (!raw) {
  console.error('DATABASE_URL not set in .env');
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString: raw });
  
  try {
    await client.connect();
    console.log('Connected to database successfully.');
    
    // Check if data already exists
    const contentCheck = await client.query('SELECT COUNT(*) FROM content');
    const contentCount = parseInt(contentCheck.rows[0].count);
    
    if (contentCount > 0) {
      console.log(`Database already has ${contentCount} content items. Skipping data population.`);
      await client.end();
      return;
    }
    
    // Read and execute sample data
    const sampleDataPath = path.join(__dirname, 'sample_data.sql');
    if (!fs.existsSync(sampleDataPath)) {
      console.error('sample_data.sql not found at', sampleDataPath);
      await client.end();
      process.exit(1);
    }
    
    const sql = fs.readFileSync(sampleDataPath, 'utf8');
    
    // Remove comments and split by semicolon
    const cleanSql = sql.replace(/--.*$/gm, '').trim();
    const statements = cleanSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    console.log(`Executing ${statements.length} statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      
      try {
        console.log(`[${i+1}/${statements.length}] Executing: ${stmt.split('\n')[0].slice(0, 60)}...`);
        await client.query(stmt);
      } catch (err) {
        console.error(`Error executing statement ${i+1}:`, err.message);
        console.error('Statement:', stmt.slice(0, 300));
        // Continue with other statements
      }
    }
    
    // Verify data was inserted
    const finalCount = await client.query('SELECT COUNT(*) FROM content');
    const episodeCount = await client.query('SELECT COUNT(*) FROM episodes');
    const categoryCount = await client.query('SELECT COUNT(*) FROM content_categories');
    
    console.log('\nData population completed successfully!');
    console.log(`- Content items: ${finalCount.rows[0].count}`);
    console.log(`- Episodes: ${episodeCount.rows[0].count}`);
    console.log(`- Categories: ${categoryCount.rows[0].count}`);
    
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();