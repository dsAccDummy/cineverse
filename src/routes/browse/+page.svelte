<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { allGenres, GENRE_ICONS } from '$lib/stores/genres';
  import { searchMulti } from '$lib/api/tmdb';
  import { getTrendingAll } from '$lib/api/tmdb';
  import { getImageUrl, getTitle, debounce } from '$lib/utils';
  import MediaGrid from '$lib/components/MediaGrid.svelte';
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import type { MediaItem, Movie, TVShow } from '$lib/types/tmdb';

  let searchInput = $state('');
  let searchResults = $state<MediaItem[]>([]);
  let isSearching = $state(false);
  let trending = $state<(Movie | TVShow)[]>([]);
  let loadingTrending = $state(true);

  const performSearch = debounce(async (query: string) => {
    if (query.length < 2) {
      searchResults = [];
      isSearching = false;
      return;
    }
    isSearching = true;
    try {
      const data = await searchMulti(query);
      searchResults = data.results.filter(
        (item): item is Movie | TVShow => 'title' in item || ('name' in item && 'first_air_date' in item)
      );
    } catch {
      searchResults = [];
    } finally {
      isSearching = false;
    }
  }, 400);

  function handleInput() {
    performSearch(searchInput);
  }

  function handleSubmit() {
    if (searchInput.trim()) {
      goto(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  }

  function navigateToGenre(genreId: number, genreName: string) {
    goto(`/movies?genre=${genreId}`);
  }

  onMount(async () => {
    try {
      const data = await getTrendingAll('week');
      trending = data.results.filter(
        (item): item is Movie | TVShow => 'title' in item || ('name' in item && 'first_air_date' in item)
      ).slice(0, 12);
    } catch {
      console.error('Failed to load trending');
    } finally {
      loadingTrending = false;
    }
  });
</script>

<svelte:head>
  <title>Browse - CineVerse</title>
  <meta name="description" content="Browse movies and TV shows by genre. Search for your favorites." />
</svelte:head>

<div class="pt-20 pb-12">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <!-- Search Hero -->
    <div class="relative py-16 text-center">
      <div class="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent rounded-3xl" />
      <div class="relative">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Browse</h1>
        <p class="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
          Search across thousands of movies and TV shows, or explore by genre
        </p>

        <!-- Search Box -->
        <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="max-w-2xl mx-auto">
          <div class="relative">
            <svg class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search for movies, TV shows, people..."
              bind:value={searchInput}
              oninput={handleInput}
              class="w-full pl-14 pr-6 py-4 rounded-2xl bg-secondary/50 border border-border/50 text-lg
                placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50
                focus:border-primary/50 transition-all"
              aria-label="Search movies and TV shows"
            />
            {#if isSearching}
              <div class="absolute right-5 top-1/2 -translate-y-1/2">
                <div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            {/if}
          </div>
        </form>
      </div>
    </div>

    <!-- Search Results (inline preview) -->
    {#if searchInput.length >= 2 && searchResults.length > 0}
      <section class="mb-16">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold">Search Results</h2>
          <a
            href="/search?q={encodeURIComponent(searchInput)}"
            class="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all results
          </a>
        </div>
        <MediaGrid
          items={searchResults.slice(0, 6) as (Movie | TVShow)[]}
          type="movie"
          columns="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        />
      </section>
    {/if}

    <!-- Genre Grid -->
    <section class="mb-16">
      <SectionHeader title="Explore by Genre" subtitle="Find movies and shows in your favorite categories" />

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {#each $allGenres as genre (genre.id)}
          <button
            type="button"
            onclick={() => navigateToGenre(genre.id, genre.name)}
            class="group relative p-6 rounded-xl border border-border/50 bg-card hover:bg-accent
              hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5
              transition-all duration-300 text-left overflow-hidden"
          >
            <!-- Background gradient on hover -->
            <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div class="relative">
              <span class="text-2xl mb-2 block" aria-hidden="true">
                {GENRE_ICONS[genre.id] || '🎬'}
              </span>
              <h3 class="font-semibold text-sm group-hover:text-primary transition-colors">
                {genre.name}
              </h3>
            </div>

            <!-- Arrow indicator -->
            <svg class="absolute bottom-3 right-3 w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 transition-all group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        {/each}
      </div>

      {#if $allGenres.length === 0}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {#each Array(15) as _}
            <div class="h-24 rounded-xl shimmer" />
          {/each}
        </div>
      {/if}
    </section>

    <!-- Trending Section -->
    <section>
      <SectionHeader title="Trending This Week" subtitle="Popular across movies and TV" />
      <MediaGrid
        items={trending}
        type="movie"
        loading={loadingTrending}
        skeletonCount={12}
        columns="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      />
    </section>

  </div>
</div>
