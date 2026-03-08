<script lang="ts">
  import { favorites, favoriteMovies, favoriteTVShows, favoriteCount } from '$lib/stores/favorites';
  import { getImageUrl, formatVoteAverage, getRatingBg, getRatingColor } from '$lib/utils';
  import type { FavoriteItem } from '$lib/types/tmdb';

  let activeTab = $state<'all' | 'movies' | 'tv'>('all');
  let sortBy = $state<'added' | 'rating' | 'name'>('added');
  let confirmClear = $state(false);

  function getDisplayItems(items: FavoriteItem[], sort: string): FavoriteItem[] {
    const sorted = [...items];
    switch (sort) {
      case 'rating':
        return sorted.sort((a, b) => b.vote_average - a.vote_average);
      case 'name':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'added':
      default:
        return sorted.sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime());
    }
  }

  let filteredItems = $derived(() => {
    let items: FavoriteItem[];
    switch (activeTab) {
      case 'movies':
        items = $favoriteMovies;
        break;
      case 'tv':
        items = $favoriteTVShows;
        break;
      default:
        items = $favorites;
    }
    return getDisplayItems(items, sortBy);
  });

  function handleRemove(item: FavoriteItem) {
    favorites.removeFavorite(item.id, item.type);
  }

  function handleClearAll() {
    favorites.clearAll();
    confirmClear = false;
  }
</script>

<svelte:head>
  <title>My Favorites - CineVerse</title>
  <meta name="description" content="Your saved favorite movies and TV shows." />
</svelte:head>

<div class="pt-20 pb-12">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl md:text-4xl font-bold">My Favorites</h1>
        <p class="text-muted-foreground mt-1">
          {$favoriteCount} item{$favoriteCount !== 1 ? 's' : ''} saved
        </p>
      </div>

      {#if $favoriteCount > 0}
        <div class="flex items-center gap-3">
          <!-- Sort -->
          <select
            bind:value={sortBy}
            class="px-4 py-2 rounded-xl bg-secondary border border-border text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer appearance-none
              bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.25rem] pr-10"
            aria-label="Sort favorites"
          >
            <option value="added">Recently Added</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Alphabetical</option>
          </select>

          <!-- Clear All -->
          {#if confirmClear}
            <div class="flex items-center gap-2">
              <span class="text-sm text-destructive">Clear all?</span>
              <button
                type="button"
                onclick={handleClearAll}
                class="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90 transition-colors"
              >
                Yes, clear
              </button>
              <button
                type="button"
                onclick={() => (confirmClear = false)}
                class="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          {:else}
            <button
              type="button"
              onclick={() => (confirmClear = true)}
              class="px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground
                hover:text-destructive hover:border-destructive/50 transition-colors"
            >
              Clear All
            </button>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Tabs -->
    {#if $favoriteCount > 0}
      <div class="flex gap-2 mb-8">
        <button
          type="button"
          onclick={() => (activeTab = 'all')}
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all
            {activeTab === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary border border-border hover:bg-accent'}"
        >
          All ({$favoriteCount})
        </button>
        <button
          type="button"
          onclick={() => (activeTab = 'movies')}
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all
            {activeTab === 'movies' ? 'bg-primary text-primary-foreground' : 'bg-secondary border border-border hover:bg-accent'}"
        >
          Movies ({$favoriteMovies.length})
        </button>
        <button
          type="button"
          onclick={() => (activeTab = 'tv')}
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all
            {activeTab === 'tv' ? 'bg-primary text-primary-foreground' : 'bg-secondary border border-border hover:bg-accent'}"
        >
          TV Shows ({$favoriteTVShows.length})
        </button>
      </div>
    {/if}

    <!-- Favorites Grid -->
    {#if $favoriteCount === 0}
      <!-- Empty State -->
      <div class="text-center py-20">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <svg class="w-12 h-12 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold mb-2">No Favorites Yet</h2>
        <p class="text-muted-foreground mb-8 max-w-md mx-auto">
          Start exploring and add movies or TV shows to your favorites. They'll appear here for easy access.
        </p>
        <div class="flex items-center justify-center gap-4">
          <a
            href="/movies"
            class="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
          >
            Browse Movies
          </a>
          <a
            href="/tv"
            class="px-6 py-3 rounded-xl border border-border font-semibold hover:bg-accent transition-all"
          >
            Browse TV Shows
          </a>
        </div>
      </div>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {#each filteredItems() as item (item.id + item.type)}
          <div class="group relative flex gap-4 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg transition-all">
            <!-- Poster -->
            <a href="/{item.type}/{item.id}" class="flex-shrink-0">
              <img
                src={getImageUrl(item.poster_path, 'w185')}
                alt={item.title}
                loading="lazy"
                class="w-20 h-28 rounded-lg object-cover bg-muted group-hover:shadow-md transition-shadow"
              />
            </a>

            <!-- Info -->
            <div class="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <a href="/{item.type}/{item.id}" class="block">
                  <h3 class="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                </a>
                <div class="flex items-center gap-2 mt-1">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase {item.type === 'movie' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}">
                    {item.type === 'movie' ? 'Movie' : 'TV'}
                  </span>
                  {#if item.vote_average > 0}
                    <span class="text-xs {getRatingColor(item.vote_average)}">
                      ★ {formatVoteAverage(item.vote_average)}
                    </span>
                  {/if}
                </div>
                <p class="text-xs text-muted-foreground mt-1">
                  Added {new Date(item.added_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              <!-- Remove Button -->
              <button
                type="button"
                onclick={() => handleRemove(item)}
                class="self-start mt-2 px-3 py-1 rounded-lg text-xs font-medium text-muted-foreground
                  hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/30 transition-all"
              >
                Remove
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>