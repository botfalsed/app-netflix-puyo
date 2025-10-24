import { 
  getTrendingMovies, 
  getPopularMovies, 
  getTopRatedMovies, 
  getNowPlayingMovies,
  getUpcomingMovies,
  getPopularTVShows,
  getTopRatedTVShows,
  getTrendingTVShows,
  discoverMovies,
  discoverTVShows,
  getMovieGenres,
  getTVGenres,
  getMovieDetails,
  getTVShowDetails
} from './tmdb';
import type { Movie, TVShow, Genre, MovieDetails, TVShowDetails } from '../types';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
import { getToken } from './token';
import { BaseDatos, toDropboxRawUrl } from '../data/localContent';

function isWebPlayableUrl(u: string): boolean {
  return /(\.mp4|\.webm|\.m3u8)(\?|#|$)/i.test(u);
}

function makePlayableUrl(u: string): string {
  const raw = toDropboxRawUrl(u);
  if (isWebPlayableUrl(raw)) return raw;
  return `${API_BASE_URL}/api/stream/mp4?url=${encodeURIComponent(raw)}`;
}

// Interfaces adaptadas para la aplicación
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

export interface HomeData {
  featured: Content | null;
  categories: Category[];
  continueWatching: ContinueWatchingItem[];
  watchlist: WatchlistItem[];
  categoryContent: Record<string, Content[]>;
}

class TMDBContentService {
  private movieGenres: Genre[] = [];
  private tvGenres: Genre[] = [];

  constructor() {
    this.loadGenres();
  }

  private async loadGenres() {
    try {
      const [movieGenresResponse, tvGenresResponse] = await Promise.all([
        getMovieGenres(),
        getTVGenres()
      ]);
      
      this.movieGenres = movieGenresResponse.genres;
      this.tvGenres = tvGenresResponse.genres;
      
      console.log('Genres loaded successfully:', {
        movieGenres: this.movieGenres.length,
        tvGenres: this.tvGenres.length
      });
      
      // Debug: mostrar todos los géneros de películas para verificar los nombres
      console.log('🎬 Movie genres loaded:', this.movieGenres.map(g => ({ id: g.id, name: g.name })));
      console.log('📺 TV genres loaded:', this.tvGenres.map(g => ({ id: g.id, name: g.name })));
    } catch (error) {
      console.error('Error loading genres:', error);
      // Fallback genres if API fails
      this.movieGenres = [
        { id: 28, name: 'Action' },
        { id: 35, name: 'Comedy' },
        { id: 18, name: 'Drama' }
      ];
      this.tvGenres = [
        { id: 10759, name: 'Action & Adventure' },
        { id: 35, name: 'Comedy' },
        { id: 18, name: 'Drama' }
      ];
    }
  }

  // Convertir Movie de TMDB a Content
  private movieToContent(movie: Movie): Content {
    const genres = movie.genre_ids?.map(id => 
      this.movieGenres.find(g => g.id === id)?.name || 'Desconocido'
    ).join(', ') || 'Desconocido';

    return {
      id: movie.id,
      title: movie.title,
      description: movie.overview || 'Sin descripción disponible',
      type: 'movie',
      genre: genres,
      release_year: new Date(movie.release_date || '2024').getFullYear(),
      duration_minutes: 120, // Valor por defecto
      rating: movie.vote_average?.toFixed(1) || '0.0',
      thumbnail_url: movie.poster_path || '',
      backdrop_url: movie.backdrop_path || '',
      video_url: '', // Se obtendría de otra API
      trailer_url: '', // Se obtendría de otra API
      is_featured: movie.vote_average ? movie.vote_average > 7.5 : false,
      categories: movie.genre_ids?.map(id => ({
        id,
        name: this.movieGenres.find(g => g.id === id)?.name || 'Desconocido'
      })) || [],
      created_at: new Date().toISOString()
    };
  }

  // Convertir TVShow de TMDB a Content
  private tvShowToContent(tvShow: TVShow): Content {
    const genres = tvShow.genre_ids?.map(id => 
      this.tvGenres.find(g => g.id === id)?.name || 'Desconocido'
    ).join(', ') || 'Desconocido';

    return {
      id: tvShow.id,
      title: tvShow.name,
      description: tvShow.overview || 'Sin descripción disponible',
      type: 'series',
      genre: genres,
      release_year: new Date(tvShow.first_air_date || '2024').getFullYear(),
      seasons: 1, // Valor por defecto
      rating: tvShow.vote_average?.toFixed(1) || '0.0',
      thumbnail_url: tvShow.poster_path || '',
      backdrop_url: tvShow.backdrop_path || '',
      video_url: '', // Se obtendría de otra API
      trailer_url: '', // Se obtendría de otra API
      is_featured: tvShow.vote_average ? tvShow.vote_average > 7.5 : false,
      categories: tvShow.genre_ids?.map(id => ({
        id,
        name: this.tvGenres.find(g => g.id === id)?.name || 'Desconocido'
      })) || [],
      created_at: new Date().toISOString()
    };
  }

  // Obtener contenido destacado
  async getFeaturedContent(): Promise<Content | null> {
    try {
      const local = await this.getLocalContent();
      if (!local || local.length === 0) return null;
      const sorted = [...local].sort((a, b) => (b.release_year || 0) - (a.release_year || 0));
      const featured = { ...sorted[0], is_featured: true };
      return featured;
    } catch (error) {
      console.error('Error getting featured content (local):', error);
      return null;
    }
  }

  // Obtener categorías
  async getCategories(): Promise<Category[]> {
    const local = await this.getLocalContent();
    const genreCounts = new Map<string, number>();
    local.forEach(item => {
      const name = (item.genre || 'Otros').trim();
      genreCounts.set(name, (genreCounts.get(name) || 0) + 1);
    });
    let displayOrder = 1;
    return Array.from(genreCounts.entries()).map(([name, count], index) => ({
      id: index + 1,
      name,
      display_order: displayOrder++,
      content_count: count
    }));
  }

  // Obtener contenido por categoría
  async getContentByCategory(categoryName: string, limit: number = 20): Promise<Content[]> {
    try {
      const local = await this.getLocalContent();
      const filtered = local
        .filter(item => (item.genre || 'Otros').trim() === categoryName)
        .slice(0, limit);
      return filtered;
    } catch (error) {
      console.error(`Error getting local content for category ${categoryName}:`, error);
      return [];
    }
  }

  // Obtener datos para la pantalla principal
  async getHomeData(profileId: number): Promise<HomeData | null> {
    try {
      // Construir datos del home usando solo contenido local
      const [categories, featured, continueWatching] = await Promise.all([
        this.getCategories(),
        this.getFeaturedContent(),
        this.getContinueWatchingForProfile(profileId, 5)
      ]);

      // Cargar contenido de todas las categorías
      const categoryContent: Record<string, Content[]> = {};
      await Promise.all(
        categories.map(async (cat) => {
          try {
            const content = await this.getContentByCategory(cat.name, 20);
            categoryContent[cat.name] = content;
          } catch (err) {
            console.error(`Error loading category ${cat.name}:`, err);
            categoryContent[cat.name] = [];
          }
        })
      );

      return {
        featured,
        categories,
        continueWatching,
        watchlist: [],
        categoryContent
      };
    } catch (error) {
      console.error('Error getting home data (local):', error);
      return null;
    }
  }

  // Simular datos de "Continuar viendo" basados en el perfil
  async getContinueWatchingForProfile(profileId: number, limit: number = 10): Promise<ContinueWatchingItem[]> {
    try {
      const local = await this.getLocalContent();
      const mixedContent = local.slice(0, Math.max(limit, 10));

      const continueWatchingItems: ContinueWatchingItem[] = mixedContent.slice(0, limit).map((content, index) => ({
        ...content,
        progress_seconds: Math.floor(Math.random() * 1800) + 120,
        last_watched: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
        episode_title: content.type === 'series' ? `Episodio ${Math.floor(Math.random() * 10) + 1}` : undefined,
        season_number: content.type === 'series' ? Math.floor(Math.random() * 3) + 1 : undefined,
        episode_number: content.type === 'series' ? Math.floor(Math.random() * 10) + 1 : undefined,
      }));

      return continueWatchingItems;
    } catch (error) {
      console.error('Error getting continue watching (local):', error);
      return [];
    }
  }

  async getWatchlist(profileId: number, limit: number = 20): Promise<WatchlistItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/tmdb-watchlist/${profileId}`, {
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error obteniendo watchlist');
      }

      const data = await response.json();
      return data.watchlist || [];
    } catch (error) {
      console.error('Error obteniendo watchlist:', error);
      return [];
    }
  }

  async addToWatchlist(profileId: number, movieId: number): Promise<boolean> {
    try {
      // Primero obtenemos los detalles de la película de TMDB
      const movieDetails = await getMovieDetails(movieId);
      
      const response = await fetch(`${API_BASE_URL}/api/content/tmdb-watchlist/${profileId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: movieId,
          title: movieDetails.title,
          poster_path: movieDetails.poster_path,
          overview: movieDetails.overview,
          release_date: movieDetails.release_date,
          vote_average: movieDetails.vote_average,
          genre_ids: movieDetails.genres?.map(g => g.id) || []
        }),
      });

      if (!response.ok) {
        throw new Error('Error agregando a watchlist');
      }

      console.log(`Película ${movieId} agregada a Mi Lista para perfil ${profileId}`);
      return true;
    } catch (error) {
      console.error('Error agregando a watchlist:', error);
      return false;
    }
  }

  async removeFromWatchlist(profileId: number, movieId: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/tmdb-watchlist/${profileId}/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error eliminando de watchlist');
      }

      console.log(`Película ${movieId} eliminada de Mi Lista para perfil ${profileId}`);
      return true;
    } catch (error) {
      console.error('Error eliminando de watchlist:', error);
      return false;
    }
  }

  async checkMovieInWatchlist(profileId: number, movieId: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/tmdb-watchlist/${profileId}/${movieId}/check`, {
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.inWatchlist || false;
    } catch (error) {
      console.error('Error verificando película en watchlist:', error);
      return false;
    }
  }

  async updateProgress(
    profileId: number,
    contentId: number,
    progressSeconds: number,
    episodeId?: number,
    completed: boolean = false
  ): Promise<boolean> {
    // Implementación básica, se guardaría en AsyncStorage
    console.log(`Updating progress for content ${contentId}: ${progressSeconds}s`);
    return true;
  }

  async getLocalContent(): Promise<Content[]> {
    try {
      return BaseDatos.map((raw: any) => ({
        id: Number(raw.id),
        title: String(raw.titulo || ''),
        description: String(raw.descripcion || ''),
        type: 'movie',
        genre: String(raw.genero || ''),
        release_year: Number(raw.ano) || new Date().getFullYear(),
        duration_minutes: undefined,
        seasons: undefined,
        rating: 'N/A',
        thumbnail_url: String(raw.imagen || ''),
        backdrop_url: String(raw.imagen || ''),
        video_url: makePlayableUrl(String(raw.url || '')),
        trailer_url: '',
        is_featured: false,
        categories: raw.genero ? [{ id: 0, name: String(raw.genero) }] : [],
        created_at: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error mapeando contenido local:', error);
      return [];
    }
  }

  async getContentDetails(contentId: number, contentType?: string): Promise<Content | null> {
    try {
      const local = await this.getLocalContent();
      const item = local.find(c => c.id === Number(contentId));
      if (item) {
        return item;
      }
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo detalles de contenido (local):', error);
      return null;
    }
  }

  private movieDetailsToContent(movie: MovieDetails): Content {
    return {
      id: movie.id,
      title: movie.title,
      description: movie.overview,
      type: 'movie' as const,
      genre: movie.genres.map(g => g.name).join(', '),
      release_year: new Date(movie.release_date).getFullYear(),
      duration_minutes: movie.runtime,
      rating: movie.vote_average.toFixed(1),
      thumbnail_url: movie.poster_path || '',
      backdrop_url: movie.backdrop_path || '',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      trailer_url: '',
      is_featured: movie.vote_average >= 8.0,
      categories: movie.genres.map(genre => ({
        id: genre.id,
        name: genre.name
      })),
      created_at: new Date().toISOString()
    };
  }

  private tvDetailsToContent(tvShow: TVShowDetails): Content {
    return {
      id: tvShow.id,
      title: tvShow.name,
      description: tvShow.overview,
      type: 'series' as const,
      genre: tvShow.genres.map(g => g.name).join(', '),
      release_year: new Date(tvShow.first_air_date).getFullYear(),
      seasons: tvShow.number_of_seasons,
      rating: tvShow.vote_average.toFixed(1),
      thumbnail_url: tvShow.poster_path || '',
      backdrop_url: tvShow.backdrop_path || '',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      trailer_url: '',
      is_featured: tvShow.vote_average >= 8.0,
      categories: tvShow.genres.map(genre => ({
        id: genre.id,
        name: genre.name
      })),
      created_at: new Date().toISOString()
    };
  }

  async searchContent(searchTerm: string, limit: number = 20): Promise<Content[]> {
    try {
      const local = await this.getLocalContent();
      const term = searchTerm.trim().toLowerCase();
      if (!term) return [];
      const results = local.filter(item =>
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.genre.toLowerCase().includes(term) ||
        (item.categories || []).some(c => c.name.toLowerCase().includes(term)) ||
        String(item.release_year).includes(term)
      );
      return results.slice(0, limit);
    } catch (error) {
      console.error('Error buscando contenido local:', error);
      return [];
    }
  }

  async getSeriesEpisodes(seriesId: number, seasonNumber: number = 1): Promise<Episode[]> {
    try {
      // For now, return empty array since we don't have episode functionality implemented
      // In a real implementation, this would call TMDB API for season episodes
      return [];
    } catch (error) {
      console.error('Error fetching series episodes:', error);
      return [];
    }
  }
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string;
  runtime: number;
  air_date: string;
  vote_average: number;
}

export const tmdbContentService = new TMDBContentService();