<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import MediaGrid from '$lib/components/MediaGrid.svelte';
  import { discoverMovies, getMovieGenres } from '$lib/api/tmdb';
  import { movieGenres } from '$lib/stores/genres';
  import { SORT_OPTIONS, type Movie, type Genre } from '$lib/types/tmdb';
  import { getYearRange } from '$lib/utils';

  let movies = $state<Movie[]>([]);
  let loading = $state(true);
  let error = $state('');
  let currentPage = $state(1);
  let totalPages = $state(0);
  let totalResults = $state(0);

  // Filters
  let selectedGenre = $state<string>('');
  let selectedYear = $state<string>('');
  let selectedSort = $state<string>('popularity.desc');

  let genres = $state<Genre[]>([]);
  const years = getYearRange();

  async function loadMovies(resetPage = false) {
    if (resetPage) currentPage = 1;
    loading = true;
    error = '';
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        sort_by: selectedSort,
      };
      if (selectedGenre) params.with_genres = selectedGenre;
      if (selectedYear) {
        params['primary_release_date.gte'] = `${selectedYear}-01-01`;
        params['primary_release_date.lte'] = `${selectedYear}-12-31`;
      }

      const data = await discoverMovies(params);
      movies = data.results;
      totalPages = Math.min(data.total_pages, 500);
      totalResults = data.total_results;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load movies';
    } finally {
      loading = false;
    }
  }

  function handleGenreChange(e: Event) {
    selectedGenre = (e.target as HTMLSelectElement).value;
    loadMovies(true);
  }

  function handleYearChange(e: Event) {
    selectedYear = (e.target as HTMLSelectElement).value;
    loadMovies(true);
  }

  function handleSortChange(e: Event) {
    selectedSort = (e.target as HTMLSelectElement).value;
    loadMovies(true);
  }

  function goToPage(p: number) {
    currentPage = p;
    loadMovies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Generate page numbers for pagination
  function getPageNumbers(current: number, total: number): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (total <= maxVisible + 2) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  }

  let pageNumbers = $derived(getPageNumbers(currentPage, totalPages));

  onMount(() => {
    // Read URL params
    const urlGenre = $page.url.searchParams.get('genre');
    const urlYear = $page.url.searchParams.get('year');
    const urlSort = $page.url.searchParams.get('sort');
    if (urlGenre) selectedGenre = urlGenre;
    if (urlYear) selectedYear = urlYear;
    if (urlSort) selectedSort = urlSort;

    movieGenres.subscribe((g) => (genres = g));
    loadMovies();
  });
</script>

<svelte:head>
  <title>Movies - CineVerse</title>
  <meta name="description" content="Browse and discover movies. Filter by genre, year, and sort by popularity, rating, and more." />
</svelte:head>

<div class="pt-20 pb-12">
  <!-- Page Header -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl md:text-4xl font-bold">Movies</h1>
        <p class="text-muted-foreground mt-1">
          {#if totalResults > 0}
            Showing {totalResults.toLocaleString()} movies
          {:else if !loading}
            No movies found
          {:else}
            Loading movies...
          {/if}
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-8">
      <!-- Genre Filter -->
      <select
        value={selectedGenre}
        onchange={handleGenreChange}
        class="px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm font-medium
          focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer appearance-none
          bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.25rem] pr-10"
        aria-label="Filter by genre"
      >
        <option value="">All Genres</option>
        {#each genres as genre}
          <option value={genre.id.toString()}>{genre.name}</option>
        {/each}
      </select>

      <!-- Year Filter -->
      <select
        value={selectedYear}
        onchange={handleYearChange}
        class="px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm font-medium
          focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer appearance-none
          bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.25rem] pr-10"
        aria-label="Filter by year"
      >
        <option value="">All Years</option>
        {#each years.filter(y => y !== '') as year}
          <option value={year}>{year}</option>
        {/each}
      </select>

      <!-- Sort -->
      <select
        value={selectedSort}
        onchange={handleSortChange}
        class="px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm font-medium
          focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer appearance-none
          bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.25rem] pr-10"
        aria-label="Sort by"
      >
        {#each SORT_OPTIONS as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>

      <!-- Reset Filters -->
      {#if selectedGenre || selectedYear || selectedSort !== 'popularity.desc'}
        <button
          type="button"
          onclick={() => { selectedGenre = ''; selectedYear = ''; selectedSort = 'popularity.desc'; loadMovies(true); }}
          class="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground
            hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Reset
        </button>
      {/if}
    </div>

    <!-- Error State -->
    {#if error}
      <div class="text-center py-12">
        <p class="text-destructive mb-4">{error}</p>
        <button
          type="button"
          onclick={() => loadMovies()}
          class="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    {:else}
      <!-- Movie Grid -->
      <MediaGrid
        items={movies}
        type="movie"
        {loading}
        skeletonCount={20}
        columns="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      />

      <!-- Pagination -->
      {#if totalPages > 1 && !loading}
        <nav class="flex items-center justify-center gap-2 mt-12" aria-label="Pagination">
          <button
            type="button"
            onclick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            class="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {#each pageNumbers as p}
            {#if p === '...'}
              <span class="px-2 text-muted-foreground">...</span>
            {:else}
              <button
                type="button"
                onclick={() => goToPage(Number(p))}
                class="w-10 h-10 rounded-lg text-sm font-medium transition-colors
                  {p === currentPage
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border hover:bg-accent'}"
                aria-label="Page {p}"
                aria-current={p === currentPage ? 'page' : undefined}
              >
                {p}
              </button>
            {/if}
          {/each}

          <button
            type="button"
            onclick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            class="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </nav>
      {/if}
    {/if}
  </div>
</div>