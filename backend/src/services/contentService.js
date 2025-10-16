const { pool } = require('../config/database');

class ContentService {
  // Get featured content with optional profile-based personalization
  async getFeaturedContent(profileId = null) {
    try {
      let query = `
        SELECT 
          c.*
        FROM content c
        WHERE c.is_featured = true`;
      
      const params = [];
      
      // If profileId is provided, prioritize content from user's interests
      if (profileId) {
        query = `
          SELECT 
            c.*,
            CASE 
              WHEN uw.profile_id IS NOT NULL THEN 3
              WHEN ucp.profile_id IS NOT NULL THEN 2
              ELSE 1
            END as priority_score
          FROM content c
          LEFT JOIN user_watchlist uw ON c.id = uw.content_id AND uw.profile_id = $1
          LEFT JOIN user_content_progress ucp ON c.id = ucp.content_id AND ucp.profile_id = $1
          WHERE c.is_featured = true
          ORDER BY priority_score DESC, c.created_at DESC`;
        params.push(profileId);
      } else {
        query += ` ORDER BY c.created_at DESC`;
      }
      
      query += ` LIMIT 1`;
      
      const result = await pool.query(query, params);
      
      if (result.rows.length > 0) {
        const content = result.rows[0];
        
        // Get categories separately
        const categoryQuery = `
          SELECT cc.id, cc.name
          FROM content_category_mapping ccm
          JOIN content_categories cc ON ccm.category_id = cc.id
          WHERE ccm.content_id = $1
        `;
        const categoryResult = await pool.query(categoryQuery, [content.id]);
        content.categories = categoryResult.rows;
        
        return content;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting featured content:', error);
      throw error;
    }
  }

  // Get content by category with optional profile-based filtering
  async getContentByCategory(categoryName, limit = 20, profileId = null) {
    try {
      let query = `
        SELECT 
          c.*
        FROM content c
        WHERE EXISTS (
          SELECT 1 FROM content_category_mapping ccm2
          JOIN content_categories cc2 ON ccm2.category_id = cc2.id
          WHERE ccm2.content_id = c.id AND cc2.name = $1
        )`;
      
      const params = [categoryName];
      
      // If profileId is provided, prioritize content from user's watchlist and viewing history
      if (profileId) {
        query = `
          SELECT 
            c.*,
            CASE 
              WHEN uw.profile_id IS NOT NULL THEN 3
              WHEN ucp.profile_id IS NOT NULL THEN 2
              ELSE 1
            END as priority_score
          FROM content c
          LEFT JOIN user_watchlist uw ON c.id = uw.content_id AND uw.profile_id = $2
          LEFT JOIN user_content_progress ucp ON c.id = ucp.content_id AND ucp.profile_id = $2
          WHERE EXISTS (
            SELECT 1 FROM content_category_mapping ccm2
            JOIN content_categories cc2 ON ccm2.category_id = cc2.id
            WHERE ccm2.content_id = c.id AND cc2.name = $1
          )
          ORDER BY priority_score DESC, c.created_at DESC`;
        params.push(profileId);
      } else {
        query += ` ORDER BY c.created_at DESC`;
      }
      
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
      
      const result = await pool.query(query, params);
      
      // Add categories separately for each content item
      for (let content of result.rows) {
        const categoryQuery = `
          SELECT cc.id, cc.name
          FROM content_category_mapping ccm
          JOIN content_categories cc ON ccm.category_id = cc.id
          WHERE ccm.content_id = $1
        `;
        const categoryResult = await pool.query(categoryQuery, [content.id]);
        content.categories = categoryResult.rows;
      }
      
      return result.rows;
    } catch (error) {
      console.error('Error getting content by category:', error);
      throw error;
    }
  }

  // Get all categories with content count
  async getCategories() {
    try {
      const query = `
        SELECT 
          cc.*,
          COUNT(ccm.content_id) as content_count
        FROM content_categories cc
        LEFT JOIN content_category_mapping ccm ON cc.id = ccm.category_id
        GROUP BY cc.id
        ORDER BY cc.display_order ASC
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  // Get continue watching content for a profile
  async getContinueWatching(profileId, limit = 10) {
    try {
      const query = `
        SELECT 
          c.*,
          ucp.progress_seconds,
          ucp.last_watched,
          e.title as episode_title,
          e.season_number,
          e.episode_number
        FROM user_content_progress ucp
        JOIN content c ON ucp.content_id = c.id
        LEFT JOIN episodes e ON ucp.episode_id = e.id
        WHERE ucp.profile_id = $1 
          AND ucp.progress_seconds > 0 
          AND ucp.completed = false
        ORDER BY ucp.last_watched DESC
        LIMIT $2
      `;
      
      const result = await pool.query(query, [profileId, limit]);
      
      // Add categories separately for each content item
      for (let content of result.rows) {
        const categoryQuery = `
          SELECT cc.id, cc.name
          FROM content_category_mapping ccm
          JOIN content_categories cc ON ccm.category_id = cc.id
          WHERE ccm.content_id = $1
        `;
        const categoryResult = await pool.query(categoryQuery, [content.id]);
        content.categories = categoryResult.rows;
      }
      
      return result.rows;
    } catch (error) {
      console.error('Error getting continue watching:', error);
      throw error;
    }
  }

  // Get user's watchlist (Mi Lista)
  async getWatchlist(profileId, limit = 20) {
    try {
      const query = `
        SELECT 
          c.*,
          uw.added_at
        FROM user_watchlist uw
        JOIN content c ON uw.content_id = c.id
        WHERE uw.profile_id = $1
        ORDER BY uw.added_at DESC
        LIMIT $2
      `;
      
      const result = await pool.query(query, [profileId, limit]);
      
      // Add categories separately for each content item
      for (let content of result.rows) {
        const categoryQuery = `
          SELECT cc.id, cc.name
          FROM content_category_mapping ccm
          JOIN content_categories cc ON ccm.category_id = cc.id
          WHERE ccm.content_id = $1
        `;
        const categoryResult = await pool.query(categoryQuery, [content.id]);
        content.categories = categoryResult.rows;
      }
      
      return result.rows;
    } catch (error) {
      console.error('Error getting watchlist:', error);
      throw error;
    }
  }

  // Add content to watchlist
  async addToWatchlist(profileId, contentId) {
    try {
      const query = `
        INSERT INTO user_watchlist (profile_id, content_id)
        VALUES ($1, $2)
        ON CONFLICT (profile_id, content_id) DO NOTHING
        RETURNING *
      `;
      
      const result = await pool.query(query, [profileId, contentId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  }

  // Remove content from watchlist
  async removeFromWatchlist(profileId, contentId) {
    try {
      const query = `
        DELETE FROM user_watchlist 
        WHERE profile_id = $1 AND content_id = $2
        RETURNING *
      `;
      
      const result = await pool.query(query, [profileId, contentId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  }

  // Update viewing progress
  async updateProgress(profileId, contentId, episodeId, progressSeconds, completed = false) {
    try {
      const query = `
        INSERT INTO user_content_progress (profile_id, content_id, episode_id, progress_seconds, completed, last_watched)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (profile_id, content_id, episode_id) 
        DO UPDATE SET 
          progress_seconds = $4,
          completed = $5,
          last_watched = NOW()
        RETURNING *
      `;
      
      const result = await pool.query(query, [profileId, contentId, episodeId, progressSeconds, completed]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  // Get content details by ID
  async getContentById(contentId) {
    try {
      const query = `
        SELECT 
          c.*
        FROM content c
        WHERE c.id = $1
      `;
      
      const result = await pool.query(query, [contentId]);
      
      if (result.rows.length > 0) {
        const content = result.rows[0];
        
        // Get categories separately
        const categoryQuery = `
          SELECT cc.id, cc.name
          FROM content_category_mapping ccm
          JOIN content_categories cc ON ccm.category_id = cc.id
          WHERE ccm.content_id = $1
        `;
        const categoryResult = await pool.query(categoryQuery, [content.id]);
        content.categories = categoryResult.rows;
        
        return content;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting content by ID:', error);
      throw error;
    }
  }

  // Get episodes for a series
  async getEpisodes(contentId, seasonNumber = null) {
    try {
      let query = `
        SELECT * FROM episodes 
        WHERE content_id = $1
      `;
      const params = [contentId];

      if (seasonNumber) {
        query += ` AND season_number = $2`;
        params.push(seasonNumber);
      }

      query += ` ORDER BY season_number ASC, episode_number ASC`;
      
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting episodes:', error);
      throw error;
    }
  }

  // Search content with optional profile-based personalization
  async searchContent(searchTerm, limit = 20, profileId = null) {
    try {
      let query = `
        SELECT 
          c.*
        FROM content c
        WHERE c.title ILIKE $1 OR c.description ILIKE $1`;
      
      const params = [`%${searchTerm}%`];
      
      // If profileId is provided, prioritize content from user's interests
      if (profileId) {
        query = `
          SELECT 
            c.*,
            CASE 
              WHEN uw.profile_id IS NOT NULL THEN 3
              WHEN ucp.profile_id IS NOT NULL THEN 2
              ELSE 1
            END as priority_score
          FROM content c
          LEFT JOIN user_watchlist uw ON c.id = uw.content_id AND uw.profile_id = $2
          LEFT JOIN user_content_progress ucp ON c.id = ucp.content_id AND ucp.profile_id = $2
          WHERE c.title ILIKE $1 OR c.description ILIKE $1
          ORDER BY priority_score DESC, c.title ASC`;
        params.push(profileId);
      } else {
        query += ` ORDER BY c.title ASC`;
      }
      
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
      
      const result = await pool.query(query, params);
      
      // Add categories separately for each content item
      for (let content of result.rows) {
        const categoryQuery = `
          SELECT cc.id, cc.name
          FROM content_category_mapping ccm
          JOIN content_categories cc ON ccm.category_id = cc.id
          WHERE ccm.content_id = $1
        `;
        const categoryResult = await pool.query(categoryQuery, [content.id]);
        content.categories = categoryResult.rows;
      }
      
      return result.rows;
    } catch (error) {
      console.error('Error searching content:', error);
      throw error;
    }
  }

  // Get complete list of movies from TMDB with user personalization
  async getCompleteMoviesList(profileId, page = 1, limit = 20, category = 'popular') {
    try {
      // Import TMDB service functions
      const { 
        getPopularMovies, 
        getTopRatedMovies, 
        getNowPlayingMovies, 
        getUpcomingMovies,
        getTrendingMovies 
      } = require('../../frontend/services/tmdb');

      let tmdbMovies;
      
      // Get movies from TMDB based on category
      switch (category) {
        case 'top_rated':
          tmdbMovies = await getTopRatedMovies(page);
          break;
        case 'now_playing':
          tmdbMovies = await getNowPlayingMovies(page);
          break;
        case 'upcoming':
          tmdbMovies = await getUpcomingMovies(page);
          break;
        case 'trending':
          tmdbMovies = await getTrendingMovies('week', page);
          break;
        default:
          tmdbMovies = await getPopularMovies(page);
      }

      // Get user's watched movies and watchlist for personalization
      const [watchedMovies, watchlist] = await Promise.all([
        this.getUserWatchedMovies(profileId, 1000), // Get all watched movies
        this.getWatchlist(profileId, 1000) // Get all watchlist items
      ]);

      // Create sets for quick lookup
      const watchedIds = new Set(watchedMovies.map(m => m.tmdb_id).filter(Boolean));
      const watchlistIds = new Set(watchlist.map(m => m.tmdb_id).filter(Boolean));

      // Add personalization info to each movie
      const personalizedMovies = tmdbMovies.results.map(movie => ({
        ...movie,
        isWatched: watchedIds.has(movie.id),
        isInWatchlist: watchlistIds.has(movie.id),
        personalizedScore: this.calculatePersonalizedScore(movie, watchedMovies, watchlist)
      }));

      return {
        movies: personalizedMovies,
        pagination: {
          page: tmdbMovies.page,
          total_pages: tmdbMovies.total_pages,
          total_results: tmdbMovies.total_results
        },
        userStats: {
          totalWatched: watchedMovies.length,
          totalInWatchlist: watchlist.length
        }
      };
    } catch (error) {
      console.error('Error getting complete movies list:', error);
      throw error;
    }
  }

  // Get user's watched/watching movies
  async getUserWatchedMovies(profileId, limit = 50) {
    try {
      const query = `
        SELECT 
          c.*,
          ucp.progress_seconds,
          ucp.completed,
          ucp.last_watched,
          ucp.episode_id,
          e.title as episode_title,
          e.season_number,
          e.episode_number
        FROM user_content_progress ucp
        JOIN content c ON ucp.content_id = c.id
        LEFT JOIN episodes e ON ucp.episode_id = e.id
        WHERE ucp.profile_id = $1 AND c.type = 'movie'
        ORDER BY ucp.last_watched DESC
        LIMIT $2
      `;
      
      const result = await pool.query(query, [profileId, limit]);
      
      // Add categories for each content item
      for (let content of result.rows) {
        const categoryQuery = `
          SELECT cc.id, cc.name
          FROM content_category_mapping ccm
          JOIN content_categories cc ON ccm.category_id = cc.id
          WHERE ccm.content_id = $1
        `;
        const categoryResult = await pool.query(categoryQuery, [content.id]);
        content.categories = categoryResult.rows;
      }
      
      return result.rows;
    } catch (error) {
      console.error('Error getting user watched movies:', error);
      throw error;
    }
  }

  // Get personalized movie recommendations based on user history
  async getMovieRecommendations(profileId, limit = 20) {
    try {
      // Get user's viewing history to analyze preferences
      const historyQuery = `
        SELECT 
          c.genre,
          COUNT(*) as watch_count,
          AVG(CASE WHEN ucp.completed THEN 1 ELSE 0 END) as completion_rate
        FROM user_content_progress ucp
        JOIN content c ON ucp.content_id = c.id
        WHERE ucp.profile_id = $1 AND c.type = 'movie'
        GROUP BY c.genre
        ORDER BY watch_count DESC, completion_rate DESC
        LIMIT 5
      `;
      
      const historyResult = await pool.query(historyQuery, [profileId]);
      const preferredGenres = historyResult.rows.map(row => row.genre);

      if (preferredGenres.length === 0) {
        // If no history, return popular movies
        const { getPopularMovies } = require('../../frontend/services/tmdb');
        const popularMovies = await getPopularMovies(1);
        return {
          movies: popularMovies.results.slice(0, limit),
          recommendationReason: 'Popular movies (no viewing history)',
          basedOnGenres: []
        };
      }

      // Get movies from TMDB based on preferred genres
      const { discoverMovies } = require('../../frontend/services/tmdb');
      const { getMovieGenres } = require('../../frontend/services/tmdb');
      
      const genresResponse = await getMovieGenres();
      const tmdbGenres = genresResponse.genres;
      
      // Map our genre names to TMDB genre IDs
      const genreIds = [];
      for (const preferredGenre of preferredGenres) {
        const tmdbGenre = tmdbGenres.find(g => 
          g.name.toLowerCase().includes(preferredGenre.toLowerCase()) ||
          preferredGenre.toLowerCase().includes(g.name.toLowerCase())
        );
        if (tmdbGenre) {
          genreIds.push(tmdbGenre.id);
        }
      }

      let recommendedMovies;
      if (genreIds.length > 0) {
        recommendedMovies = await discoverMovies({
          with_genres: genreIds.join(','),
          sort_by: 'vote_average.desc',
          'vote_count.gte': 100
        });
      } else {
        // Fallback to popular movies
        const { getPopularMovies } = require('../../frontend/services/tmdb');
        recommendedMovies = await getPopularMovies(1);
      }

      // Get user's watched movies to avoid recommending already seen content
      const watchedMovies = await this.getUserWatchedMovies(profileId, 1000);
      const watchedTmdbIds = new Set(watchedMovies.map(m => m.tmdb_id).filter(Boolean));

      // Filter out already watched movies
      const filteredRecommendations = recommendedMovies.results.filter(
        movie => !watchedTmdbIds.has(movie.id)
      ).slice(0, limit);

      return {
        movies: filteredRecommendations,
        recommendationReason: `Based on your viewing history in ${preferredGenres.join(', ')}`,
        basedOnGenres: preferredGenres
      };
    } catch (error) {
      console.error('Error getting movie recommendations:', error);
      throw error;
    }
  }

  // Helper method to calculate personalized score for movies
  calculatePersonalizedScore(movie, watchedMovies, watchlist) {
    let score = movie.vote_average || 0;
    
    // Boost score if movie is in similar genres to watched content
    const watchedGenres = new Set();
    watchedMovies.forEach(watched => {
      if (watched.genre) {
        watchedGenres.add(watched.genre.toLowerCase());
      }
    });

    // Check if movie genres match user preferences
    if (movie.genre_ids && movie.genre_ids.length > 0) {
      // This would need genre mapping from TMDB IDs to names
      // For now, we'll use a simple popularity boost
      score += movie.popularity * 0.01;
    }

    return Math.round(score * 10) / 10;
  }

  // Add TMDB movie to watchlist
  async addTmdbMovieToWatchlist(profileId, movieId, movieData) {
    try {
      // Check if movie is already in watchlist
      const existingQuery = `
        SELECT id FROM tmdb_watchlist 
        WHERE profile_id = $1 AND tmdb_movie_id = $2
      `;
      const existing = await pool.query(existingQuery, [profileId, movieId]);
      
      if (existing.rows.length > 0) {
        throw new Error('Movie already in watchlist');
      }

      // Insert movie into watchlist
      const insertQuery = `
        INSERT INTO tmdb_watchlist (
          profile_id, tmdb_movie_id, title, poster_path, 
          overview, release_date, vote_average, genre_ids, 
          added_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING *
      `;
      
      const result = await pool.query(insertQuery, [
        profileId,
        movieId,
        movieData.title,
        movieData.poster_path,
        movieData.overview,
        movieData.release_date,
        movieData.vote_average,
        JSON.stringify(movieData.genre_ids || [])
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error adding TMDB movie to watchlist:', error);
      throw error;
    }
  }

  // Remove TMDB movie from watchlist
  async removeTmdbMovieFromWatchlist(profileId, movieId) {
    try {
      const deleteQuery = `
        DELETE FROM tmdb_watchlist 
        WHERE profile_id = $1 AND tmdb_movie_id = $2
        RETURNING *
      `;
      
      const result = await pool.query(deleteQuery, [profileId, movieId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error removing TMDB movie from watchlist:', error);
      throw error;
    }
  }

  // Get TMDB movies from watchlist
  async getTmdbMoviesWatchlist(profileId, limit = 50) {
    try {
      const query = `
        SELECT 
          tmdb_movie_id as id,
          title,
          poster_path,
          overview,
          release_date,
          vote_average,
          genre_ids,
          added_at
        FROM tmdb_watchlist 
        WHERE profile_id = $1
        ORDER BY added_at DESC
        LIMIT $2
      `;
      
      const result = await pool.query(query, [profileId, limit]);
      
      // Parse genre_ids JSON safely
      return result.rows.map(movie => {
        let genreIds = [];
        try {
          if (movie.genre_ids && typeof movie.genre_ids === 'string') {
            genreIds = JSON.parse(movie.genre_ids);
          } else if (Array.isArray(movie.genre_ids)) {
            genreIds = movie.genre_ids;
          }
        } catch (e) {
          console.warn('Error parsing genre_ids for movie:', movie.id, e);
          genreIds = [];
        }
        
        return {
          ...movie,
          genre_ids: genreIds
        };
      });
    } catch (error) {
      console.error('Error getting TMDB movies watchlist:', error);
      throw error;
    }
  }

  // Check if TMDB movie is in watchlist
  async checkTmdbMovieInWatchlist(profileId, movieId) {
    try {
      const query = `
        SELECT id FROM tmdb_watchlist 
        WHERE profile_id = $1 AND tmdb_movie_id = $2
      `;
      
      const result = await pool.query(query, [profileId, movieId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking TMDB movie in watchlist:', error);
      throw error;
    }
  }
}

module.exports = new ContentService();