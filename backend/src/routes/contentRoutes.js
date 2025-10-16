const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const authMiddleware = require('../middlewares/authMiddleware');

// All content routes require authentication
router.use(authMiddleware);

// Get featured content for hero section
router.get('/featured', contentController.getFeaturedContent);

// Get all categories
router.get('/categories', contentController.getCategories);

// Get content by category
router.get('/category/:categoryName', contentController.getContentByCategory);

// Get home page data for a profile (combines multiple endpoints)
router.get('/home/:profileId', contentController.getHomeData);

// Get continue watching for profile
router.get('/continue-watching/:profileId', contentController.getContinueWatching);

// Get user's watchlist
router.get('/watchlist/:profileId', contentController.getWatchlist);

// Add to watchlist
router.post('/watchlist', contentController.addToWatchlist);

// Remove from watchlist
router.delete('/watchlist/:profileId/:contentId', contentController.removeFromWatchlist);

// Update viewing progress
router.post('/progress', contentController.updateProgress);

// NEW MOVIE ENDPOINTS - Complete movie functionality with personalization
// Get complete list of movies from TMDB with user personalization
router.get('/movies/complete/:profileId', contentController.getCompleteMoviesList);

// Get user's watched/watching movies
router.get('/movies/watched/:profileId', contentController.getUserWatchedMovies);

// Get personalized movie recommendations
router.get('/movies/recommendations/:profileId', contentController.getMovieRecommendations);

// TMDB Watchlist routes
router.post('/tmdb-watchlist/:profileId', contentController.addTmdbMovieToWatchlist);
router.delete('/tmdb-watchlist/:profileId/:movieId', contentController.removeTmdbMovieFromWatchlist);
router.get('/tmdb-watchlist/:profileId', contentController.getTmdbMoviesWatchlist);
router.get('/tmdb-watchlist/:profileId/:movieId/check', contentController.checkTmdbMovieInWatchlist);

// Search content (must be before /:contentId route)
router.get('/search', contentController.searchContent);

// Get content details
router.get('/:contentId', contentController.getContentDetails);

// Get episodes for series
router.get('/:contentId/episodes', contentController.getEpisodes);

module.exports = router;