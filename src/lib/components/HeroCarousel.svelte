<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { getImageUrl, getBackdropUrl, truncateText, formatVoteAverage, getRatingColor } from '$lib/utils';
  import { favorites } from '$lib/stores/favorites';
  import type { Movie, FavoriteItem } from '$lib/types/tmdb';

  interface Props {
    movies: Movie[];
    autoPlayInterval?: number;
  }

  let { movies, autoPlayInterval = 6000 }: Props = $props();

  let currentIndex = $state(0);
  let isTransitioning = $state(false);
  let autoPlayTimer: ReturnType<typeof setInterval>;
  let touchStartX = 0;

  const currentMovie = $derived(movies[currentIndex]);

  function goToSlide(index: number) {
    if (isTransitioning || index === currentIndex) return;
    isTransitioning = true;
    currentIndex = index;
    setTimeout(() => (isTransitioning = false), 600);
    resetAutoPlay();
  }

  function nextSlide() {
    goToSlide((currentIndex + 1) % movies.length);
  }

  function prevSlide() {
    goToSlide((currentIndex - 1 + movies.length) % movies.length);
  }

  function startAutoPlay() {
    autoPlayTimer = setInterval(nextSlide, autoPlayInterval);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  }

  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX;
  }

  function handleTouchEnd(e: TouchEvent) {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
    }
  }

  function handleToggleFavorite() {
    if (!currentMovie) return;
    const favItem: FavoriteItem = {
      id: currentMovie.id,
      type: 'movie',
      title: currentMovie.title,
      poster_path: currentMovie.poster_path,
      vote_average: currentMovie.vote_average,
      added_at: new Date().toISOString(),
    };
    favorites.toggleFavorite(favItem);
  }

  let isFav = $derived(currentMovie ? $favorites.some((f) => f.id === currentMovie.id && f.type === 'movie') : false);

  onMount(() => {
    if (movies.length > 1) startAutoPlay();
  });

  onDestroy(() => {
    clearInterval(autoPlayTimer);
  });
</script>

{#if movies.length > 0 && currentMovie}
  <div
    class="relative w-full h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden"
    ontouchstart={handleTouchStart}
    ontouchend={handleTouchEnd}
    role="region"
    aria-label="Featured movies carousel"
    aria-roledescription="carousel"
  >
    <!-- Background Image -->
    {#each movies as movie, i (movie.id)}
      {#if i === currentIndex}
        <div
          class="absolute inset-0 transition-opacity duration-700"
          class:opacity-100={i === currentIndex}
          class:opacity-0={i !== currentIndex}
        >
          <img
            src={getBackdropUrl(movie.backdrop_path, 'w1280')}
            alt=""
            class="w-full h-full object-cover"
            aria-hidden="true"
          />
          <!-- Multi-layer gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div class="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div class="absolute inset-0 bg-background/20" />
        </div>
      {/if}
    {/each}

    <!-- Content -->
    <div class="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
      <div class="max-w-2xl space-y-6">
        <!-- Badge -->
        <div class="flex items-center gap-3">
          <span class="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold border border-primary/30 backdrop-blur-sm">
            Featured
          </span>
          <span class="flex items-center gap-1 text-sm {getRatingColor(currentMovie.vote_average)}">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {formatVoteAverage(currentMovie.vote_average)}
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
          {currentMovie.title}
        </h1>

        <!-- Overview -->
        <p class="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
          {truncateText(currentMovie.overview, 200)}
        </p>

        <!-- Year & Info -->
        <div class="flex items-center gap-4 text-sm text-muted-foreground">
          {#if currentMovie.release_date}
            <span>{currentMovie.release_date.split('-')[0]}</span>
          {/if}
          <span class="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
          <span>Movie</span>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-4 pt-2">
          <button
            type="button"
            onclick={() => goto(`/movie/${currentMovie.id}`)}
            class="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold
              hover:bg-primary/90 transition-all duration-200 flex items-center gap-2
              shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View Details
          </button>

          <button
            type="button"
            onclick={handleToggleFavorite}
            class="px-6 py-3 rounded-xl border font-semibold transition-all duration-200 flex items-center gap-2
              {isFav
                ? 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20'
                : 'border-border/50 text-foreground hover:bg-accent backdrop-blur-sm'}"
          >
            <svg class="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {isFav ? 'Saved' : 'Favorite'}
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation Arrows -->
    {#if movies.length > 1}
      <button
        type="button"
        onclick={prevSlide}
        class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/50 backdrop-blur-sm
          border border-border/50 flex items-center justify-center hover:bg-background/80 transition-all
          opacity-0 hover:opacity-100 focus:opacity-100"
        aria-label="Previous slide"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        type="button"
        onclick={nextSlide}
        class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/50 backdrop-blur-sm
          border border-border/50 flex items-center justify-center hover:bg-background/80 transition-all
          opacity-0 hover:opacity-100 focus:opacity-100"
        aria-label="Next slide"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Indicators -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {#each movies as _, i}
          <button
            type="button"
            onclick={() => goToSlide(i)}
            class="transition-all duration-300 rounded-full {i === currentIndex
              ? 'w-8 h-2 bg-primary'
              : 'w-2 h-2 bg-white/30 hover:bg-white/50'}"
            aria-label="Go to slide {i + 1}"
            aria-current={i === currentIndex ? 'true' : undefined}
          />
        {/each}
      </div>
    {/if}
  </div>
{/if}
