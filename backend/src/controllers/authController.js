const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const config = require('../config');
const { ensureDefaultProfileForUser } = require('../services/profileService');

// Register new user
const register = async (req, res) => {
  const { name, emailOrPhone, password } = req.body;
  
  if (!emailOrPhone || !password) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users(name, email_or_phone, password_hash) VALUES($1,$2,$3) RETURNING id, name, email_or_phone',
      [name || null, emailOrPhone, hashed]
    );
    
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: '7d' });
    
    // ensure default profile
    await ensureDefaultProfileForUser(user.id, user.name);
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        emailOrPhone: user.email_or_phone
      },
      token
    });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'already_exists' });
    }
    res.status(500).json({ error: 'server_error' });
  }
};

// Login user
const login = async (req, res) => {
  const { emailOrPhone, password } = req.body;
  
  if (!emailOrPhone || !password) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  
  try {
    const result = await pool.query(
      'SELECT id, name, email_or_phone, password_hash FROM users WHERE email_or_phone = $1',
      [emailOrPhone]
    );
    
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    
    const token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: '7d' });
    
    // ensure default profile exists on login
    await ensureDefaultProfileForUser(user.id, user.name);
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        emailOrPhone: user.email_or_phone
      },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
};

module.exports = {
  register,
  login
};