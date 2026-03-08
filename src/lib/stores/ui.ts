import { writable } from 'svelte/store';

export const isMobileMenuOpen = writable<boolean>(false);
export const isSearchOverlayOpen = writable<boolean>(false);
export const currentPage = writable<string>('home');
export const scrollY = writable<number>(0);
export const isPageLoading = writable<boolean>(false);
