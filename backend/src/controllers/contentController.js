const contentService = require('../services/contentService');

class ContentController {
  // Get featured content for hero section
  async getFeaturedContent(req, res) {
    try {
      const featuredContent = await contentService.getFeaturedContent();
      
      if (!featuredContent) {
        return res.status(404).json({
          success: false,
          message: 'No featured content found'
        });
      }

      res.json({
        success: true,
        data: featuredContent
      });
    } catch (error) {
      console.error('Error in getFeaturedContent:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting featured content'
      });
    }
  }

  // Get content by category
  async getContentByCategory(req, res) {
    try {
      const { categoryName } = req.params;
      const { profileId } = req.query; // Optional profile ID for personalization
      const limit = parseInt(req.query.limit) || 20;
      
      const content = await contentService.getContentByCategory(categoryName, limit, profileId ? parseInt(profileId) : null);
      
      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      console.error('Error in getContentByCategory:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting content by category'
      });
    }
  }

  // Get all categories
  async getCategories(req, res) {
    try {
      const categories = await contentService.getCategories();
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error in getCategories:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting categories'
      });
    }
  }

  // Get continue watching for profile
  async getContinueWatching(req, res) {
    try {
      const { profileId } = req.params;
      const { limit = 10 } = req.query;
      
      const content = await contentService.getContinueWatching(parseInt(profileId), parseInt(limit));
      
      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      console.error('Error in getContinueWatching:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting continue watching content'
      });
    }
  }

  // Get user's watchlist
  async getWatchlist(req, res) {
    try {
      const { profileId } = req.params;
      const { limit = 20 } = req.query;
      
      const watchlist = await contentService.getWatchlist(parseInt(profileId), parseInt(limit));
      
      res.json({
        success: true,
        data: watchlist
      });
    } catch (error) {
      console.error('Error in getWatchlist:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting watchlist'
      });
    }
  }

  // Add to watchlist
  async addToWatchlist(req, res) {
    try {
      const { profileId, contentId } = req.body;
      
      if (!profileId || !contentId) {
        return res.status(400).json({
          success: false,
          message: 'Profile ID and Content ID are required'
        });
      }

      const result = await contentService.addToWatchlist(parseInt(profileId), parseInt(contentId));
      
      res.json({
        success: true,
        message: 'Added to watchlist successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in addToWatchlist:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding to watchlist'
      });
    }
  }

  // Remove from watchlist
  async removeFromWatchlist(req, res) {
    try {
      const { profileId, contentId } = req.params;
      
      const result = await contentService.removeFromWatchlist(parseInt(profileId), parseInt(contentId));
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Content not found in watchlist'
        });
      }

      res.json({
        success: true,
        message: 'Removed from watchlist successfully'
      });
    } catch (error) {
      console.error('Error in removeFromWatchlist:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing from watchlist'
      });
    }
  }

  // Update viewing progress
  async updateProgress(req, res) {
    try {
      const { profileId, contentId, episodeId, progressSeconds, completed } = req.body;
      
      if (!profileId || !contentId || progressSeconds === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Profile ID, Content ID, and progress seconds are required'
        });
      }

      const result = await contentService.updateProgress(
        parseInt(profileId),
        parseInt(contentId),
        episodeId ? parseInt(episodeId) : null,
        parseInt(progressSeconds),
        completed || false
      );
      
      res.json({
        success: true,
        message: 'Progress updated successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in updateProgress:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating progress'
      });
    }
  }

  // Get content details
  async getContentDetails(req, res) {
    try {
      const { contentId } = req.params;
      
      // Validate that contentId is a valid number
      const parsedContentId = parseInt(contentId);
      if (isNaN(parsedContentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid content ID'
        });
      }
      
      const content = await contentService.getContentById(parsedContentId);
      
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      console.error('Error in getContentDetails:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting content details'
      });
    }
  }

  // Get episodes for series
  async getEpisodes(req, res) {
    try {
      const { contentId } = req.params;
      const { season } = req.query;
      
      const episodes = await contentService.getEpisodes(
        parseInt(contentId),
        season ? parseInt(season) : null
      );
      
      res.json({
        success: true,
        data: episodes
      });
    } catch (error) {
      console.error('Error in getEpisodes:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting episodes'
      });
    }
  }

  // Search content
  async searchContent(req, res) {
    try {
      const { q: searchTerm } = req.query;
      const { profileId } = req.query; // Optional profile ID for personalization
      const limit = parseInt(req.query.limit) || 20;
      
      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
      }
      
      const results = await contentService.searchContent(searchTerm, limit, profileId ? parseInt(profileId) : null);
      
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Error in searchContent:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching content'
      });
    }
  }

  // Get home page data (combines multiple endpoints)
  async getHomeData(req, res) {
    try {
      const { profileId } = req.params;
      
      // Get all data needed for home page
      const [
        featuredContent,
        categories,
        continueWatching,
        watchlist
      ] = await Promise.all([
        contentService.getFeaturedContent(parseInt(profileId)),
        contentService.getCategories(),
        contentService.getContinueWatching(parseInt(profileId), 10),
        contentService.getWatchlist(parseInt(profileId), 10)
      ]);

      // Get content for each category that has content
      const categoryContent = {};
      const categoriesWithContent = categories.filter(cat => parseInt(cat.content_count) > 0);
      
      for (const category of categoriesWithContent) {
        categoryContent[category.name] = await contentService.getContentByCategory(category.name, 15, parseInt(profileId));
      }

      res.json({
        success: true,
        data: {
          featured: featuredContent,
          categories: categories,
          continueWatching: continueWatching,
          watchlist: watchlist,
          categoryContent: categoryContent
        }
      });
    } catch (error) {
      console.error('Error in getHomeData:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting home data'
      });
    }
  }

  // Get complete list of movies from TMDB with user personalization
  async getCompleteMoviesList(req, res) {
    try {
      const { profileId } = req.params;
      const { page = 1, limit = 20, category = 'popular' } = req.query;
      
      const result = await contentService.getCompleteMoviesList(
        parseInt(profileId), 
        parseInt(page), 
        parseInt(limit), 
        category
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in getCompleteMoviesList:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting complete movies list'
      });
    }
  }

  // Get user's watched/watching movies
  async getUserWatchedMovies(req, res) {
    try {
      const { profileId } = req.params;
      const { limit = 50 } = req.query;
      
      const watchedMovies = await contentService.getUserWatchedMovies(parseInt(profileId), parseInt(limit));
      
      res.json({
        success: true,
        data: watchedMovies
      });
    } catch (error) {
      console.error('Error in getUserWatchedMovies:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting user watched movies'
      });
    }
  }

  // Get personalized movie recommendations
  async getMovieRecommendations(req, res) {
    try {
      const { profileId } = req.params;
      const { limit = 20 } = req.query;
      
      const recommendations = await contentService.getMovieRecommendations(parseInt(profileId), parseInt(limit));
      
      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      console.error('Error in getMovieRecommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting movie recommendations'
      });
    }
  }

  // Add TMDB movie to watchlist
  async addTmdbMovieToWatchlist(req, res) {
    try {
      const { profileId } = req.params;
      const { movieId, title, poster_path, overview, release_date, vote_average, genre_ids } = req.body;
      
      if (!profileId || !movieId) {
        return res.status(400).json({
          success: false,
          message: 'Profile ID and Movie ID are required'
        });
      }

      const result = await contentService.addTmdbMovieToWatchlist(
        parseInt(profileId), 
        parseInt(movieId),
        { title, poster_path, overview, release_date, vote_average, genre_ids }
      );
      
      res.json({
        success: true,
        message: 'Movie added to watchlist successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in addTmdbMovieToWatchlist:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding movie to watchlist'
      });
    }
  }

  // Remove TMDB movie from watchlist
  async removeTmdbMovieFromWatchlist(req, res) {
    try {
      const { profileId, movieId } = req.params;
      
      const result = await contentService.removeTmdbMovieFromWatchlist(
        parseInt(profileId), 
        parseInt(movieId)
      );
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Movie not found in watchlist'
        });
      }

      res.json({
        success: true,
        message: 'Movie removed from watchlist successfully'
      });
    } catch (error) {
      console.error('Error in removeTmdbMovieFromWatchlist:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing movie from watchlist'
      });
    }
  }

  // Get TMDB movies from watchlist
  async getTmdbMoviesWatchlist(req, res) {
    try {
      const { profileId } = req.params;
      const limit = parseInt(req.query.limit) || 50;
      
      const watchlist = await contentService.getTmdbMoviesWatchlist(parseInt(profileId), limit);
      
      res.json({
        success: true,
        watchlist: watchlist
      });
    } catch (error) {
      console.error('Error in getTmdbMoviesWatchlist:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting movies watchlist'
      });
    }
  }

  // Check if TMDB movie is in watchlist
  async checkTmdbMovieInWatchlist(req, res) {
    try {
      const { profileId, movieId } = req.params;
      
      const inWatchlist = await contentService.checkTmdbMovieInWatchlist(
        parseInt(profileId), 
        parseInt(movieId)
      );
      
      res.json({
        success: true,
        inWatchlist: inWatchlist
      });
    } catch (error) {
      console.error('Error in checkTmdbMovieInWatchlist:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking movie in watchlist'
      });
    }
  }
}

module.exports = new ContentController();