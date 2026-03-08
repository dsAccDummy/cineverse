<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { toggleMode, mode } from 'mode-watcher';
  import { favorites } from '$lib/stores/favorites';
  import { isMobileMenuOpen } from '$lib/stores/ui';
  import { searchMulti } from '$lib/api/tmdb';
  import { getImageUrl, debounce, getTitle } from '$lib/utils';
  import type { MediaItem } from '$lib/types/tmdb';

  let scrolled = $state(false);
  let searchInput = $state('');
  let suggestions = $state<MediaItem[]>([]);
  let showSuggestions = $state(false);
  let searchRef: HTMLDivElement;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/movies', label: 'Movies' },
    { href: '/tv', label: 'TV Shows' },
    { href: '/browse', label: 'Browse' },
  ];

  function isActive(href: string, pathname: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  const fetchSuggestions = debounce(async (query: string) => {
    if (query.length < 2) {
      suggestions = [];
      return;
    }
    try {
      const data = await searchMulti(query);
      suggestions = data.results.slice(0, 6);
      showSuggestions = true;
    } catch {
      suggestions = [];
    }
  }, 300);

  function handleSearchInput() {
    fetchSuggestions(searchInput);
  }

  function handleSearchSubmit() {
    if (searchInput.trim()) {
      showSuggestions = false;
      goto(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  }

  function handleSuggestionClick(item: MediaItem) {
    showSuggestions = false;
    searchInput = '';
    const type = 'title' in item ? 'movie' : 'name' in item && 'first_air_date' in item ? 'tv' : 'person';
    if (type === 'person') return;
    goto(`/${type}/${item.id}`);
  }

  function handleClickOutside(e: MouseEvent) {
    if (searchRef && !searchRef.contains(e.target as Node)) {
      showSuggestions = false;
    }
  }

  onMount(() => {
    const handleScroll = () => {
      scrolled = window.scrollY > 20;
    };
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  });

  let favCount = $derived($favorites.length);
</script>

<nav
  class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 {scrolled
    ? 'bg-background/80 backdrop-blur-xl shadow-lg border-b border-border/50'
    : 'bg-transparent'}"
>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <a href="/" class="flex items-center gap-2 group">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
          C
        </div>
        <span class="text-xl font-bold gradient-text hidden sm:block">CineVerse</span>
      </a>

      <!-- Desktop Nav Links -->
      <div class="hidden md:flex items-center gap-1">
        {#each navLinks as link}
          <a
            href={link.href}
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              {isActive(link.href, $page.url.pathname)
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'}"
          >
            {link.label}
          </a>
        {/each}
      </div>

      <!-- Right Section -->
      <div class="flex items-center gap-3">
        <!-- Search Bar (Desktop) -->
        <div class="hidden md:block relative" bind:this={searchRef}>
          <form onsubmit={(e) => { e.preventDefault(); handleSearchSubmit(); }}>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search movies, shows..."
                bind:value={searchInput}
                oninput={handleSearchInput}
                onfocus={() => { if (suggestions.length > 0) showSuggestions = true; }}
                class="w-64 pl-10 pr-4 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm
                  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50
                  focus:border-primary/50 transition-all"
                aria-label="Search movies and TV shows"
                aria-autocomplete="list"
              />
            </div>
          </form>

          <!-- Autocomplete Suggestions -->
          {#if showSuggestions && suggestions.length > 0}
            <div class="absolute top-full mt-2 w-96 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden z-50" role="listbox">
              {#each suggestions as item}
                <button
                  type="button"
                  class="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left"
                  onclick={() => handleSuggestionClick(item)}
                  role="option"
                >
                  <img
                    src={getImageUrl('poster_path' in item ? item.poster_path : 'profile_path' in item ? item.profile_path : null, 'w92')}
                    alt=""
                    class="w-10 h-14 rounded object-cover bg-muted flex-shrink-0"
                    loading="lazy"
                  />
                  <div class="min-w-0">
                    <p class="text-sm font-medium truncate">{getTitle(item)}</p>
                    <p class="text-xs text-muted-foreground">
                      {'title' in item ? 'Movie' : 'name' in item && 'first_air_date' in item ? 'TV Show' : 'Person'}
                      {#if 'release_date' in item && item.release_date}
                        &middot; {item.release_date.split('-')[0]}
                      {:else if 'first_air_date' in item && item.first_air_date}
                        &middot; {item.first_air_date.split('-')[0]}
                      {/if}
                    </p>
                  </div>
                  {#if 'vote_average' in item && item.vote_average > 0}
                    <span class="ml-auto text-xs font-medium text-yellow-500 flex-shrink-0">
                      ★ {item.vote_average.toFixed(1)}
                    </span>
                  {/if}
                </button>
              {/each}
              <a
                href="/search?q={encodeURIComponent(searchInput)}"
                class="block w-full p-3 text-center text-sm text-primary hover:bg-accent transition-colors border-t border-border"
              >
                View all results for "{searchInput}"
              </a>
            </div>
          {/if}
        </div>

        <!-- Favorites Link -->
        <a
          href="/favorites"
          class="relative p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Favorites"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {#if favCount > 0}
            <span class="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {favCount > 99 ? '99+' : favCount}
            </span>
          {/if}
        </a>

        <!-- Theme Toggle -->
        <button
          onclick={toggleMode}
          class="p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          {#if $mode === 'dark'}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          {:else}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          {/if}
        </button>

        <!-- Mobile Menu Toggle -->
        <button
          class="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          onclick={() => isMobileMenuOpen.update(v => !v)}
          aria-label="Toggle menu"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {#if $isMobileMenuOpen}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            {:else}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            {/if}
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile Menu -->
  {#if $isMobileMenuOpen}
    <div class="md:hidden bg-background/95 backdrop-blur-xl border-t border-border">
      <div class="px-4 py-4 space-y-2">
        <!-- Mobile Search -->
        <form onsubmit={(e) => { e.preventDefault(); handleSearchSubmit(); isMobileMenuOpen.set(false); }}>
          <div class="relative mb-4">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              bind:value={searchInput}
              class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Search"
            />
          </div>
        </form>

        {#each navLinks as link}
          <a
            href={link.href}
            onclick={() => isMobileMenuOpen.set(false)}
            class="block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
              {isActive(link.href, $page.url.pathname)
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'}"
          >
            {link.label}
          </a>
        {/each}

        <a
          href="/favorites"
          onclick={() => isMobileMenuOpen.set(false)}
          class="block px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          Favorites ({favCount})
        </a>
      </div>
    </div>
  {/if}
</nav>