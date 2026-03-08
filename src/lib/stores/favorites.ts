import { writable, derived } from 'svelte/store';
import type { FavoriteItem } from '$lib/types/tmdb';
import { browser } from '$app/environment';

const STORAGE_KEY = 'cineverse_favorites';

function loadFavorites(): FavoriteItem[] {
  if (!browser) return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function createFavoritesStore() {
  const { subscribe, set, update } = writable<FavoriteItem[]>(loadFavorites());

  // Persist to localStorage whenever the store changes
  if (browser) {
    subscribe((value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
  }

  return {
    subscribe,

    addFavorite(item: FavoriteItem) {
      update((favorites) => {
        const exists = favorites.some((f) => f.id === item.id && f.type === item.type);
        if (exists) return favorites;
        return [{ ...item, added_at: new Date().toISOString() }, ...favorites];
      });
    },

    removeFavorite(id: number, type: 'movie' | 'tv') {
      update((favorites) => favorites.filter((f) => !(f.id === id && f.type === type)));
    },

    toggleFavorite(item: FavoriteItem) {
      update((favorites) => {
        const exists = favorites.some((f) => f.id === item.id && f.type === item.type);
        if (exists) {
          return favorites.filter((f) => !(f.id === item.id && f.type === item.type));
        }
        return [{ ...item, added_at: new Date().toISOString() }, ...favorites];
      });
    },

    isFavorite(id: number, type: 'movie' | 'tv'): boolean {
      let result = false;
      subscribe((favorites) => {
        result = favorites.some((f) => f.id === id && f.type === type);
      })();
      return result;
    },

    clearAll() {
      set([]);
    },
  };
}

export const favorites = createFavoritesStore();

export const favoriteCount = derived(favorites, ($favorites) => $favorites.length);

export const favoriteMovies = derived(favorites, ($favorites) =>
  $favorites.filter((f) => f.type === 'movie')
);

export const favoriteTVShows = derived(favorites, ($favorites) =>
  $favorites.filter((f) => f.type === 'tv')
);
