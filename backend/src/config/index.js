const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const config = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || 'devsecret',
  databaseUrl: process.env.DATABASE_URL,
  nodeEnv: process.env.NODE_ENV || 'development'
};

module.exports = config;