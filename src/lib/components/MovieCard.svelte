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

<button
  type="button"
  class="group relative flex flex-col rounded-xl overflow-hidden bg-card border border-border/50
    hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300
    cursor-pointer text-left w-full"
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
  onclick={navigateToDetail}
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
        {isFav ? 'bg-red-500/80 text-white' : 'bg-black/40 text-white/70 hover:text-white hover:bg-black/60'}"
      onclick={handleToggleFavorite}
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg class="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>

    <!-- Hover Info Overlay -->
    <div class="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
      <p class="text-white/90 text-xs line-clamp-3">{truncateText(item.overview, 120)}</p>
    </div>
  </div>

  <!-- Card Body -->
  <div class="p-3 flex-1 flex flex-col gap-1">
    <h3 class="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
      {title}
    </h3>
    <div class="flex items-center gap-2 text-xs text-muted-foreground">
      <span>{year}</span>
      {#if genreNames.length > 0}
        <span class="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
        <span class="truncate">{genreNames.join(', ')}</span>
      {/if}
    </div>
  </div>
</button>