import { writable } from 'svelte/store';
import type { MediaItem } from '$lib/types/tmdb';

export const searchQuery = writable<string>('');
export const searchResults = writable<MediaItem[]>([]);
export const isSearching = writable<boolean>(false);
export const searchPage = writable<number>(1);
export const searchTotalPages = writable<number>(0);
export const searchTotalResults = writable<number>(0);
