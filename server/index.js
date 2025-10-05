const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Ensure schema migrations that are safe to run at startup
(async () => {
  try {
    // add name column if it doesn't exist (safe to run repeatedly)
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;");
    console.log('Ensured users.name column exists');
  } catch (err) {
    console.error('Error ensuring schema:', err);
  }
})();

// Simple health
app.get('/health', (req, res) => res.json({ ok: true }));

// Register
app.post('/api/register', async (req, res) => {
  const { name, emailOrPhone, password } = req.body;
  if (!emailOrPhone || !password) return res.status(400).json({ error: 'missing_fields' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query('INSERT INTO users(name, email_or_phone, password_hash) VALUES($1,$2,$3) RETURNING id, name, email_or_phone', [name || null, emailOrPhone, hashed]);
    const user = result.rows[0];
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
  // ensure default profile
  await ensureDefaultProfileForUser(user.id, user.name);
  res.json({ user: { id: user.id, name: user.name, emailOrPhone: user.email_or_phone }, token });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(409).json({ error: 'already_exists' });
    res.status(500).json({ error: 'server_error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { emailOrPhone, password } = req.body;
  if (!emailOrPhone || !password) return res.status(400).json({ error: 'missing_fields' });
  try {
    const result = await pool.query('SELECT id, name, email_or_phone, password_hash FROM users WHERE email_or_phone = $1', [emailOrPhone]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
  // ensure default profile exists on login
  await ensureDefaultProfileForUser(user.id, user.name);
  res.json({ user: { id: user.id, name: user.name, emailOrPhone: user.email_or_phone }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Server listening on', port));

// Simple auth middleware: reads Authorization: Bearer <token>
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing_token' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'invalid_token' });
  try {
    const payload = jwt.verify(parts[1], process.env.JWT_SECRET || 'devsecret');
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

// Ensure a default profile exists for the user (creates one if count == 0)
async function ensureDefaultProfileForUser(userId, preferredName) {
  try {
    const countRes = await pool.query('SELECT COUNT(*) as cnt FROM profiles WHERE user_id = $1', [userId]);
    const cnt = parseInt(countRes.rows[0].cnt, 10);
    if (cnt === 0) {
      const defaultName = preferredName ? `${preferredName} (Perfil)` : 'Perfil 1';
      const insertRes = await pool.query('INSERT INTO profiles(user_id, name, avatar, is_kids) VALUES($1,$2,$3,$4) RETURNING id', [userId, defaultName, null, false]);
      return insertRes.rows[0];
    }
    return null;
  } catch (err) {
    console.error('Error ensuring default profile:', err);
    return null;
  }
}

// List profiles for authenticated user
app.get('/api/profiles', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, avatar, is_kids, created_at FROM profiles WHERE user_id = $1 ORDER BY id', [req.userId]);
    res.json({ profiles: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Create a profile (limit 5)
app.post('/api/profiles', authMiddleware, async (req, res) => {
  const { name, avatar, is_kids } = req.body;
  if (!name) return res.status(400).json({ error: 'missing_name' });
  try {
    const countRes = await pool.query('SELECT COUNT(*) as cnt FROM profiles WHERE user_id = $1', [req.userId]);
    const cnt = parseInt(countRes.rows[0].cnt, 10);
    if (cnt >= 5) return res.status(409).json({ error: 'profiles_limit' });
    const result = await pool.query('INSERT INTO profiles(user_id, name, avatar, is_kids) VALUES($1,$2,$3,$4) RETURNING id, name, avatar, is_kids', [req.userId, name, avatar || null, !!is_kids]);
    res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});
