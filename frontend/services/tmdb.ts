import { API_CONFIG, API_ENDPOINTS, getImageUrl, IMAGE_SIZES } from '../constants/Api';
import { 
  Movie, 
  TVShow, 
  MovieDetails, 
  TVShowDetails, 
  Credits, 
  VideosResponse, 
  Genre,
  MovieResponse 
} from '../types';

// Base fetch function for TMDB API
async function fetchTMDB(endpoint: string, params: Record<string, string | number> = {}) {
  const url = new URL(`${API_CONFIG.TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', API_CONFIG.TMDB_API_KEY);
  url.searchParams.set('language', 'es-ES'); // Spanish language for better localization
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Helper function to process movie data
function processMovieData(movie: any): Movie {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    poster_path: movie.poster_path ? getImageUrl(movie.poster_path, IMAGE_SIZES.POSTER.W500) || '' : '',
    backdrop_path: movie.backdrop_path ? getImageUrl(movie.backdrop_path, IMAGE_SIZES.BACKDROP.W1280) || '' : '',
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    genre_ids: movie.genre_ids || [],
    adult: movie.adult,
    original_language: movie.original_language,
    original_title: movie.original_title,
    popularity: movie.popularity,
    video: movie.video
  };
}

// Helper function to process TV show data
function processTVShowData(tvShow: any): TVShow {
  return {
    id: tvShow.id,
    name: tvShow.name,
    overview: tvShow.overview,
    poster_path: tvShow.poster_path ? getImageUrl(tvShow.poster_path, IMAGE_SIZES.POSTER.W500) || '' : '',
    backdrop_path: tvShow.backdrop_path ? getImageUrl(tvShow.backdrop_path, IMAGE_SIZES.BACKDROP.W1280) || '' : '',
    first_air_date: tvShow.first_air_date,
    vote_average: tvShow.vote_average,
    vote_count: tvShow.vote_count,
    genre_ids: tvShow.genre_ids || [],
    adult: tvShow.adult,
    original_language: tvShow.original_language,
    original_name: tvShow.original_name,
    popularity: tvShow.popularity,
    origin_country: tvShow.origin_country || []
  };
}

// MOVIE FUNCTIONS

export async function getPopularMovies(page: number = 1): Promise<MovieResponse> {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_POPULAR, { page });
  return {
    page: data.page,
    results: data.results.map(processMovieData),
    total_pages: data.total_pages,
    total_results: data.total_results
  };
}

export async function getTopRatedMovies(page: number = 1): Promise<MovieResponse> {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_TOP_RATED, { page });
  return {
    page: data.page,
    results: data.results.map(processMovieData),
    total_pages: data.total_pages,
    total_results: data.total_results
  };
}

export async function getNowPlayingMovies(page: number = 1): Promise<MovieResponse> {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_NOW_PLAYING, { page });
  return {
    page: data.page,
    results: data.results.map(processMovieData),
    total_pages: data.total_pages,
    total_results: data.total_results
  };
}

export async function getUpcomingMovies(page: number = 1): Promise<MovieResponse> {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_UPCOMING, { page });
  return {
    page: data.page,
    results: data.results.map(processMovieData),
    total_pages: data.total_pages,
    total_results: data.total_results
  };
}

export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'week', page: number = 1): Promise<MovieResponse> {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_TRENDING_MOVIE(timeWindow), { page });
  return {
    page: data.page,
    results: data.results.map(processMovieData),
    total_pages: data.total_pages,
    total_results: data.total_results
  };
}

export async function getMovieDetails(movieId: number): Promise<MovieDetails> {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_MOVIE_DETAILS(movieId));
  return {
    ...processMovieData(data),
    belongs_to_collection: data.belongs_to_collection,
    budget: data.budget,
    genres: data.genres,
    homepage: data.homepage,
    imdb_id: data.imdb_id,
    production_companies: data.production_companies,
    production_countries: data.production_countries,
    revenue: data.revenue,
    runtime: data.runtime,
    spoken_languages: data.spoken_languages,
    status: data.status,
    tagline: data.tagline
  };
}

export async function getMovieCredits(movieId: number): Promise<Credits> {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_MOVIE_CREDITS(movieId));
  return {
    id: data.id,
    cast: data.cast.map((member: any) => ({
      ...member,
      profile_path: member.profile_path ? getImageUrl(member.profile_path, IMAGE_SIZES.POSTER.W185) : null
    })),
    crew: data.crew.map((member: any) => ({
      ...member,
      profile_path: member.profile_path ? getImageUrl(member.profile_path, IMAGE_SIZES.POSTER.W185) : null
    }))
  };
}

export async function getMovieVideos(movieId: number): Promise<VideosResponse> {
  return await fetchTMDB(API_ENDPOINTS.TMDB_MOVIE_VIDEOS(movieId));
}

export async function getSimilarMovies(movieId: number, page: number = 1): Promise<MovieResponse> {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_MOVIE_SIMILAR(movieId), { page });
  return {
    page: data.page,
    results: data.results.map(processMovieData),
    total_pages: data.total_pages,
    total_results: data.total_results
  };
}

export async function getMovieRecommendations(movieId: number, page: number = 1): Promise<MovieResponse> {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_MOVIE_RECOMMENDATIONS(movieId), { page });
  return {
    page: data.page,
    results: data.results.map(processMovieData),
    total_pages: data.total_pages,
    total_results: data.total_results
  };
}

// TV SHOW FUNCTIONS

export async function getPopularTVShows(page: number = 1) {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_TV_POPULAR, { page });
  return {
    page: data.page,
    results: data.results.map(processTVShowData),
    total_pages: data.total_pages,
    total_results: data.total_results
  };
}

export async function getTopRatedTVShows(page: number = 1) {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_TV_TOP_RATED, { page });
  return {
    page: data.page,
    results: data.results.map(processTVShowData),
    total_pages: data.total_pages,
    total_results: data.total_results
  };
}

export async function getTVShowsOnTheAir(page: number = 1) {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_TV_ON_THE_AIR, { page });
  return {
    page: data.page,
    results: data.results.map(processTVShowData),
    total_pages: data.total_pages,
    total_results: data.total_results
  };
}

export async function getTVShowsAiringToday(page: number = 1) {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_TV_AIRING_TODAY, { page });
  return {
    page: data.page,
    results: data.results.map(processTVShowData),
    total_pages: data.total_pages,
    total_results: data.total_results
  };
}

export async function getTrendingTVShows(timeWindow: 'day' | 'week' = 'week', page: number = 1) {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_TRENDING_TV(timeWindow), { page });
  return {
    page: data.page,
    results: data.results.map(processTVShowData),
    total_pages: data.total_pages,
    total_results: data.total_results
  };
}

export async function getTVShowDetails(tvId: number): Promise<TVShowDetails> {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_TV_DETAILS(tvId));
  return {
    ...processTVShowData(data),
    created_by: data.created_by.map((creator: any) => ({
      ...creator,
      profile_path: creator.profile_path ? getImageUrl(creator.profile_path, IMAGE_SIZES.POSTER.W185) : null
    })),
    episode_run_time: data.episode_run_time,
    genres: data.genres,
    homepage: data.homepage,
    in_production: data.in_production,
    languages: data.languages,
    last_air_date: data.last_air_date,
    last_episode_to_air: data.last_episode_to_air,
    next_episode_to_air: data.next_episode_to_air,
    networks: data.networks,
    number_of_episodes: data.number_of_episodes,
    number_of_seasons: data.number_of_seasons,
    production_companies: data.production_companies,
    production_countries: data.production_countries,
    seasons: data.seasons.map((season: any) => ({
      ...season,
      poster_path: season.poster_path ? getImageUrl(season.poster_path, IMAGE_SIZES.POSTER.W342) : null
    })),
    spoken_languages: data.spoken_languages,
    status: data.status,
    tagline: data.tagline,
    type: data.type
  };
}

export async function getTVShowCredits(tvId: number): Promise<Credits> {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_TV_CREDITS(tvId));
  return {
    id: data.id,
    cast: data.cast.map((member: any) => ({
      ...member,
      profile_path: member.profile_path ? getImageUrl(member.profile_path, IMAGE_SIZES.POSTER.W185) : null
    })),
    crew: data.crew.map((member: any) => ({
      ...member,
      profile_path: member.profile_path ? getImageUrl(member.profile_path, IMAGE_SIZES.POSTER.W185) : null
    }))
  };
}

export async function getTVShowVideos(tvId: number): Promise<VideosResponse> {
  return await fetchTMDB(API_ENDPOINTS.TMDB_TV_VIDEOS(tvId));
}

// SEARCH FUNCTIONS

export async function searchMovies(query: string, page: number = 1): Promise<MovieResponse> {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_SEARCH_MOVIE, { query, page });
  return {
    page: data.page,
    results: data.results.map(processMovieData),
    total_pages: data.total_pages,
    total_results: data.total_results
  };
}

export async function searchTVShows(query: string, page: number = 1) {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_SEARCH_TV, { query, page });
  return {
    page: data.page,
    results: data.results.map(processTVShowData),
    total_pages: data.total_pages,
    total_results: data.total_results
  };
}

export async function searchMulti(query: string, page: number = 1) {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_SEARCH_MULTI, { query, page });
  return {
    page: data.page,
    results: data.results.map((item: any) => {
      if (item.media_type === 'movie') {
        return { ...processMovieData(item), media_type: 'movie' };
      } else if (item.media_type === 'tv') {
        return { ...processTVShowData(item), media_type: 'tv' };
      }
      return item;
    }),
    total_pages: data.total_pages,
    total_results: data.total_results
  };
}

// DISCOVER FUNCTIONS

export async function discoverMovies(params: {
  page?: number;
  sort_by?: string;
  with_genres?: string;
  primary_release_year?: number;
  vote_average_gte?: number;
  vote_average_lte?: number;
} = {}): Promise<MovieResponse> {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_DISCOVER_MOVIE, params);
  return {
    page: data.page,
    results: data.results.map(processMovieData),
    total_pages: data.total_pages,
    total_results: data.total_results
  };
}

export async function discoverTVShows(params: {
  page?: number;
  sort_by?: string;
  with_genres?: string;
  first_air_date_year?: number;
  vote_average_gte?: number;
  vote_average_lte?: number;
} = {}) {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_DISCOVER_TV, params);
  return {
    page: data.page,
    results: data.results.map(processTVShowData),
    total_pages: data.total_pages,
    total_results: data.total_results
  };
}

// GENRE FUNCTIONS

export async function getMovieGenres(): Promise<{ genres: Genre[] }> {
  return await fetchTMDB(API_ENDPOINTS.TMDB_MOVIE_GENRES);
}

export async function getTVGenres(): Promise<{ genres: Genre[] }> {
  return await fetchTMDB(API_ENDPOINTS.TMDB_TV_GENRES);
}

// TRENDING FUNCTIONS

export async function getTrendingAll(timeWindow: 'day' | 'week' = 'week', page: number = 1) {
  const data = await fetchTMDB(API_ENDPOINTS.TMDB_TRENDING_ALL(timeWindow), { page });
  return {
    page: data.page,
    results: data.results.map((item: any) => {
      if (item.media_type === 'movie') {
        return { ...processMovieData(item), media_type: 'movie' };
      } else if (item.media_type === 'tv') {
        return { ...processTVShowData(item), media_type: 'tv' };
      }
      return item;
    }),
    total_pages: data.total_pages,
    total_results: data.total_results
  };
}

// Export all functions as default
export default {
  // Movies
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  getTrendingMovies,
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getSimilarMovies,
  getMovieRecommendations,
  
  // TV Shows
  getPopularTVShows,
  getTopRatedTVShows,
  getTVShowsOnTheAir,
  getTVShowsAiringToday,
  getTrendingTVShows,
  getTVShowDetails,
  getTVShowCredits,
  getTVShowVideos,
  
  // Search
  searchMovies,
  searchTVShows,
  searchMulti,
  
  // Discover
  discoverMovies,
  discoverTVShows,
  
  // Genres
  getMovieGenres,
  getTVGenres,
  
  // Trending
  getTrendingAll
};
