import { getToken } from './token';
import { tmdbContentService } from './tmdbContent';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export interface Content {
  id: number;
  title: string;
  description: string;
  type: 'movie' | 'series';
  genre: string;
  release_year: number;
  duration_minutes?: number;
  seasons?: number;
  rating: string;
  thumbnail_url: string;
  backdrop_url: string;
  video_url: string;
  trailer_url: string;
  is_featured: boolean;
  categories: Array<{
    id: number;
    name: string;
  }>;
  created_at: string;
}

export interface Episode {
  id: number;
  content_id: number;
  season_number: number;
  episode_number: number;
  title: string;
  description: string;
  duration_minutes: number;
  video_url: string;
  thumbnail_url: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  display_order: number;
  content_count: number;
}

export interface ContinueWatchingItem extends Content {
  progress_seconds: number;
  last_watched: string;
  episode_title?: string;
  season_number?: number;
  episode_number?: number;
}

export interface WatchlistItem extends Content {
  added_at: string;
}

// NEW INTERFACES FOR PERSONALIZED MOVIE FUNCTIONALITY
export interface PersonalizedMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
  original_title: string;
  video: boolean;
  // Personalization fields
  isWatched: boolean;
  isInWatchlist: boolean;
  personalizedScore: number;
}

export interface CompleteMoviesResponse {
  movies: PersonalizedMovie[];
  pagination: {
    page: number;
    total_pages: number;
    total_results: number;
  };
  userStats: {
    totalWatched: number;
    totalInWatchlist: number;
  };
}

export interface WatchedMovie extends Content {
  progress_seconds: number;
  completed: boolean;
  last_watched: string;
  episode_id?: number;
  episode_title?: string;
  season_number?: number;
  episode_number?: number;
}

export interface MovieRecommendationsResponse {
  movies: PersonalizedMovie[];
  recommendationReason: string;
  basedOnGenres: string[];
}

export interface HomeData {
  featured: Content | null;
  categories: Category[];
  continueWatching: ContinueWatchingItem[];
  watchlist: WatchlistItem[];
  categoryContent: Record<string, Content[]>;
}

class ContentService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = await getToken();
    console.log('Making request to:', `${API_BASE_URL}${endpoint}`);
    console.log('Using token:', token ? 'Token present' : 'No token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const jsonResponse = await response.json();
    console.log('Response data:', jsonResponse);
    return jsonResponse;
  }

  // Get featured content for hero section
  async getFeaturedContent(): Promise<Content | null> {
    try {
      const response = await this.makeRequest('/api/content/featured');
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error getting featured content:', error);
      return null;
    }
  }

  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.makeRequest('/api/content/categories');
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  // Get content by category
  async getContentByCategory(categoryName: string, limit: number = 20): Promise<Content[]> {
    try {
      const response = await this.makeRequest(`/api/content/category/${encodeURIComponent(categoryName)}?limit=${limit}`);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Error getting content by category:', error);
      return [];
    }
  }

  // Get home page data for a profile
  async getHomeData(profileId: number): Promise<HomeData | null> {
    try {
      const response = await this.makeRequest(`/api/content/home/${profileId}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error getting home data:', error);
      return null;
    }
  }

  // Get continue watching for profile
  async getContinueWatching(profileId: number, limit: number = 10): Promise<ContinueWatchingItem[]> {
    try {
      const response = await this.makeRequest(`/api/content/continue-watching/${profileId}?limit=${limit}`);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Error getting continue watching:', error);
      return [];
    }
  }

  // Get user's watchlist
  async getWatchlist(profileId: number, limit: number = 20): Promise<WatchlistItem[]> {
    try {
      const response = await this.makeRequest(`/api/content/watchlist/${profileId}?limit=${limit}`);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Error getting watchlist:', error);
      return [];
    }
  }

  // Add to watchlist
  async addToWatchlist(profileId: number, contentId: number): Promise<boolean> {
    try {
      const response = await this.makeRequest('/api/content/watchlist', {
        method: 'POST',
        body: JSON.stringify({ profileId, contentId }),
      });
      return response.success;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }
  }

  // Remove from watchlist
  async removeFromWatchlist(profileId: number, contentId: number): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/api/content/watchlist/${profileId}/${contentId}`, {
        method: 'DELETE',
      });
      return response.success;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }
  }

  // Update viewing progress
  async updateProgress(
    profileId: number,
    contentId: number,
    progressSeconds: number,
    episodeId?: number,
    completed: boolean = false
  ): Promise<boolean> {
    try {
      const response = await this.makeRequest('/api/content/progress', {
        method: 'POST',
        body: JSON.stringify({
          profileId,
          contentId,
          episodeId,
          progressSeconds,
          completed,
        }),
      });
      return response.success;
    } catch (error) {
      console.error('Error updating progress:', error);
      return false;
    }
  }

  // Get content details
  async getContentDetails(contentId: number): Promise<Content | null> {
    try {
      const response = await this.makeRequest(`/api/content/${contentId}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error getting content details:', error);
      return null;
    }
  }

  // Get content by ID (alias for getContentDetails for backward compatibility)
  async getContentById(contentId: number, profileId?: number): Promise<Content | null> {
    try {
      const response = await this.makeRequest(`/api/content/${contentId}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error getting content by ID:', error);
      return null;
    }
  }

  // Get episodes for series
  async getEpisodes(contentId: number, season?: number): Promise<Episode[]> {
    try {
      const seasonParam = season ? `?season=${season}` : '';
      const response = await this.makeRequest(`/api/content/${contentId}/episodes${seasonParam}`);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Error getting episodes:', error);
      return [];
    }
  }

  // Search content
  async searchContent(query: string, profileId?: number): Promise<Content[]> {
    const term = query.trim();
    if (term.length < 3) return [];

    // 1) Intentar con el backend (si está disponible)
    try {
      const params = new URLSearchParams({ q: term, limit: '20' });
      if (profileId) params.append('profileId', profileId.toString());
      const response = await this.makeRequest(`/api/content/search?${params}`);
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (error) {
      console.error('Error searching content from server:', error);
    }

    // 2) Fallback local (BaseDatosRaw mapeado por tmdbContentService)
    try {
      const localResults = await tmdbContentService.searchContent(term, 50);
      return localResults.slice(0, 20);
    } catch (error) {
      console.error('Error searching local content:', error);
      return [];
    }
  }

  // NEW METHODS FOR PERSONALIZED MOVIE FUNCTIONALITY
  
  /**
   * Get complete list of movies from TMDB with user personalization
   */
  async getCompleteMoviesList(
    profileId: number, 
    page: number = 1, 
    category: string = 'popular'
  ): Promise<CompleteMoviesResponse> {
    try {
      const token = await getToken();
      const response = await fetch(
        `${API_BASE_URL}/api/content/movies/complete/${profileId}?page=${page}&category=${category}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? result.data : { movies: [], pagination: { page: 1, total_pages: 0, total_results: 0 }, userStats: { totalWatched: 0, totalInWatchlist: 0 } };
    } catch (error) {
      console.error('Error fetching complete movies list:', error);
      throw error;
    }
  }

  /**
   * Get user's watched/watching movies
   */
  async getUserWatchedMovies(profileId: number, limit: number = 50): Promise<WatchedMovie[]> {
    try {
      const token = await getToken();
      const response = await fetch(
        `${API_BASE_URL}/api/content/movies/watched/${profileId}?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error fetching watched movies:', error);
      throw error;
    }
  }

  /**
   * Get personalized movie recommendations
   */
  async getMovieRecommendations(profileId: number, limit: number = 20): Promise<MovieRecommendationsResponse> {
    try {
      const token = await getToken();
      const response = await fetch(
        `${API_BASE_URL}/api/content/movies/recommendations/${profileId}?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? result.data : { movies: [], recommendationReason: '', basedOnGenres: [] };
    } catch (error) {
      console.error('Error fetching movie recommendations:', error);
      throw error;
    }
  }

  /**
   * Get user's watchlist movies (filtered for movies only)
   */
  async getUserWatchlistMovies(profileId: number, limit: number = 50): Promise<WatchlistItem[]> {
    try {
      // Get TMDB watchlist movies instead of local content watchlist
      const tmdbWatchlist = await fetch(`${API_BASE_URL}/api/content/tmdb-watchlist/${profileId}`, {
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`,
          'Content-Type': 'application/json',
        },
      });

      if (!tmdbWatchlist.ok) {
        throw new Error('Error obteniendo watchlist de TMDB');
      }

      const tmdbData = await tmdbWatchlist.json();
      return tmdbData.watchlist || [];
    } catch (error) {
      console.error('Error fetching TMDB watchlist movies:', error);
      // Fallback to local watchlist if TMDB fails
      try {
        const watchlist = await this.getWatchlist(profileId, limit);
        return watchlist.filter(item => item.type === 'movie');
      } catch (fallbackError) {
        console.error('Error fetching fallback watchlist:', fallbackError);
        return [];
      }
    }
  }
}

export const contentService = new ContentService();