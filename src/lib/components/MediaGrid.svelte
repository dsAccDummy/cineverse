<script lang="ts">
  import MovieCard from './MovieCard.svelte';
  import CardSkeleton from './CardSkeleton.svelte';
  import type { Movie, TVShow } from '$lib/types/tmdb';

  interface Props {
    items: (Movie | TVShow)[];
    type?: 'movie' | 'tv';
    loading?: boolean;
    skeletonCount?: number;
    columns?: string;
  }

  let { items, type = 'movie', loading = false, skeletonCount = 12, columns = '' }: Props = $props();

  const gridClass = $derived(
    columns || 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
  );
</script>

<div class="grid {gridClass} gap-4 md:gap-6">
  {#if loading}
    {#each Array(skeletonCount) as _, i}
      <CardSkeleton />
    {/each}
  {:else}
    {#each items as item, i (item.id)}
      <MovieCard {item} {type} index={i} />
    {/each}
  {/if}
</div>

{#if !loading && items.length === 0}
  <div class="flex flex-col items-center justify-center py-20 text-center">
    <svg class="w-16 h-16 text-muted-foreground/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
    <p class="text-muted-foreground text-lg font-medium">No results found</p>
    <p class="text-muted-foreground/70 text-sm mt-1">Try adjusting your filters or search terms</p>
  </div>
{/if}