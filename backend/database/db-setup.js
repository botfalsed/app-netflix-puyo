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

function replaceDatabase(url, db) {
  try {
    const u = new URL(url);
    u.pathname = '/' + db;
    return u.toString();
  } catch (err) {
    // fallback naive replace
    return url.replace(/\/[^/]*$/, '/' + db);
  }
}

async function main() {
  const adminConn = replaceDatabase(raw, 'postgres');
  const targetDb = (new URL(raw)).pathname.replace(/^\//, '') || 'netflixdb';

  console.log('Admin connection string:', adminConn.replace(/:\d+@/, ':***@'));
  console.log('Target database:', targetDb);

  const adminClient = new Client({ connectionString: adminConn });
  try {
    await adminClient.connect();
  } catch (err) {
    console.error('Failed to connect to Postgres with admin connection:', err.message);
    process.exit(1);
  }

  try {
    const check = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDb]);
    if (check.rowCount === 0) {
      console.log(`Database ${targetDb} does not exist. Creating...`);
      await adminClient.query(`CREATE DATABASE ${targetDb}`);
      console.log('Database created.');
    } else {
      console.log(`Database ${targetDb} already exists.`);
    }
  } catch (err) {
    console.error('Error checking/creating database:', err.message);
    await adminClient.end();
    process.exit(1);
  }

  await adminClient.end();

  // Apply schema
  const targetConn = replaceDatabase(raw, targetDb);
  const client = new Client({ connectionString: targetConn });
  try {
    await client.connect();
  } catch (err) {
    console.error('Failed to connect to target database:', err.message);
    process.exit(1);
  }

  const schemaPath = path.join(__dirname, 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error('schema.sql not found at', schemaPath);
    await client.end();
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, 'utf8');
  // split statements safely by semicolon (naive but works for simple schema)
  const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
  try {
    for (const stmt of statements) {
      console.log('Executing statement:', stmt.split('\n')[0].slice(0, 120));
      await client.query(stmt);
    }
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Error applying schema:', err.message, err.stack);
    await client.end();
    process.exit(1);
  }

  // show tables
  try {
    const res = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    console.log('Tables in public schema:');
    console.table(res.rows.map(r => r.tablename));
  } catch (err) {
    console.error('Error listing tables:', err.message);
  }

  await client.end();
  process.exit(0);
}

main();
