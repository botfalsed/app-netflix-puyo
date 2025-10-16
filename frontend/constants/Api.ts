// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.18.20:4000',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  TMDB_API_KEY: process.env.EXPO_PUBLIC_TMDB_API_KEY || '9cf9aba2bca13c2fdfa92c44bd160840',
  TIMEOUT: 10000,
};

// Export BASE_URL for backward compatibility
export const API_BASE_URL = API_CONFIG.BASE_URL;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: '/api/register',
  LOGIN: '/api/login',
  
  // Profile endpoints
  PROFILES: '/api/profiles',
  
  // TMDB Movie endpoints
  TMDB_POPULAR: '/movie/popular',
  TMDB_TOP_RATED: '/movie/top_rated',
  TMDB_NOW_PLAYING: '/movie/now_playing',
  TMDB_UPCOMING: '/movie/upcoming',
  TMDB_MOVIE_DETAILS: (id: number) => `/movie/${id}`,
  TMDB_MOVIE_CREDITS: (id: number) => `/movie/${id}/credits`,
  TMDB_MOVIE_VIDEOS: (id: number) => `/movie/${id}/videos`,
  TMDB_MOVIE_SIMILAR: (id: number) => `/movie/${id}/similar`,
  TMDB_MOVIE_RECOMMENDATIONS: (id: number) => `/movie/${id}/recommendations`,
  
  // TMDB TV endpoints
  TMDB_TV_POPULAR: '/tv/popular',
  TMDB_TV_TOP_RATED: '/tv/top_rated',
  TMDB_TV_ON_THE_AIR: '/tv/on_the_air',
  TMDB_TV_AIRING_TODAY: '/tv/airing_today',
  TMDB_TV_DETAILS: (id: number) => `/tv/${id}`,
  TMDB_TV_CREDITS: (id: number) => `/tv/${id}/credits`,
  TMDB_TV_VIDEOS: (id: number) => `/tv/${id}/videos`,
  TMDB_TV_SIMILAR: (id: number) => `/tv/${id}/similar`,
  TMDB_TV_RECOMMENDATIONS: (id: number) => `/tv/${id}/recommendations`,
  
  // TMDB Search endpoints
  TMDB_SEARCH_MOVIE: '/search/movie',
  TMDB_SEARCH_TV: '/search/tv',
  TMDB_SEARCH_MULTI: '/search/multi',
  
  // TMDB Trending endpoints
  TMDB_TRENDING_ALL: (timeWindow: 'day' | 'week' = 'week') => `/trending/all/${timeWindow}`,
  TMDB_TRENDING_MOVIE: (timeWindow: 'day' | 'week' = 'week') => `/trending/movie/${timeWindow}`,
  TMDB_TRENDING_TV: (timeWindow: 'day' | 'week' = 'week') => `/trending/tv/${timeWindow}`,
  
  // TMDB Discover endpoints
  TMDB_DISCOVER_MOVIE: '/discover/movie',
  TMDB_DISCOVER_TV: '/discover/tv',
  
  // TMDB Genres
  TMDB_MOVIE_GENRES: '/genre/movie/list',
  TMDB_TV_GENRES: '/genre/tv/list',
};

// Image sizes for TMDB
export const IMAGE_SIZES = {
  POSTER: {
    W92: 'w92',
    W154: 'w154',
    W185: 'w185',
    W342: 'w342',
    W500: 'w500',
    W780: 'w780',
    ORIGINAL: 'original',
  },
  BACKDROP: {
    W300: 'w300',
    W780: 'w780',
    W1280: 'w1280',
    ORIGINAL: 'original',
  },
};

// Helper functions
export const getImageUrl = (path: string, size: string = IMAGE_SIZES.POSTER.W500) => {
  if (!path) return null;
  return `${API_CONFIG.TMDB_IMAGE_BASE_URL}/${size}${path}`;
};