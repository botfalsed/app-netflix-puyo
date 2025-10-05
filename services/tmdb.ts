const API_KEY = process.env.EXPO_PUBLIC_TMDB_KEY || '9cf9aba2bca13c2fdfa92c44bd160840';
const API_BASE = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

async function fetchJson(path: string, params: Record<string,string|number> = {}) {
  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set('api_key', API_KEY);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status} ${res.statusText}`);
  return res.json();
}

export async function getTrendingMovies(timeWindow: 'day'|'week' = 'week') {
  const data = await fetchJson(`/trending/movie/${timeWindow}`);
  return (data.results || []).map((m: any) => ({
    id: m.id,
    title: m.title || m.name,
    poster_path: m.poster_path ? `${IMAGE_BASE}${m.poster_path}` : null,
    backdrop_path: m.backdrop_path ? `${IMAGE_BASE}${m.backdrop_path}` : null,
    overview: m.overview,
    release_date: m.release_date,
  }));
}

export async function getPopularMovies(page = 1) {
  const data = await fetchJson('/movie/popular', { page });
  return (data.results || []).map((m: any) => ({
    id: m.id,
    title: m.title || m.name,
    poster_path: m.poster_path ? `${IMAGE_BASE}${m.poster_path}` : null,
    backdrop_path: m.backdrop_path ? `${IMAGE_BASE}${m.backdrop_path}` : null,
    overview: m.overview,
    release_date: m.release_date,
  }));
}

export async function getMovieVideos(movieId: number) {
  const data = await fetchJson(`/movie/${movieId}/videos`);
  return (data.results || []).map((v: any) => ({
    id: v.id,
    key: v.key,
    site: v.site,
    type: v.type,
    name: v.name,
  }));
}

export default { getTrendingMovies, getPopularMovies };
