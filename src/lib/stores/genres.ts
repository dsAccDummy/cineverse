import { writable, derived } from 'svelte/store';
import type { Genre } from '$lib/types/tmdb';

export const movieGenres = writable<Genre[]>([]);
export const tvGenres = writable<Genre[]>([]);

export const allGenres = derived([movieGenres, tvGenres], ([$movieGenres, $tvGenres]) => {
  const map = new Map<number, Genre>();
  [...$movieGenres, ...$tvGenres].forEach((g) => map.set(g.id, g));
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
});

export function getGenreNames(genreIds: number[], genres: Genre[]): string[] {
  return genreIds
    .map((id) => genres.find((g) => g.id === id)?.name)
    .filter((name): name is string => !!name);
}

// Genre icon/emoji mappings for visual flair
export const GENRE_ICONS: Record<number, string> = {
  28: '💥',    // Action
  12: '🗺️',   // Adventure
  16: '🎨',    // Animation
  35: '😂',    // Comedy
  80: '🔍',    // Crime
  99: '📹',    // Documentary
  18: '🎭',    // Drama
  10751: '👨‍👩‍👧‍👦', // Family
  14: '🧙',    // Fantasy
  36: '📜',    // History
  27: '👻',    // Horror
  10402: '🎵', // Music
  9648: '🕵️',  // Mystery
  10749: '💕', // Romance
  878: '🚀',   // Science Fiction
  10770: '📺', // TV Movie
  53: '😰',    // Thriller
  10752: '⚔️', // War
  37: '🤠',    // Western
  10759: '💥', // Action & Adventure (TV)
  10762: '🧒', // Kids (TV)
  10763: '📰', // News (TV)
  10764: '🌹', // Reality (TV)
  10765: '👽', // Sci-Fi & Fantasy (TV)
  10766: '📺', // Soap (TV)
  10767: '🎤', // Talk (TV)
  10768: '⚔️', // War & Politics (TV)
};
