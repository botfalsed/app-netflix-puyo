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