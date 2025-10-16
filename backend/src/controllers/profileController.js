const { pool } = require('../config/database');

// List profiles for authenticated user
const getProfiles = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, avatar, is_kids, created_at FROM profiles WHERE user_id = $1 ORDER BY id',
      [req.userId]
    );
    res.json({ profiles: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
};

// Create a profile (limit 5)
const createProfile = async (req, res) => {
  const { name, avatar, is_kids } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'missing_name' });
  }
  
  try {
    const countRes = await pool.query(
      'SELECT COUNT(*) as cnt FROM profiles WHERE user_id = $1',
      [req.userId]
    );
    const cnt = parseInt(countRes.rows[0].cnt, 10);
    
    if (cnt >= 5) {
      return res.status(409).json({ error: 'profiles_limit' });
    }
    
    const result = await pool.query(
      'INSERT INTO profiles(user_id, name, avatar, is_kids) VALUES($1,$2,$3,$4) RETURNING id, name, avatar, is_kids',
      [req.userId, name, avatar || null, !!is_kids]
    );
    
    res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
};

module.exports = {
  getProfiles,
  createProfile
};