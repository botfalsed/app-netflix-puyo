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
  getTVShowDetails,
  type Movie,
  type TVShow,
  type Genre,
  type MovieDetails,
  type TVShowDetails
} from './tmdb';
import { getImageUrl, API_BASE_URL } from '../constants/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      thumbnail_url: getImageUrl(movie.poster_path, 'w500'),
      backdrop_url: getImageUrl(movie.backdrop_path, 'w1280'),
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
      thumbnail_url: getImageUrl(tvShow.poster_path, 'w500'),
      backdrop_url: getImageUrl(tvShow.backdrop_path, 'w1280'),
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
      const trendingMovies = await getTrendingMovies('day');
      if (trendingMovies.length > 0) {
        const featured = this.movieToContent(trendingMovies[0]);
        featured.is_featured = true;
        return featured;
      }
      return null;
    } catch (error) {
      console.error('Error getting featured content:', error);
      return null;
    }
  }

  // Obtener categorías
  async getCategories(): Promise<Category[]> {
    const categories: Category[] = [
      { id: 1, name: 'Tendencias', display_order: 1, content_count: 20 },
      { id: 2, name: 'Populares', display_order: 2, content_count: 20 },
      { id: 3, name: 'Mejor Valoradas', display_order: 3, content_count: 20 },
      { id: 4, name: 'Acción', display_order: 4, content_count: 20 },
      { id: 5, name: 'Comedia', display_order: 5, content_count: 20 },
      { id: 6, name: 'Drama', display_order: 6, content_count: 20 },
      { id: 7, name: 'Series Populares', display_order: 7, content_count: 20 },
      { id: 8, name: 'Series Mejor Valoradas', display_order: 8, content_count: 20 }
    ];
    return categories;
  }

  // Obtener contenido por categoría
  async getContentByCategory(categoryName: string, limit: number = 20): Promise<Content[]> {
    try {
      console.log(`🔍 Loading category: ${categoryName} with limit: ${limit}`);
      
      // Asegurar que los géneros estén cargados
      if (this.movieGenres.length === 0 || this.tvGenres.length === 0) {
        console.log('🔄 Genres not loaded, loading now...');
        await this.loadGenres();
      }

      let content: Content[] = [];

      switch (categoryName) {
        case 'Tendencias':
          const trendingMovies = await getTrendingMovies('day');
          const trendingTVShows = await getTrendingTVShows('day');
          content = [
            ...trendingMovies.results.slice(0, limit / 2).map(movie => this.movieToContent(movie)),
            ...trendingTVShows.results.slice(0, limit / 2).map(tv => this.tvShowToContent(tv))
          ];
          break;

        case 'Populares':
          const popularMovies = await getPopularMovies();
          content = popularMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          break;

        case 'Mejor Valoradas':
          const topRatedMovies = await getTopRatedMovies();
          content = topRatedMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          break;

        case 'Acción':
          const actionGenre = this.movieGenres.find(g => g.name === 'Acción');
          console.log('🎬 Action category - Genre found:', actionGenre, 'Total genres:', this.movieGenres.length);
          if (actionGenre) {
            console.log('🎬 Fetching action movies with genre ID:', actionGenre.id);
            const actionMovies = await discoverMovies({ with_genres: actionGenre.id.toString() });
            console.log('🎬 Action movies response:', actionMovies.results?.length || 0, 'movies');
            content = actionMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          } else {
            console.log('🎬 Action genre not found, using fallback');
            // Fallback: usar películas populares si no se encuentra el género
            const fallbackMovies = await getPopularMovies();
            content = fallbackMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          }
          console.log('🎬 Final Action content count:', content.length);
          break;

        case 'Comedia':
          const comedyGenre = this.movieGenres.find(g => g.name === 'Comedia');
          console.log('😂 Comedy category - Genre found:', comedyGenre, 'Total genres:', this.movieGenres.length);
          if (comedyGenre) {
            console.log('😂 Fetching comedy movies with genre ID:', comedyGenre.id);
            const comedyMovies = await discoverMovies({ with_genres: comedyGenre.id.toString() });
            console.log('😂 Comedy movies response:', comedyMovies.results?.length || 0, 'movies');
            content = comedyMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          } else {
            console.log('😂 Comedy genre not found, using fallback');
            // Fallback: usar películas mejor valoradas si no se encuentra el género
            const fallbackMovies = await getTopRatedMovies();
            content = fallbackMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          }
          console.log('😂 Final Comedy content count:', content.length);
          break;

        case 'Drama':
          const dramaGenre = this.movieGenres.find(g => g.name === 'Drama');
          console.log('Drama genre found:', dramaGenre, 'Available genres:', this.movieGenres);
          if (dramaGenre) {
            const dramaMovies = await discoverMovies({ with_genres: dramaGenre.id.toString() });
            content = dramaMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          } else {
            // Fallback: usar películas en tendencia si no se encuentra el género
            const fallbackMovies = await getTrendingMovies();
            content = fallbackMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          }
          break;

        case 'Series Populares':
          const popularTVShows = await getPopularTVShows();
          content = popularTVShows.results.slice(0, limit).map(tv => this.tvShowToContent(tv));
          break;

        case 'Series Mejor Valoradas':
          const topRatedTVShows = await getTopRatedTVShows();
          content = topRatedTVShows.results.slice(0, limit).map(tv => this.tvShowToContent(tv));
          break;

        // Nuevas categorías de géneros de películas
        case 'Aventura':
          const adventureGenre = this.movieGenres.find(g => g.name === 'Aventura');
          if (adventureGenre) {
            const adventureMovies = await discoverMovies({ with_genres: adventureGenre.id.toString() });
            content = adventureMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          }
          break;

        case 'Animación':
          const animationGenre = this.movieGenres.find(g => g.name === 'Animación');
          if (animationGenre) {
            const animationMovies = await discoverMovies({ with_genres: animationGenre.id.toString() });
            content = animationMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          }
          break;

        case 'Comedias':
          const comedyGenreNew = this.movieGenres.find(g => g.name === 'Comedia');
          if (comedyGenreNew) {
            const comedyMovies = await discoverMovies({ with_genres: comedyGenreNew.id.toString() });
            content = comedyMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          }
          break;

        case 'Crimen':
          const crimeGenre = this.movieGenres.find(g => g.name === 'Crimen');
          if (crimeGenre) {
            const crimeMovies = await discoverMovies({ with_genres: crimeGenre.id.toString() });
            content = crimeMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          }
          break;

        case 'Documentales':
          const documentaryGenre = this.movieGenres.find(g => g.name === 'Documental');
          if (documentaryGenre) {
            const documentaryMovies = await discoverMovies({ with_genres: documentaryGenre.id.toString() });
            content = documentaryMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          }
          break;

        case 'Dramas':
          const dramaGenreNew = this.movieGenres.find(g => g.name === 'Drama');
          if (dramaGenreNew) {
            const dramaMovies = await discoverMovies({ with_genres: dramaGenreNew.id.toString() });
            content = dramaMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          }
          break;

        case 'Familia':
          const familyGenre = this.movieGenres.find(g => g.name === 'Familia');
          if (familyGenre) {
            const familyMovies = await discoverMovies({ with_genres: familyGenre.id.toString() });
            content = familyMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          }
          break;

        case 'Fantasía':
          const fantasyGenre = this.movieGenres.find(g => g.name === 'Fantasía');
          if (fantasyGenre) {
            const fantasyMovies = await discoverMovies({ with_genres: fantasyGenre.id.toString() });
            content = fantasyMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          }
          break;

        case 'Historia':
          const historyGenre = this.movieGenres.find(g => g.name === 'Historia');
          if (historyGenre) {
            const historyMovies = await discoverMovies({ with_genres: historyGenre.id.toString() });
            content = historyMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          }
          break;

        case 'Terror':
          const horrorGenre = this.movieGenres.find(g => g.name === 'Terror');
          if (horrorGenre) {
            const horrorMovies = await discoverMovies({ with_genres: horrorGenre.id.toString() });
            content = horrorMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          }
          break;

        case 'Música':
          const musicGenre = this.movieGenres.find(g => g.name === 'Música');
          if (musicGenre) {
            const musicMovies = await discoverMovies({ with_genres: musicGenre.id.toString() });
            content = musicMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          }
          break;

        case 'Misterio':
          const mysteryGenre = this.movieGenres.find(g => g.name === 'Misterio');
          if (mysteryGenre) {
            const mysteryMovies = await discoverMovies({ with_genres: mysteryGenre.id.toString() });
            content = mysteryMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          }
          break;

        case 'Romance':
          const romanceGenre = this.movieGenres.find(g => g.name === 'Romance');
          if (romanceGenre) {
            const romanceMovies = await discoverMovies({ with_genres: romanceGenre.id.toString() });
            content = romanceMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          }
          break;

        case 'Ciencia Ficción':
          const sciFiGenre = this.movieGenres.find(g => g.name === 'Ciencia ficción');
          if (sciFiGenre) {
            const sciFiMovies = await discoverMovies({ with_genres: sciFiGenre.id.toString() });
            content = sciFiMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          }
          break;

        case 'Suspenso':
        case 'Thriller':
          const thrillerGenre = this.movieGenres.find(g => g.name === 'Suspense');
          if (thrillerGenre) {
            const thrillerMovies = await discoverMovies({ with_genres: thrillerGenre.id.toString() });
            content = thrillerMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          }
          break;

        case 'Guerra':
          const warGenre = this.movieGenres.find(g => g.name === 'Bélica');
          if (warGenre) {
            const warMovies = await discoverMovies({ with_genres: warGenre.id.toString() });
            content = warMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          }
          break;

        case 'Western':
          const westernGenre = this.movieGenres.find(g => g.name === 'Western');
          if (westernGenre) {
            const westernMovies = await discoverMovies({ with_genres: westernGenre.id.toString() });
            content = westernMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
          }
          break;

        // Nuevas categorías de series
        case 'Series de Acción y Aventura':
          const actionAdventureTVGenre = this.tvGenres.find(g => g.name === 'Action & Adventure');
          if (actionAdventureTVGenre) {
            const actionAdventureTVShows = await discoverTVShows({ with_genres: actionAdventureTVGenre.id.toString() });
            content = actionAdventureTVShows.results.slice(0, limit).map(tv => this.tvShowToContent(tv));
          }
          break;

        case 'Series de Comedia':
          const comedyTVGenre = this.tvGenres.find(g => g.name === 'Comedy');
          if (comedyTVGenre) {
            const comedyTVShows = await discoverTVShows({ with_genres: comedyTVGenre.id.toString() });
            content = comedyTVShows.results.slice(0, limit).map(tv => this.tvShowToContent(tv));
          }
          break;

        case 'Series de Drama':
          const dramaTVGenre = this.tvGenres.find(g => g.name === 'Drama');
          if (dramaTVGenre) {
            const dramaTVShows = await discoverTVShows({ with_genres: dramaTVGenre.id.toString() });
            content = dramaTVShows.results.slice(0, limit).map(tv => this.tvShowToContent(tv));
          }
          break;

        case 'Series de Crimen':
          const crimeTVGenre = this.tvGenres.find(g => g.name === 'Crime');
          if (crimeTVGenre) {
            const crimeTVShows = await discoverTVShows({ with_genres: crimeTVGenre.id.toString() });
            content = crimeTVShows.results.slice(0, limit).map(tv => this.tvShowToContent(tv));
          }
          break;

        case 'Series Documentales':
          const documentaryTVGenre = this.tvGenres.find(g => g.name === 'Documentary');
          if (documentaryTVGenre) {
            const documentaryTVShows = await discoverTVShows({ with_genres: documentaryTVGenre.id.toString() });
            content = documentaryTVShows.results.slice(0, limit).map(tv => this.tvShowToContent(tv));
          }
          break;

        case 'Series de Misterio':
          const mysteryTVGenre = this.tvGenres.find(g => g.name === 'Mystery');
          if (mysteryTVGenre) {
            const mysteryTVShows = await discoverTVShows({ with_genres: mysteryTVGenre.id.toString() });
            content = mysteryTVShows.results.slice(0, limit).map(tv => this.tvShowToContent(tv));
          }
          break;

        case 'Series de Ciencia Ficción y Fantasía':
          const sciFiFantasyTVGenre = this.tvGenres.find(g => g.name === 'Sci-Fi & Fantasy');
          if (sciFiFantasyTVGenre) {
            const sciFiFantasyTVShows = await discoverTVShows({ with_genres: sciFiFantasyTVGenre.id.toString() });
            content = sciFiFantasyTVShows.results.slice(0, limit).map(tv => this.tvShowToContent(tv));
          }
          break;

        default:
          console.warn(`Unknown category: ${categoryName}`);
          // Fallback: usar contenido popular si no se encuentra la categoría
          const fallbackMovies = await getPopularMovies();
          content = fallbackMovies.results.slice(0, limit).map(movie => this.movieToContent(movie));
      }

      console.log(`Content loaded for ${categoryName}:`, content.length);
      return content;
    } catch (error) {
      console.error(`Error getting content for category ${categoryName}:`, error);
      return [];
    }
  }

  // Obtener datos para la pantalla principal
  async getHomeData(profileId: number): Promise<HomeData | null> {
    try {
      // Cargar géneros si no están cargados
      if (this.movieGenres.length === 0 || this.tvGenres.length === 0) {
        await this.loadGenres();
      }

      // Obtener datos básicos
      const [featured, categories, continueWatching] = await Promise.all([
        this.getFeaturedContent(),
        this.getCategories(),
        this.getContinueWatchingForProfile(profileId, 5)
      ]);

      // Cargar contenido para categorías prioritarias primero
      const priorityCategories = ['Tendencias', 'Populares', 'Mejor Valoradas'];
      const categoryContent: Record<string, Content[]> = {};

      // Cargar categorías prioritarias
      for (const categoryName of priorityCategories) {
        try {
          categoryContent[categoryName] = await this.getContentByCategory(categoryName, 20);
        } catch (error) {
          console.error(`Error loading priority category ${categoryName}:`, error);
          categoryContent[categoryName] = [];
        }
      }

      // Cargar el resto de categorías de forma asíncrona
      const remainingCategories = categories
        .map(cat => cat.name)
        .filter(name => !priorityCategories.includes(name));

      // Cargar categorías restantes en paralelo con Promise.all para asegurar que se completen
      const remainingCategoryPromises = remainingCategories.map(async (categoryName) => {
        try {
          const content = await this.getContentByCategory(categoryName, 20);
          return { categoryName, content };
        } catch (error) {
          console.error(`Error loading category ${categoryName}:`, error);
          return { categoryName, content: [] };
        }
      });

      // Esperar a que todas las categorías restantes se carguen
      const remainingResults = await Promise.all(remainingCategoryPromises);
      
      // Agregar los resultados al objeto categoryContent
      remainingResults.forEach(({ categoryName, content }) => {
        categoryContent[categoryName] = content;
      });

      console.log('🏠 Home data categories loaded:', Object.keys(categoryContent));
      console.log('🏠 Total categories in categoryContent:', Object.keys(categoryContent).length);

      return {
        featured,
        categories,
        continueWatching,
        watchlist: [], // Se implementaría con datos reales del perfil
        categoryContent
      };
    } catch (error) {
      console.error('Error getting home data:', error);
      return null;
    }
  }

  // Simular datos de "Continuar viendo" basados en el perfil
  async getContinueWatchingForProfile(profileId: number, limit: number = 10): Promise<ContinueWatchingItem[]> {
    try {
      // Obtener contenido popular para simular "continuar viendo"
      const popularMovies = await getPopularMovies();
      const popularTVShows = await getPopularTVShows();
      
      // Mezclar películas y series
      const mixedContent = [
        ...popularMovies.results.slice(0, 3).map(movie => this.movieToContent(movie)),
        ...popularTVShows.results.slice(0, 2).map(tv => this.tvShowToContent(tv))
      ];

      // Convertir a ContinueWatchingItem con datos simulados
      const continueWatchingItems: ContinueWatchingItem[] = mixedContent.slice(0, limit).map((content, index) => ({
        ...content,
        progress_seconds: Math.floor(Math.random() * 3600) + 300, // Entre 5 minutos y 1 hora
        last_watched: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(), // Últimos días
        episode_title: content.type === 'series' ? `Episodio ${Math.floor(Math.random() * 10) + 1}` : undefined,
        season_number: content.type === 'series' ? Math.floor(Math.random() * 3) + 1 : undefined,
        episode_number: content.type === 'series' ? Math.floor(Math.random() * 10) + 1 : undefined,
      }));

      return continueWatchingItems;
    } catch (error) {
      console.error('Error getting continue watching:', error);
      return [];
    }
  }

  async getWatchlist(profileId: number, limit: number = 20): Promise<WatchlistItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/tmdb-watchlist/${profileId}`, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
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
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: movieId,
          title: movieDetails.title,
          poster_path: movieDetails.poster_path,
          overview: movieDetails.overview,
          release_date: movieDetails.release_date,
          vote_average: movieDetails.vote_average,
          genre_ids: movieDetails.genre_ids || movieDetails.genres?.map(g => g.id) || []
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
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
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
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
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
    // Esta función devuelve contenido local si existe
    // Por ahora retornamos un array vacío ya que todo el contenido viene de TMDB
    return [];
  }

  async getContentDetails(contentId: number, contentType?: string): Promise<Content | null> {
    try {
      console.log('🔍 Buscando detalles para ID:', contentId, 'Tipo:', contentType);
      
      // Si tenemos el tipo, usarlo directamente
      if (contentType === 'movie') {
        console.log('🎬 Obteniendo como película (tipo especificado)...');
        const movieDetails = await getMovieDetails(contentId);
        console.log('✅ Película encontrada:', movieDetails.title);
        return this.movieDetailsToContent(movieDetails);
      } else if (contentType === 'series') {
        console.log('📺 Obteniendo como serie (tipo especificado)...');
        const tvDetails = await getTVShowDetails(contentId);
        console.log('✅ Serie encontrada:', tvDetails.name);
        return this.tvDetailsToContent(tvDetails);
      }
      
      // Si no tenemos tipo, usar el método anterior (primero película, luego serie)
      try {
        console.log('🎬 Intentando obtener como película...');
        const movieDetails = await getMovieDetails(contentId);
        console.log('✅ Película encontrada:', movieDetails.title);
        return this.movieDetailsToContent(movieDetails);
      } catch (movieError) {
        console.log('❌ No es película, intentando como serie...');
        
        // Si falla como película, intentamos como serie
        try {
          const tvDetails = await getTVShowDetails(contentId);
          console.log('✅ Serie encontrada:', tvDetails.name);
          return this.tvDetailsToContent(tvDetails);
        } catch (tvError) {
          console.error('❌ Error obteniendo detalles de contenido:', { movieError, tvError });
          return null;
        }
      }
    } catch (error) {
      console.error('❌ Error general obteniendo detalles de contenido:', error);
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
      video_url: '', // Se podría implementar con videos de TMDB
      trailer_url: '', // Se podría implementar con videos de TMDB
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
      video_url: '', // Se podría implementar con videos de TMDB
      trailer_url: '', // Se podría implementar con videos de TMDB
      is_featured: tvShow.vote_average >= 8.0,
      categories: tvShow.genres.map(genre => ({
        id: genre.id,
        name: genre.name
      })),
      created_at: new Date().toISOString()
    };
  }

  async searchContent(searchTerm: string, limit: number = 20): Promise<Content[]> {
    // Se implementaría usando la función de búsqueda de TMDB
    return [];
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