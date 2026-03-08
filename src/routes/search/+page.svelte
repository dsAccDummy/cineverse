<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { searchMulti } from '$lib/api/tmdb';
  import { getImageUrl, getTitle, getDate, formatYear, truncateText } from '$lib/utils';
  import MediaGrid from '$lib/components/MediaGrid.svelte';
  import type { Movie, TVShow, MediaItem } from '$lib/types/tmdb';

  let query = $state('');
  let results = $state<(Movie | TVShow)[]>([]);
  let loading = $state(false);
  let loadingMore = $state(false);
  let currentPage = $state(1);
  let totalPages = $state(0);
  let totalResults = $state(0);
  let error = $state('');
  let observerTarget: HTMLDivElement;

  async function performSearch(resetResults = true) {
    if (!query.trim()) return;
    if (resetResults) {
      currentPage = 1;
      results = [];
      loading = true;
    } else {
      loadingMore = true;
    }
    error = '';

    try {
      const data = await searchMulti(query, currentPage);
      const filtered = data.results.filter(
        (item): item is Movie | TVShow =>
          ('title' in item && item.title !== undefined) ||
          ('name' in item && 'first_air_date' in item)
      );

      if (resetResults) {
        results = filtered;
      } else {
        results = [...results, ...filtered];
      }
      totalPages = data.total_pages;
      totalResults = data.total_results;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Search failed';
    } finally {
      loading = false;
      loadingMore = false;
    }
  }

  function handleSubmit() {
    if (query.trim()) {
      goto(`/search?q=${encodeURIComponent(query.trim())}`, { replaceState: true });
      performSearch(true);
    }
  }

  function loadMore() {
    if (loadingMore || currentPage >= totalPages) return;
    currentPage += 1;
    performSearch(false);
  }

  onMount(() => {
    const urlQuery = $page.url.searchParams.get('q');
    if (urlQuery) {
      query = urlQuery;
      performSearch(true);
    }

    // Infinite scroll observer
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && currentPage < totalPages) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    if (observerTarget) {
      observer.observe(observerTarget);
    }

    return () => observer.disconnect();
  });
</script>

<svelte:head>
  <title>{query ? `Search: ${query}` : 'Search'} - CineVerse</title>
</svelte:head>

<div class="pt-20 pb-12">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <!-- Search Header -->
    <div class="mb-8">
      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div class="relative max-w-2xl">
          <svg class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search movies, TV shows, people..."
            bind:value={query}
            class="w-full pl-14 pr-6 py-4 rounded-2xl bg-secondary/50 border border-border/50 text-lg
              placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            aria-label="Search"
          />
        </div>
      </form>

      {#if totalResults > 0}
        <p class="text-muted-foreground mt-4">
          Found {totalResults.toLocaleString()} results for "<span class="text-foreground font-medium">{query}</span>"
        </p>
      {/if}
    </div>

    <!-- Error -->
    {#if error}
      <div class="text-center py-12">
        <p class="text-destructive mb-4">{error}</p>
        <button type="button" onclick={() => performSearch(true)}
          class="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
          Retry
        </button>
      </div>

    <!-- No query -->
    {:else if !query && !loading}
      <div class="text-center py-20">
        <svg class="w-20 h-20 mx-auto text-muted-foreground/20 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h2 class="text-2xl font-bold mb-2">Search CineVerse</h2>
        <p class="text-muted-foreground">Find your favorite movies, TV shows, and more</p>
      </div>

    <!-- Results -->
    {:else}
      <MediaGrid
        items={results}
        type="movie"
        {loading}
        skeletonCount={20}
        columns="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      />

      <!-- Infinite Scroll Trigger -->
      <div bind:this={observerTarget} class="h-4" />

      <!-- Loading More Indicator -->
      {#if loadingMore}
        <div class="flex items-center justify-center py-8 gap-3">
          <div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span class="text-muted-foreground text-sm">Loading more results...</span>
        </div>
      {/if}

      <!-- End of Results -->
      {#if !loading && !loadingMore && results.length > 0 && currentPage >= totalPages}
        <div class="text-center py-8">
          <p class="text-muted-foreground text-sm">You've reached the end of results</p>
        </div>
      {/if}

      <!-- No Results -->
      {#if !loading && results.length === 0 && query}
        <div class="text-center py-20">
          <svg class="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 class="text-xl font-bold mb-2">No results found</h2>
          <p class="text-muted-foreground">No movies or TV shows match "{query}". Try a different search term.</p>
        </div>
      {/if}
    {/if}
  </div>
</div>
