import type {
  Movie,
  TVShow,
  MovieDetails,
  TVShowDetails,
  Credits,
  Video,
  Review,
  Genre,
  PaginatedResponse,
  MediaItem,
  Season,
  Episode,
} from '$lib/types/tmdb';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';

interface FetchOptions {
  params?: Record<string, string | number>;
}

async function fetchTMDB<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('language', 'en-US');

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.status_message || `TMDB API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// ============================================
// Movie Endpoints
// ============================================

export async function getPopularMovies(page = 1): Promise<PaginatedResponse<Movie>> {
  return fetchTMDB('/movie/popular', { params: { page } });
}

export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<PaginatedResponse<Movie>> {
  return fetchTMDB(`/trending/movie/${timeWindow}`);
}

export async function getTopRatedMovies(page = 1): Promise<PaginatedResponse<Movie>> {
  return fetchTMDB('/movie/top_rated', { params: { page } });
}

export async function getUpcomingMovies(page = 1): Promise<PaginatedResponse<Movie>> {
  return fetchTMDB('/movie/upcoming', { params: { page } });
}

export async function getNowPlayingMovies(page = 1): Promise<PaginatedResponse<Movie>> {
  return fetchTMDB('/movie/now_playing', { params: { page } });
}

export async function getMovieDetails(id: number): Promise<MovieDetails> {
  return fetchTMDB(`/movie/${id}`, {
    params: { append_to_response: 'credits,videos,reviews,similar,recommendations' },
  });
}

export async function getMovieCredits(id: number): Promise<Credits> {
  return fetchTMDB(`/movie/${id}/credits`);
}

export async function getMovieVideos(id: number): Promise<{ results: Video[] }> {
  return fetchTMDB(`/movie/${id}/videos`);
}

export async function getMovieReviews(id: number, page = 1): Promise<PaginatedResponse<Review>> {
  return fetchTMDB(`/movie/${id}/reviews`, { params: { page } });
}

export async function getSimilarMovies(id: number, page = 1): Promise<PaginatedResponse<Movie>> {
  return fetchTMDB(`/movie/${id}/similar`, { params: { page } });
}

export async function getMovieRecommendations(id: number, page = 1): Promise<PaginatedResponse<Movie>> {
  return fetchTMDB(`/movie/${id}/recommendations`, { params: { page } });
}

export async function discoverMovies(params: Record<string, string | number> = {}): Promise<PaginatedResponse<Movie>> {
  return fetchTMDB('/discover/movie', { params });
}

// ============================================
// TV Show Endpoints
// ============================================

export async function getPopularTVShows(page = 1): Promise<PaginatedResponse<TVShow>> {
  return fetchTMDB('/tv/popular', { params: { page } });
}

export async function getTrendingTV(timeWindow: 'day' | 'week' = 'week'): Promise<PaginatedResponse<TVShow>> {
  return fetchTMDB(`/trending/tv/${timeWindow}`);
}

export async function getTopRatedTVShows(page = 1): Promise<PaginatedResponse<TVShow>> {
  return fetchTMDB('/tv/top_rated', { params: { page } });
}

export async function getTVShowDetails(id: number): Promise<TVShowDetails> {
  return fetchTMDB(`/tv/${id}`, {
    params: { append_to_response: 'credits,videos,reviews,similar,recommendations' },
  });
}

export async function getTVCredits(id: number): Promise<Credits> {
  return fetchTMDB(`/tv/${id}/credits`);
}

export async function getTVVideos(id: number): Promise<{ results: Video[] }> {
  return fetchTMDB(`/tv/${id}/videos`);
}

export async function getTVReviews(id: number, page = 1): Promise<PaginatedResponse<Review>> {
  return fetchTMDB(`/tv/${id}/reviews`, { params: { page } });
}

export async function getSimilarTVShows(id: number, page = 1): Promise<PaginatedResponse<TVShow>> {
  return fetchTMDB(`/tv/${id}/similar`, { params: { page } });
}

export async function getTVRecommendations(id: number, page = 1): Promise<PaginatedResponse<TVShow>> {
  return fetchTMDB(`/tv/${id}/recommendations`, { params: { page } });
}

export async function getTVSeasonDetails(tvId: number, seasonNum: number): Promise<Season & { episodes: Episode[] }> {
  return fetchTMDB(`/tv/${tvId}/season/${seasonNum}`);
}

export async function discoverTV(params: Record<string, string | number> = {}): Promise<PaginatedResponse<TVShow>> {
  return fetchTMDB('/discover/tv', { params });
}

// K-Drama (Korean TV)
export async function getKoreanDramas(page = 1): Promise<PaginatedResponse<TVShow>> {
  return fetchTMDB('/discover/tv', {
    params: {
      page,
      with_original_language: 'ko',
      sort_by: 'popularity.desc',
      'vote_count.gte': 50,
    },
  });
}

// ============================================
// Genre Endpoints
// ============================================

export async function getMovieGenres(): Promise<{ genres: Genre[] }> {
  return fetchTMDB('/genre/movie/list');
}

export async function getTVGenres(): Promise<{ genres: Genre[] }> {
  return fetchTMDB('/genre/tv/list');
}

// ============================================
// Search Endpoints
// ============================================

export async function searchMulti(query: string, page = 1): Promise<PaginatedResponse<MediaItem>> {
  return fetchTMDB('/search/multi', { params: { query, page } });
}

export async function searchMovies(query: string, page = 1): Promise<PaginatedResponse<Movie>> {
  return fetchTMDB('/search/movie', { params: { query, page } });
}

export async function searchTV(query: string, page = 1): Promise<PaginatedResponse<TVShow>> {
  return fetchTMDB('/search/tv', { params: { query, page } });
}

// ============================================
// Trending / All
// ============================================

export async function getTrendingAll(timeWindow: 'day' | 'week' = 'week'): Promise<PaginatedResponse<MediaItem>> {
  return fetchTMDB(`/trending/all/${timeWindow}`);
}
