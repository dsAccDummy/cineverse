<script lang="ts">
  import MovieCard from './MovieCard.svelte';
  import CardSkeleton from './CardSkeleton.svelte';
  import type { Movie, TVShow } from '$lib/types/tmdb';

  interface Props {
    items: (Movie | TVShow)[];
    type?: 'movie' | 'tv';
    loading?: boolean;
  }

  let { items, type = 'movie', loading = false }: Props = $props();

  let scrollContainer: HTMLDivElement;
  let canScrollLeft = $state(false);
  let canScrollRight = $state(true);

  function scroll(direction: 'left' | 'right') {
    if (!scrollContainer) return;
    const scrollAmount = scrollContainer.clientWidth * 0.8;
    scrollContainer.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }

  function updateScrollButtons() {
    if (!scrollContainer) return;
    canScrollLeft = scrollContainer.scrollLeft > 10;
    canScrollRight =
      scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth - 10;
  }
</script>

<div class="relative group/scroll">
  <!-- Scroll Buttons -->
  {#if canScrollLeft}
    <button
      type="button"
      onclick={() => scroll('left')}
      class="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-border shadow-lg
        flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-accent -ml-3"
      aria-label="Scroll left"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  {/if}

  {#if canScrollRight}
    <button
      type="button"
      onclick={() => scroll('right')}
      class="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-border shadow-lg
        flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-accent -mr-3"
      aria-label="Scroll right"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  {/if}

  <!-- Scrollable Container -->
  <div
    bind:this={scrollContainer}
    onscroll={updateScrollButtons}
    class="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
    style="scrollbar-width: none; -ms-overflow-style: none;"
  >
    {#if loading}
      {#each Array(8) as _}
        <div class="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] snap-start">
          <CardSkeleton />
        </div>
      {/each}
    {:else}
      {#each items as item, i (item.id)}
        <div class="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] snap-start">
          <MovieCard {item} {type} index={i} />
        </div>
      {/each}
    {/if}
  </div>
</div>