const { pool } = require('../config/database');

// Ensure a default profile exists for the user (creates one if count == 0)
async function ensureDefaultProfileForUser(userId, preferredName) {
  try {
    const countRes = await pool.query('SELECT COUNT(*) as cnt FROM profiles WHERE user_id = $1', [userId]);
    const cnt = parseInt(countRes.rows[0].cnt, 10);
    
    if (cnt === 0) {
      const defaultName = preferredName ? `${preferredName} (Perfil)` : 'Perfil 1';
      const insertRes = await pool.query(
        'INSERT INTO profiles(user_id, name, avatar, is_kids) VALUES($1,$2,$3,$4) RETURNING id',
        [userId, defaultName, null, false]
      );
      return insertRes.rows[0];
    }
    return null;
  } catch (err) {
    console.error('Error ensuring default profile:', err);
    return null;
  }
}

module.exports = {
  ensureDefaultProfileForUser
};