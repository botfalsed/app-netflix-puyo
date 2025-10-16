-- Active: 1760385144533@@127.0.0.1@5432@netflixdb
-- users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email_or_phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- profiles table: each user can have up to 5 profiles
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,
  is_kids BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- content table: movies and series
CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('movie', 'series')),
  genre VARCHAR(100),
  release_year INTEGER,
  duration_minutes INTEGER, -- for movies
  seasons INTEGER, -- for series
  rating VARCHAR(10), -- PG, PG-13, R, etc.
  thumbnail_url TEXT,
  backdrop_url TEXT,
  video_url TEXT,
  trailer_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- episodes table: for series content
CREATE TABLE IF NOT EXISTS episodes (
  id SERIAL PRIMARY KEY,
  content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  video_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_id, season_number, episode_number)
);

-- user_content_progress table: track viewing progress
CREATE TABLE IF NOT EXISTS user_content_progress (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  episode_id INTEGER REFERENCES episodes(id) ON DELETE CASCADE, -- null for movies
  progress_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched TIMESTAMP DEFAULT NOW(),
  UNIQUE(profile_id, content_id, episode_id)
);

-- user_watchlist table: "Mi Lista" functionality
CREATE TABLE IF NOT EXISTS user_watchlist (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(profile_id, content_id)
);

-- content_categories table: for organizing content
CREATE TABLE IF NOT EXISTS content_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0
);

-- content_category_mapping table: many-to-many relationship
CREATE TABLE IF NOT EXISTS content_category_mapping (
  id SERIAL PRIMARY KEY,
  content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES content_categories(id) ON DELETE CASCADE,
  UNIQUE(content_id, category_id)
);

-- Insert default categories
INSERT INTO content_categories (name, display_order) VALUES
('Tendencias', 1),
('Originales de Netflix', 2),
('Acción', 3),
('Comedia', 4),
('Drama', 5),
('Terror', 6),
('Documentales', 7),
('Anime', 8),
('Infantil', 9),
('Romance', 10)
ON CONFLICT (name) DO NOTHING;

-- Create TMDB Watchlist table for storing user's movie watchlist from TMDB
CREATE TABLE IF NOT EXISTS tmdb_watchlist (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL,
  tmdb_movie_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  poster_path VARCHAR(255),
  overview TEXT,
  release_date DATE,
  vote_average DECIMAL(3,1),
  genre_ids JSONB,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(profile_id, tmdb_movie_id),
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tmdb_watchlist_profile_id ON tmdb_watchlist(profile_id);
CREATE INDEX IF NOT EXISTS idx_tmdb_watchlist_tmdb_movie_id ON tmdb_watchlist(tmdb_movie_id);
