<script lang="ts">
  import { goto } from '$app/navigation';
  import { favorites } from '$lib/stores/favorites';
  import { allGenres } from '$lib/stores/genres';
  import { getImageUrl, formatVoteAverage, getRatingBg, getTitle, getDate, formatYear, truncateText, getGenreNames } from '$lib/utils';
  import { getGenreNames as getGenreNamesFn } from '$lib/stores/genres';
  import type { Movie, TVShow, FavoriteItem } from '$lib/types/tmdb';

  interface Props {
    item: Movie | TVShow;
    type?: 'movie' | 'tv';
    index?: number;
  }

  let { item, type = 'movie', index = 0 }: Props = $props();

  let isHovered = $state(false);
  let imageLoaded = $state(false);

  const title = $derived(getTitle(item));
  const date = $derived(getDate(item));
  const year = $derived(formatYear(date));
  const rating = $derived(formatVoteAverage(item.vote_average));
  const ratingBg = $derived(getRatingBg(item.vote_average));
  const posterUrl = $derived(getImageUrl(item.poster_path, 'w342'));
  const genreNames = $derived(getGenreNamesFn(item.genre_ids, $allGenres).slice(0, 2));

  function navigateToDetail() {
    goto(`/${type}/${item.id}`);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigateToDetail();
    }
  }

  function handleToggleFavorite(e: MouseEvent) {
    e.stopPropagation();
    const favItem: FavoriteItem = {
      id: item.id,
      type,
      title,
      poster_path: item.poster_path,
      vote_average: item.vote_average,
      added_at: new Date().toISOString(),
    };
    favorites.toggleFavorite(favItem);
  }

  let isFav = $derived($favorites.some((f) => f.id === item.id && f.type === type));
</script>

<div
  role="button"
  tabindex="0"
  class="group relative flex flex-col rounded-xl overflow-hidden bg-card border border-border/50
    hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300
    cursor-pointer text-left w-full card-animate"
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
  onclick={navigateToDetail}
  onkeydown={handleKeydown}
  style="animation-delay: {index * 50}ms"
  aria-label="View details for {title}"
>
  <!-- Poster Image -->
  <div class="relative aspect-[2/3] overflow-hidden bg-muted">
    <img
      src={posterUrl}
      alt={title}
      loading="lazy"
      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      class:opacity-0={!imageLoaded}
      class:opacity-100={imageLoaded}
      onload={() => (imageLoaded = true)}
    />

    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    <!-- Rating Badge -->
    <div class="absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-bold border {ratingBg} backdrop-blur-sm">
      <span class="text-white">★ {rating}</span>
    </div>

    <!-- Favorite Button -->
    <button
      type="button"
      class="absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-all duration-200
        {isFav ? 'bg-red-500/80 text-white' : 'bg-black/40 text-white/70 hover:text-red-400'}"
      onclick={handleToggleFavorite}
      aria-label={isFav ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
    >
      <svg class="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21.172 6.852A5.08 5.08 0 0 0 19.124 5.8 5.08 5.08 0 0 0 15.155 8l-.035.036 6.052 5.25-.025.025M2.828 17.148a5.08 5.08 0 0 0 6.969-.148L12 14.8l2.202 2.2a5.08 5.08 0 1 0 6.97-.148l-6.952-7.204a5.079 5.079 0 0 0-6.392 0L2.828 17.148Z"></path>
      </svg>
    </button>
  </div>

  <!-- Content -->
  <div class="p-3 flex flex-col gap-1 flex-1">
    <h3 class="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
      {title}
    </h3>

    {#if year || genreNames.length > 0}
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        {#if year}
          <span>{year}</span>
        {/if}
        {#if year && genreNames.length > 0}
          <span class="text-border">•</span>
        {/if}
        {#if genreNames.length > 0}
          <span class="truncate">{genreNames.join(', ')}</span>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .card-animate {
    animation: fadeInUp 0.3s ease-out both;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
