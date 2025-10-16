# Integración TMDB API - Netflix Clone

## Descripción
Esta integración permite obtener datos completos de películas y series de TV desde The Movie Database (TMDB) API, incluyendo toda la información mostrada en la imagen de referencia de "The Conjuring: Last Rites".

## Configuración

### Variables de Entorno
Asegúrate de configurar tu API key de TMDB en el archivo `.env`:

```env
EXPO_PUBLIC_TMDB_API_KEY=tu_api_key_aqui
```

## Funcionalidades Implementadas

### 🎬 Películas

#### Obtener Listas de Películas
```typescript
import { 
  getPopularMovies, 
  getTopRatedMovies, 
  getNowPlayingMovies, 
  getUpcomingMovies, 
  getTrendingMovies 
} from '../services/tmdb';

// Películas populares
const popularMovies = await getPopularMovies(1);

// Películas mejor valoradas
const topRatedMovies = await getTopRatedMovies(1);

// Películas en cartelera
const nowPlayingMovies = await getNowPlayingMovies(1);

// Próximos estrenos
const upcomingMovies = await getUpcomingMovies(1);

// Películas en tendencia
const trendingMovies = await getTrendingMovies('week', 1);
```

#### Detalles Completos de Película
```typescript
import { getMovieDetails, getMovieCredits, getMovieVideos } from '../services/tmdb';

// Información completa como en "The Conjuring: Last Rites"
const movieDetails = await getMovieDetails(movieId);
// Incluye: título, sinopsis, fecha de estreno, puntuación, géneros, 
// duración, presupuesto, recaudación, compañías productoras, etc.

// Cast y crew (actores, directores, etc.)
const movieCredits = await getMovieCredits(movieId);

// Videos (trailers, teasers, etc.)
const movieVideos = await getMovieVideos(movieId);
```

### 📺 Series de TV

#### Obtener Listas de Series
```typescript
import { 
  getPopularTVShows, 
  getTopRatedTVShows, 
  getTVShowsOnTheAir, 
  getTVShowsAiringToday,
  getTrendingTVShows 
} from '../services/tmdb';

// Series populares
const popularTVShows = await getPopularTVShows(1);

// Series mejor valoradas
const topRatedTVShows = await getTopRatedTVShows(1);

// Series al aire
const onTheAirTVShows = await getTVShowsOnTheAir(1);

// Series que se emiten hoy
const airingTodayTVShows = await getTVShowsAiringToday(1);

// Series en tendencia
const trendingTVShows = await getTrendingTVShows('week', 1);
```

#### Detalles Completos de Serie
```typescript
import { getTVShowDetails, getTVShowCredits, getTVShowVideos } from '../services/tmdb';

// Información completa de la serie
const tvShowDetails = await getTVShowDetails(tvId);
// Incluye: nombre, sinopsis, fecha de estreno, puntuación, géneros,
// número de temporadas/episodios, creadores, redes, etc.

// Cast y crew
const tvShowCredits = await getTVShowCredits(tvId);

// Videos
const tvShowVideos = await getTVShowVideos(tvId);
```

### 🔍 Búsqueda

```typescript
import { searchMovies, searchTVShows, searchMulti } from '../services/tmdb';

// Buscar películas
const movieResults = await searchMovies('The Conjuring', 1);

// Buscar series
const tvResults = await searchTVShows('Breaking Bad', 1);

// Búsqueda múltiple (películas y series)
const multiResults = await searchMulti('Marvel', 1);
```

### 🎭 Géneros

```typescript
import { getMovieGenres, getTVGenres } from '../services/tmdb';

// Géneros de películas
const movieGenres = await getMovieGenres();

// Géneros de series
const tvGenres = await getTVGenres();
```

### 🔥 Contenido en Tendencia

```typescript
import { getTrendingAll } from '../services/tmdb';

// Todo el contenido en tendencia (películas y series)
const trendingAll = await getTrendingAll('week', 1);
```

### 🎯 Descubrimiento Avanzado

```typescript
import { discoverMovies, discoverTVShows } from '../services/tmdb';

// Descubrir películas con filtros
const discoveredMovies = await discoverMovies({
  page: 1,
  sort_by: 'popularity.desc',
  with_genres: '27,53', // Horror y Thriller
  primary_release_year: 2025,
  vote_average_gte: 6.0
});

// Descubrir series con filtros
const discoveredTVShows = await discoverTVShows({
  page: 1,
  sort_by: 'vote_average.desc',
  with_genres: '18', // Drama
  first_air_date_year: 2024
});
```

## Datos Disponibles

### Para Películas (como "The Conjuring: Last Rites")
- **Información básica**: ID, título, sinopsis, fecha de estreno
- **Puntuaciones**: Promedio de votos, número de votos
- **Imágenes**: Poster, backdrop (en múltiples resoluciones)
- **Géneros**: Lista de géneros asociados
- **Detalles técnicos**: Duración, presupuesto, recaudación
- **Producción**: Compañías productoras, países de producción
- **Cast y Crew**: Actores, directores, guionistas, etc.
- **Videos**: Trailers, teasers, clips
- **Idiomas**: Idiomas hablados
- **Estado**: En producción, estrenada, etc.

### Para Series de TV
- **Información básica**: ID, nombre, sinopsis, fecha de estreno
- **Temporadas y episodios**: Número total, información detallada
- **Creadores**: Información de los creadores de la serie
- **Redes**: Canales/plataformas donde se emite
- **Estado**: En producción, finalizada, etc.
- **Último episodio**: Información del último episodio emitido

## Configuración de Imágenes

Las imágenes se procesan automáticamente con las URLs completas:

```typescript
// Los tamaños disponibles están en constants/Api.ts
IMAGE_SIZES = {
  POSTER: {
    W92: 'w92',
    W154: 'w154', 
    W185: 'w185',
    W342: 'w342',
    W500: 'w500',
    W780: 'w780',
    ORIGINAL: 'original'
  },
  BACKDROP: {
    W300: 'w300',
    W780: 'w780', 
    W1280: 'w1280',
    ORIGINAL: 'original'
  }
}
```

## Ejemplo de Uso Completo

```typescript
import React, { useEffect, useState } from 'react';
import { getMovieDetails, getMovieCredits, getMovieVideos } from '../services/tmdb';
import { MovieDetails, Credits, VideosResponse } from '../types';

export function MovieDetailScreen({ movieId }: { movieId: number }) {
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [videos, setVideos] = useState<VideosResponse | null>(null);

  useEffect(() => {
    const loadMovieData = async () => {
      try {
        // Cargar todos los datos de la película
        const [movieData, creditsData, videosData] = await Promise.all([
          getMovieDetails(movieId),
          getMovieCredits(movieId),
          getMovieVideos(movieId)
        ]);

        setMovie(movieData);
        setCredits(creditsData);
        setVideos(videosData);
      } catch (error) {
        console.error('Error loading movie data:', error);
      }
    };

    loadMovieData();
  }, [movieId]);

  if (!movie) return <div>Cargando...</div>;

  return (
    <div>
      <h1>{movie.title}</h1>
      <p>Puntuación: {movie.vote_average}/10</p>
      <p>Fecha de estreno: {movie.release_date}</p>
      <p>Duración: {movie.runtime} minutos</p>
      <p>Géneros: {movie.genres.map(g => g.name).join(', ')}</p>
      <p>Sinopsis: {movie.overview}</p>
      
      {credits && (
        <div>
          <h3>Reparto Principal:</h3>
          {credits.cast.slice(0, 5).map(actor => (
            <p key={actor.id}>{actor.name} como {actor.character}</p>
          ))}
        </div>
      )}
      
      {videos && videos.results.length > 0 && (
        <div>
          <h3>Trailer:</h3>
          <p>Video disponible: {videos.results[0].name}</p>
        </div>
      )}
    </div>
  );
}
```

## Notas Importantes

1. **Idioma**: La API está configurada para devolver contenido en español (`es-ES`)
2. **Rate Limiting**: TMDB tiene límites de requests por segundo, maneja los errores apropiadamente
3. **Imágenes**: Todas las URLs de imágenes se procesan automáticamente con las dimensiones correctas
4. **Tipos TypeScript**: Todos los datos están tipados para mejor desarrollo
5. **Error Handling**: Implementa manejo de errores en tu aplicación

## Próximos Pasos

Para usar esta integración en tu Netflix clone:

1. Reemplaza las llamadas de datos mock con las funciones de TMDB
2. Actualiza tus componentes para usar los nuevos tipos de datos
3. Implementa caching para mejorar el rendimiento
4. Añade manejo de estados de carga y error
5. Configura la paginación para las listas de contenido